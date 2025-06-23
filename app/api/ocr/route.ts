import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createWorker } from 'tesseract.js';
import { supabase } from '@/lib/supabase';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ファイルアップロード処理
async function handleFileUpload(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルがアップロードされていません' },
        { status: 400 }
      );
    }

    // ファイルサイズチェック（10MB制限）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'ファイルサイズが大きすぎます（10MB以下にしてください）' },
        { status: 400 }
      );
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `サポートされていないファイル形式です。現在サポートされている形式: JPEG、PNG、GIF。PDFファイルは現在サポートされていません。` },
        { status: 400 }
      );
    }

    // 一時ファイルとして保存
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    const tempFilePath = join(tmpdir(), `ocr-${Date.now()}-${file.name}`);
    await writeFile(tempFilePath, buffer);

    return { file, tempFilePath, buffer };
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'ファイルアップロードに失敗しました' },
      { status: 500 }
    );
  }
}

// OCR処理（Tesseract.js）
async function performOCR(filePath: string, fileType: string): Promise<string> {
  try {
    const worker = await createWorker('jpn'); // 日本語対応
    
    let result;
    if (fileType === 'application/pdf') {
      // PDFの場合は現在サポートされていません
      throw new Error('PDFファイルは現在サポートされていません。画像ファイル（JPEG、PNG）をご利用ください。');
    } else {
      // 画像ファイルの処理
      result = await worker.recognize(filePath);
    }
    
    await worker.terminate();
    
    // 一時ファイルを削除
    try {
      await unlink(filePath);
    } catch (e) {
      console.warn('Failed to delete temp file:', e);
    }
    
    return result.data.text;
  } catch (error) {
    console.error('OCR error:', error);
    throw error; // 元のエラーをそのまま投げる
  }
}

// GPT APIでテキストを構造化
async function structureTextWithGPT(text: string) {
  try {
    const prompt = `
あなたは、日本の不動産管理における経費処理を支援するAIアシスタントです。
以下のテキストは、領収書、請求書、または納税通知書からOCRで抽出されたものです。
このテキストから、以下の情報を厳密にJSON形式で抽出してください。

amount: 金額 (数値のみ、円単位)
date: 日付 (YYYY-MM-DD形式)
vendor: 業者名・支払先
category: 以下のカテゴリから最も適切なものを1つ選択してください: ['修繕費', '清掃費', '保守点検', '保険料', '税金', '管理費', '広告費', '光熱費', '設備費', 'その他']
description: 摘要・内容 (簡潔に)
propertyName: 関連する物件名 (不明な場合はnull、複数の場合は配列)
confidence: 信頼度 (0-100の数値)

不明な項目はnullにしてください。推測ではなく、テキストから明確に読み取れる情報のみを抽出してください。

テキスト:
${text}

JSON出力:
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたは領収書や請求書のテキストを解析する専門家です。正確で構造化されたデータを提供してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('GPT APIからの応答がありません');
    }

    // JSONレスポンスをパース
    const parsedData = JSON.parse(response);
    
    return {
      success: true,
      data: parsedData,
      originalText: text
    };

  } catch (error) {
    console.error('GPT API error:', error);
    throw new Error('テキストの構造化に失敗しました');
  }
}

// データベースに保存
async function saveToDatabase(fileName: string, extractedData: any, rawText: string) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          property_id: 1, // デフォルト値、後で改善
          type: 'receipt',
          filename: fileName,
          file_url: '', // 実際の実装ではファイルをSupabase Storageに保存
          ocr_data: { rawText },
          extracted_data: extractedData
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Database save error:', error);
    throw new Error('データベースへの保存に失敗しました');
  }
}

export async function POST(request: NextRequest) {
  try {
    // ファイルアップロード処理
    const uploadResult = await handleFileUpload(request);
    if (uploadResult instanceof NextResponse) {
      return uploadResult;
    }
    
    const { file, tempFilePath } = uploadResult;

    // OCR処理
    const ocrText = await performOCR(tempFilePath, file.type);
    
    if (!ocrText || ocrText.trim().length === 0) {
      return NextResponse.json(
        { error: 'テキストを抽出できませんでした' },
        { status: 400 }
      );
    }

    // GPT APIで構造化
    const structuredData = await structureTextWithGPT(ocrText);
    
    // データベースに保存
    const savedDocument = await saveToDatabase(
      file.name, 
      structuredData.data, 
      ocrText
    );

    return NextResponse.json({
      success: true,
      data: {
        id: savedDocument.id,
        fileName: file.name,
        fileType: file.type.includes('image') ? 'image' : 'pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'completed',
        extractedData: structuredData.data,
        rawText: ocrText
      }
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'OCR処理に失敗しました',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
} 