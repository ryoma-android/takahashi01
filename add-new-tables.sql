-- 新しいテーブルのみを追加するSQL
-- 既存のテーブル（properties, expenses, tax_insurance, documents）はスキップ

-- 取引テーブル（収支データの一元管理）
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  vendor VARCHAR(255),
  payment_method VARCHAR(50) CHECK (payment_method IN ('銀行振込', '現金', 'クレジットカード', 'その他')),
  is_manual_entry BOOLEAN NOT NULL DEFAULT TRUE,
  document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 税金・保険管理テーブル（支払予定と実績）
CREATE TABLE IF NOT EXISTS taxes_insurances (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES properties(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('tax', 'insurance')),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  due_date DATE NOT NULL,
  payment_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  description TEXT,
  reminder_days_before INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成（既存のインデックスはスキップ）
CREATE INDEX IF NOT EXISTS idx_transactions_property_id ON transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_document_id ON transactions(document_id);

CREATE INDEX IF NOT EXISTS idx_taxes_insurances_property_id ON taxes_insurances(property_id);
CREATE INDEX IF NOT EXISTS idx_taxes_insurances_type ON taxes_insurances(type);
CREATE INDEX IF NOT EXISTS idx_taxes_insurances_due_date ON taxes_insurances(due_date);
CREATE INDEX IF NOT EXISTS idx_taxes_insurances_status ON taxes_insurances(status); 