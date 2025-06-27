from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
from PIL import Image
import fitz  # PyMuPDF
import logging

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # CORSを有効化

# Tesseractの設定（複数のパスを試行）
TESSERACT_PATHS = [
    '/usr/local/bin/tesseract',
    '/opt/homebrew/bin/tesseract',
    '/usr/bin/tesseract',
    'tesseract'  # PATHから検索
]

def find_tesseract():
    """Tesseractの実行ファイルを探す"""
    for path in TESSERACT_PATHS:
        if os.path.exists(path) or os.system(f'which {path} > /dev/null 2>&1') == 0:
            logger.info(f"Tesseract found at: {path}")
            return path
    return None

# Tesseractのパスを設定
tesseract_path = find_tesseract()
if tesseract_path:
    try:
        import pytesseract
        pytesseract.pytesseract.tesseract_cmd = tesseract_path
        TESSERACT_AVAILABLE = True
        logger.info("Tesseract OCR is available")
    except ImportError:
        TESSERACT_AVAILABLE = False
        logger.warning("pytesseract is not installed")
else:
    TESSERACT_AVAILABLE = False
    logger.warning("Tesseract is not installed or not found in PATH")

def extract_text_from_image(image_path):
    """画像からテキストを抽出"""
    try:
        if not TESSERACT_AVAILABLE:
            logger.warning("Tesseract not available, returning guidance message")
            return """【画像ファイル - OCR処理不可】

この画像ファイルは正常にアップロードされましたが、OCR処理にはTesseractのインストールが必要です。

📋 現在利用可能な機能:
✅ PDFファイルのテキスト抽出（PyMuPDF）
❌ 画像ファイルのOCR処理（Tesseract未インストール）

💡 推奨事項:
• PDFファイルをご利用ください（テキスト抽出が可能です）
• または、画像をPDFに変換してからアップロードしてください

🔧 Tesseractのインストール方法:
• Homebrew: brew install tesseract
• または、公式サイトから手動インストール"""
        
        # PILで画像を開く
        image = Image.open(image_path)
        
        # OCR実行（日本語）
        text = pytesseract.image_to_string(image, lang='jpn')
        
        return text.strip()
    except Exception as e:
        logger.error(f"画像OCRエラー: {e}")
        return f"【OCR処理エラー】画像のテキスト抽出中にエラーが発生しました: {str(e)}"

def extract_text_from_pdf(pdf_path):
    """PDFからテキストを抽出"""
    try:
        logger.info(f"PDFテキスト抽出開始: {pdf_path}")
        # PyMuPDFでPDFを開く
        doc = fitz.open(pdf_path)
        logger.info(f"PDFページ数: {len(doc)}")
        text = ""
        
        # 各ページからテキストを抽出
        for page_num in range(len(doc)):
            logger.info(f"ページ {page_num + 1} を処理中...")
            page = doc.load_page(page_num)
            page_text = page.get_text()
            text += page_text
            logger.info(f"ページ {page_num + 1} 完了: {len(page_text)} 文字")
        
        doc.close()
        logger.info(f"PDFテキスト抽出完了: {len(text)} 文字")
        
        # テキストが空の場合のメッセージ
        if not text.strip():
            return """【PDFファイル - テキスト抽出不可】

このPDFファイルは正常にアップロードされましたが、テキスト抽出ができませんでした。

📋 考えられる原因:
• スキャンされたPDF（画像ベース）
• テキストが埋め込まれていないPDF
• 特殊なフォントやレイアウト

💡 推奨事項:
• テキストが選択可能なPDFをご利用ください
• または、画像をPDFに変換してからアップロードしてください

🔧 OCR処理について:
• TesseractがインストールされていればOCR処理が可能です"""
        
        return text.strip()
    except Exception as e:
        logger.error(f"PDFテキスト抽出エラー: {e}")
        raise

