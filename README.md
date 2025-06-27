# 高橋ホーム 不動産管理システム

Next.js 13 (App Router) と Supabase をバックエンドに利用し、AI/OCR連携（Python + Tesseract）も組み込んだ不動産管理システムです。

## アーキテクチャ

- **フロントエンド**: Next.js 13 (App Router)
- **バックエンド**: Python Flask (OCR処理)
- **データベース**: Supabase (PostgreSQL)
- **ストレージ**: Supabase Storage
- **OCR**: Tesseract + PyMuPDF

## セットアップ

### 1. 環境変数の設定

`.env.local` ファイルを作成し、以下の内容を設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=あなたのSupabaseプロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたのSupabase匿名APIキー

# OpenAI
OPENAI_API_KEY=あなたのOpenAI APIキー

# Python OCR Server
PYTHON_SERVER_URL=http://localhost:5000
```

### 2. 依存関係のインストール

#### Next.js アプリケーション
```bash
npm install
```

#### Python OCR サーバー
```bash
# 起動スクリプトを実行（初回のみ）
./start_ocr_server.sh
```

または手動で：
```bash
# Python仮想環境の作成
python3 -m venv venv
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt

# Tesseractのインストール
brew install tesseract
brew install tesseract-lang  # 日本語言語パック
```

### 3. データベースのセットアップ

Supabaseで以下のSQLを実行してください：

```sql
-- supabase-schema.sql の内容を実行
```

### 4. アプリケーションの起動

#### Python OCR サーバー
```bash
./start_ocr_server.sh
```

#### Next.js アプリケーション
```bash
npm run dev
```

## 機能

### OCR機能
- **画像ファイル**: JPEG, PNG, GIF, BMP
- **PDFファイル**: テキスト抽出 + OCR処理
- **日本語対応**: Tesseract日本語パック使用
- **自動保存**: Supabase Storage + Database

### 物件管理
- 物件情報の登録・編集・削除
- 収支データの管理
- 文書管理（OCR結果含む）

## 技術スタック

### フロントエンド
- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form

### バックエンド
- Python Flask
- Tesseract OCR
- PyMuPDF (PDF処理)
- Pillow (画像処理)

### データベース
- Supabase (PostgreSQL)
- Supabase Storage

## 開発

### ディレクトリ構造
```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   └── ...
├── components/            # React コンポーネント
├── lib/                  # ユーティリティ
├── ocr_server.py         # Python OCR サーバー
├── requirements.txt      # Python 依存関係
└── start_ocr_server.sh   # OCR サーバー起動スクリプト
```

### デバッグ

#### Python OCR サーバー
```bash
# ログレベルを変更
export FLASK_ENV=development
python ocr_server.py
```

#### Next.js アプリケーション
```bash
# 開発モードで起動
npm run dev
```

## デプロイ

### Vercel (Next.js)
1. Vercelにプロジェクトを接続
2. 環境変数を設定
3. デプロイ

### Python OCR サーバー
- Railway, Heroku, AWS EC2 などでデプロイ可能
- 環境変数 `PYTHON_SERVER_URL` を本番URLに更新

## ライセンス

MIT License