import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 型定義
export interface Property {
  id: number;
  name: string;
  type: 'apartment' | 'parking' | 'commercial' | 'family_mansion' | 'student_mansion';
  units: number;
  occupied_units: number;
  monthly_income: number;
  yearly_income: number;
  expenses: number;
  net_income: number;
  yield_rate: number;
  location: string;
  address: string;
  build_year: number;
  structure: string;
  total_floors: number;
  management_company: string;
  property_manager: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  property_id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
  receipt_url?: string;
  created_at: string;
}

export interface TaxInsurance {
  id: number;
  property_id: number;
  type: 'tax' | 'insurance';
  name: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  created_at: string;
}

export interface Document {
  id: number;
  property_id: number;
  type: 'receipt' | 'contract' | 'invoice' | 'other';
  filename: string;
  file_url: string;
  ocr_data?: any;
  extracted_data?: any;
  created_at: string;
} 