def extract_text_from_pdf_with_ocr(pdf_path):
    """PDFを画像に変換してOCR実行"""
    try:
        if not TESSERACT_AVAILABLE:
            logger.warning("Tesseract not available, skipping OCR for PDF")
            return "【PDFファイル】このPDFファイルは正常にアップロードされましたが、OCR処理にはTesseractのインストールが必要です。テキスト抽出のみが利用可能です。"
        
        logger.info(f"PDF OCR処理開始: {pdf_path}")
        # PyMuPDFでPDFを開く
        doc = fitz.open(pdf_path)
        logger.info(f"PDFページ数: {len(doc)}")
        text = ""
        
        # 各ページを画像に変換してOCR
        for page_num in range(len(doc)):
            logger.info(f"ページ {page_num + 1} を画像変換中...")
            page = doc.load_page(page_num)
            
            # ページを画像に変換（高解像度）
            mat = fitz.Matrix(2.0, 2.0)  # 2倍の解像度
            pix = page.get_pixmap(matrix=mat)
            
            # 一時ファイルに保存
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                pix.save(tmp_file.name)
                tmp_path = tmp_file.name
            
            logger.info(f"ページ {page_num + 1} 画像保存完了: {tmp_path}")
            
            try:
                # OCR実行
                logger.info(f"ページ {page_num + 1} OCR実行中...")
                page_text = extract_text_from_image(tmp_path)
                text += f"\n--- ページ {page_num + 1} ---\n{page_text}\n"
                logger.info(f"ページ {page_num + 1} OCR完了: {len(page_text)} 文字")
            finally:
                # 一時ファイルを削除
                try:
                    os.unlink(tmp_path)
                    logger.info(f"一時ファイル削除完了: {tmp_path}")
                except Exception as e:
                    logger.warning(f"一時ファイル削除失敗: {e}")
        
        doc.close()
        logger.info(f"PDF OCR処理完了: {len(text)} 文字")
        return text.strip()
    except Exception as e:
        logger.error(f"PDF OCRエラー: {e}")
        raise

@app.route('/ocr', methods=['POST'])
def ocr_endpoint():
    """OCR処理のメインエンドポイント"""
    try:
        logger.info("OCRリクエスト受信")
        
        # ファイルの確認
        if 'file' not in request.files:
            logger.error("ファイルがアップロードされていません")
            return jsonify({'error': 'ファイルがアップロードされていません'}), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.error("ファイルが選択されていません")
            return jsonify({'error': 'ファイルが選択されていません'}), 400
        
        logger.info(f"ファイル受信: {file.filename}, サイズ: {file.content_length if hasattr(file, 'content_length') else 'unknown'}")
        
        # ファイルサイズチェック（25MB制限）
        file.seek(0, 2)  # ファイルの末尾に移動
        file_size = file.tell()
        file.seek(0)  # ファイルの先頭に戻る
        
        logger.info(f"ファイルサイズ: {file_size} bytes")
        
        if file_size > 25 * 1024 * 1024:
            logger.error("ファイルサイズが大きすぎます")
            return jsonify({'error': 'ファイルサイズが大きすぎます（25MB以下にしてください）'}), 400
        
        # ファイル形式チェック
        filename = file.filename.lower()
        is_pdf = filename.endswith('.pdf')
        is_image = filename.endswith(('.jpg', '.jpeg', '.png', '.gif', '.bmp'))
        
        logger.info(f"ファイル形式: PDF={is_pdf}, 画像={is_image}")
        
        if not (is_pdf or is_image):
            logger.error("サポートされていないファイル形式")
            return jsonify({'error': 'サポートされていないファイル形式です'}), 400
        
        # 一時ファイルに保存
        logger.info("一時ファイルに保存中...")
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp_file:
            file.save(tmp_file.name)
            temp_path = tmp_file.name
        
        logger.info(f"一時ファイル保存完了: {temp_path}")
        
        try:
            # OCR処理
            if is_pdf:
                logger.info("PDF処理開始")
                # PDFの場合：まずテキスト抽出を試行、失敗したらOCR
                try:
                    logger.info("PDFテキスト抽出を試行")
                    text = extract_text_from_pdf(temp_path)
                    if not text.strip():
                        logger.info("テキスト抽出失敗、OCR実行")
                        # テキストが抽出できない場合はOCR実行
                        text = extract_text_from_pdf_with_ocr(temp_path)
                    else:
                        logger.info("PDFテキスト抽出成功")
                except Exception as e:
                    logger.warning(f"PDFテキスト抽出失敗、OCR実行: {e}")
                    text = extract_text_from_pdf_with_ocr(temp_path)
            else:
                logger.info("画像OCR処理開始")
                # 画像の場合：OCR実行
                text = extract_text_from_image(temp_path)
            
            logger.info(f"OCR処理完了: {len(text)} 文字")
            
            # 結果を返す
            return jsonify({
                'success': True,
                'text': text,
                'file_type': 'pdf' if is_pdf else 'image',
                'file_name': filename
            })
            
        finally:
            # 一時ファイルを削除
            try:
                os.unlink(temp_path)
                logger.info("一時ファイル削除完了")
            except Exception as e:
                logger.warning(f"一時ファイル削除失敗: {e}")
            
    except Exception as e:
        logger.error(f"OCR処理エラー: {e}")
        return jsonify({'error': f'OCR処理に失敗しました: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """ヘルスチェックエンドポイント"""
    return jsonify({'status': 'healthy', 'message': 'OCR server is running'})

if __name__ == '__main__':
    # 開発用サーバー起動
    app.run(host='0.0.0.0', port=5000, debug=True) 