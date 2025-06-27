import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { protos } from '@google-cloud/vision';

export const dynamic = 'force-dynamic';

// Google Cloud Vision API クライアントの初期化
// GOOGLE_APPLICATION_CREDENTIALS環境変数が設定されている必要があります
const visionClient = new ImageAnnotatorClient();

// OpenAIクライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Google Cloud Vision APIを使用して、画像またはPDFからテキストを抽出します。
 * @param fileBuffer - ファイルのBuffer
 * @param mimeType - ファイルのMIMEタイプ
 * @returns 抽出されたテキスト
 */
async function performOcrWithVision(fileBuffer: Buffer, mimeType: string): Promise<string> {
  try {
    let fullTextAnnotationText: string | null | undefined = null;

    // PDFの場合はbatchAnnotateFilesを、画像の場合はdocumentTextDetectionを使用
    if (mimeType === 'application/pdf') {
      const request: protos.google.cloud.vision.v1.IBatchAnnotateFilesRequest = {
        requests: [
          {
            inputConfig: {
              content: new Uint8Array(fileBuffer),
              mimeType: mimeType,
            },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
            // 大規模なPDFの処理時間とコストを考慮し、最初の5ページに制限
            pages: [1, 2, 3, 4, 5],
          },
        ],
      };
      
      const [result] = await visionClient.batchAnnotateFiles(request);
      const responses = result.responses?.[0].responses;
      
      if (!responses || responses.length === 0) {
        throw new Error('Vision API (batch) から無効なレスポンスが返されました。');
      }
      
      // 全ページのテキストを結合
      fullTextAnnotationText = responses.map((response: protos.google.cloud.vision.v1.IAnnotateImageResponse) => response.fullTextAnnotation?.text).join('\n');
    } else {
      const request = {
        image: {
          content: fileBuffer.toString('base64'),
        },
      };
      const [result] = await visionClient.documentTextDetection(request);
      fullTextAnnotationText = result.fullTextAnnotation?.text;
    }

    if (!fullTextAnnotationText) {
      throw new Error('Google Cloud Vision APIからテキストを抽出できませんでした。');
    }
    
    return fullTextAnnotationText;
  } catch (error) {
    console.error('Google Cloud Vision API error:', error);
    if (error instanceof Error) {
        console.error('Vision API Error Details:', error.message);
    }
    throw new Error('OCR処理中にエラーが発生しました。');
  }
}

/**
 * OpenAI GPT-4を使用して、抽出されたテキストを構造化データに変換します。
 * @param text - OCRで抽出されたテキスト
 * @returns 構造化されたデータと元のテキスト
 */
async function structureTextWithGPT(text: string) {
  const prompt = `
あなたは日本の不動産管理における家賃精算書のOCRテキストから、契約者ごとの家賃情報を正確に抽出するAIアシスタントです。

【抽出仕様】
- 物件名（propertyName）は「シャンテタカセ」など明細上部や【物件名】欄から取得
- contracts配列には、各契約者ごとに以下を含める:
  - room_no: 部屋番号（例: "101", "P10", "2A" など、数字・英字・記号を含む全ての部屋番号を抽出）
  - tenant_name: 契約者名
  - amount: その月の請求合計（家賃・共益費・水道代など毎月の請求合計。控除・空室・管理料・備考・敷金・礼金・修繕費・振込手数料・消費税・町会費・CATV・その他一時的な費用は除外。金額が書かれていない場合はnullまたは空欄でよい）
  - date: 対象年月（「2025年6月」や「2025年6月4日」などからYYYY-MM形式で抽出。不明な場合はnull）
- 空室や控除項目、備考、管理料、敷金、礼金、修繕費、振込手数料、消費税、町会費、CATV、その他一時的な費用は除外
- 1契約者に複数の明細がある場合は合算して1件にまとめる
- 物件名・部屋No・契約者名・合計金額・対象年月以外は抽出しない
- JSON以外のテキストは絶対に含めない

【出力例】
{
  "propertyName": "シャンテタカセ",
  "contracts": [
    { "room_no": "101", "tenant_name": "福井県立病院", "amount": 62000, "date": "2025-06" },
    { "room_no": "P10", "tenant_name": "サンプル契約者", "amount": null, "date": "2025-06" }
    // ...
  ]
}

【OCRテキスト】
${text}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたは家賃明細や契約一覧のテキストを解析し、指定された形式でJSONオブジェクトのみを返す専門家です。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    let response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('GPT APIからの応答がありません');
    }
    if (response.startsWith('```json')) {
      response = response.substring(7, response.length - 3).trim();
    }
    const parsedData = JSON.parse(response);
    return {
      success: true,
      data: parsedData,
      originalText: text
    };
  } catch (error) {
    console.error('GPT API error:', error);
    throw new Error('テキストの構造化に失敗しました。');
  }
}

/**
 * 物件名からproperty_idを解決します。
 * @param propertyName - 物件名
 * @param defaultPropertyId - デフォルトの物件ID
 * @returns 解決された物件ID
 */
async function resolvePropertyId(propertyName: string | null, defaultPropertyId: number): Promise<number> {
  if (propertyName) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id')
        .ilike('name', `%${propertyName}%`)
        .limit(1)
        .single();

      if (!error && data) {
        return data.id;
      }
    } catch (error) {
      console.warn('Property search failed, using default:', error);
    }
  }
  return defaultPropertyId;
}

/**
 * 文書情報と経費情報をデータベースに保存します。
 * @param originalText - OCRで抽出された元のテキスト
 * @param structuredData - GPTで構造化されたデータ
 * @param propertyId - 解決済みの物件ID
 * @param fileUrl - アップロードされたファイルのURL
 * @param fileName - ファイル名
 * @returns 保存された文書と経費の情報
 */
