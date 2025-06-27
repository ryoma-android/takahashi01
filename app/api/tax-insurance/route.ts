import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('tax_insurance').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 必須項目チェック
    if (!body.name || !body.type || !body.amount || !body.due_date) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }
    // DBに挿入（カラムのみ）
    const { data, error } = await supabase.from('tax_insurance').insert([
      {
        property_id: body.property_id ?? null,
        type: body.type,
        name: body.name,
        amount: body.amount,
        due_date: body.due_date,
        status: body.status || 'pending',
        description: body.description || '',
        created_at: body.created_at || new Date().toISOString(),
      }
    ]).select('*').single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: '不正なリクエスト' }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }
    // 更新するフィールドのみ
    const updateFields: any = {};
    if (body.status) updateFields.status = body.status;
    if (body.paymentDate) updateFields.payment_date = body.paymentDate;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.type !== undefined) updateFields.type = body.type;
    if (body.amount !== undefined) updateFields.amount = body.amount;
    if (body.due_date !== undefined) updateFields.due_date = body.due_date;
    // ...他に追加したいフィールドがあればここに
    const { data, error } = await supabase.from('tax_insurance').update(updateFields).eq('id', body.id).select('*').single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: '不正なリクエスト' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }
    const { error } = await supabase.from('tax_insurance').delete().eq('id', body.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: '不正なリクエスト' }, { status: 400 });
  }
} 