async function saveToDatabaseAndExpenses(
  originalText: string,
  structuredData: any,
  propertyId: number,
  fileUrl: string,
  fileName: string
) {
  try {
    // 1. 文書情報をdocumentsテーブルに保存
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        property_id: propertyId,
        filename: fileName,
        file_url: fileUrl,
        extracted_text: originalText,
        extracted_data: structuredData,
        status: 'processed',
        type: 'receipt',
      })
      .select()
      .single();

    if (documentError) {
      console.error('Document save error:', documentError);
      throw new Error(`文書情報の保存に失敗しました: ${documentError.message}`);
    }

    // 2. contracts配列があればexpensesテーブルに複数行保存
    let expenses = [];
    console.log('Hogehoge', structuredData);
    if (structuredData && Array.isArray(structuredData.contracts)) {
      console.log('DEBUG contracts:', structuredData.contracts);
      for (const contract of structuredData.contracts) {
        // 必須項目チェック: room_no, tenant_nameのみ必須
        if (!contract.room_no || !contract.tenant_name) {
          console.error('OCR契約データに必須項目が不足:', contract);
          continue;
        }
        // 日付がYYYY-MM形式ならYYYY-MM-01に変換
        let date = contract.date;
        if (date && /^\d{4}-\d{2}$/.test(date)) date = date + '-01';
        if (!date) date = new Date().toISOString().slice(0, 10);
        const { data: expenseData, error: expenseError } = await supabase
          .from('expenses')
          .insert({
            property_id: propertyId,
            category: '家賃',
            amount: contract.amount ?? null,
            description: contract.tenant_name || 'OCRで抽出された契約',
            date,
            receipt_url: fileUrl,
            document_id: document.id,
            room_no: contract.room_no,
            tenant_name: contract.tenant_name,
          })
          .select()
          .single();
        if (!expenseError && expenseData) expenses.push(expenseData);
        if (expenseError) {
          console.error('Expense save error:', expenseError, contract);
          throw new Error(`Expense save error: ${expenseError.message}`);
        }
      }
    }
    return { document, expenses };
  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}

/**
 * POST /api/ocr
 * ファイルを受け取り、OCR処理、データ構造化、DB保存を実行します。
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // --- バリデーション ---
    if (!file) {
      return NextResponse.json({ error: 'ファイルがアップロードされていません' }, { status: 400 });
    }
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズが大きすぎます（25MB以下にしてください）' }, { status: 413 });
    }

    // --- ファイルアップロード ---
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop() || 'bin';
    const newFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    // アップロードパスから物件IDを除外
    const filePath = `documents/${newFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return NextResponse.json({ error: 'ファイルのアップロードに失敗しました。' }, { status: 500 });
    }
    
    const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

    if (!publicUrl) {
        return NextResponse.json({ error: 'アップロードされたファイルのURL取得に失敗しました。'}, { status: 500 });
    }

    // --- OCRとデータ処理 ---
    const ocrText = await performOcrWithVision(fileBuffer, file.type);
    const { data: structuredData, originalText } = await structureTextWithGPT(ocrText);
    console.log('OpenAI structuredData:', JSON.stringify(structuredData, null, 2));

    // --- 物件名の抽出と特定/新規作成 ---
    const propertyNameFromOcr = structuredData?.propertyName;

    if (!propertyNameFromOcr) {
      return NextResponse.json({ error: '書類から物件名を読み取れませんでした。書類の品質を確認してください。' }, { status: 400 });
    }

    let finalPropertyId: number;

    const { data: existingProperty } = await supabase
      .from('properties')
      .select('id')
      .ilike('name', `%${propertyNameFromOcr}%`)
      .limit(1)
      .single();

    if (existingProperty) {
      finalPropertyId = existingProperty.id;
    } else {
      // 物件が存在しないので新規作成
      const { data: newProperty, error: createError } = await supabase
        .from('properties')
        .insert({
          name: propertyNameFromOcr,
          type: 'apartment', // デフォルト値
          units: 1, // デフォルト値
          occupied_units: 0,
          monthly_income: 0,
          yearly_income: 0,
          expenses: 0,
          net_income: 0,
          yield_rate: 0,
          location: '（自動登録）',
          address: '（自動登録）',
        })
        .select('id')
        .single();
      
      if (createError) throw new Error(`新規物件の作成に失敗しました: ${createError.message}`);
      if (!newProperty) throw new Error('新規物件の作成後、IDの取得に失敗しました。');
      
      finalPropertyId = newProperty.id;
    }

    // --- データベース保存 ---
    console.log('DEBUG contracts:', structuredData.contracts);
    console.log('Saving to DB, structuredData:', JSON.stringify(structuredData, null, 2));
    const { document, expenses } = await saveToDatabaseAndExpenses(
      originalText,
      structuredData,
      finalPropertyId,
      publicUrl,
      file.name
    );

    return NextResponse.json({
      message: 'OCR処理とデータベースへの保存が完了しました。',
      document,
      expenses,
      structuredData,
    });

  } catch (error) {
    console.error('[/api/ocr] Error:', error);
    const errorMessage = error instanceof Error ? error.message : '予期せぬエラーが発生しました。';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// 他のHTTPメソッドが必要な場合はここに追加
// 例: GET, PUT, DELETE

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

export async function PATCH(request: NextRequest) {
  try {
    const { id, extractedData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('documents')
      .update({ extracted_data: extractedData })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Document updated successfully', data });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // 関連するexpensesも削除
    const { error: expensesError } = await supabase
      .from('expenses')
      .delete()
      .eq('document_id', id);

    if (expensesError) {
      console.error('Error deleting related expenses:', expensesError);
    }

    // 文書を削除
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 