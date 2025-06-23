-- 物件テーブル
CREATE TABLE properties (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('apartment', 'parking', 'commercial', 'family_mansion', 'student_mansion')),
  units INTEGER NOT NULL DEFAULT 0,
  occupied_units INTEGER NOT NULL DEFAULT 0,
  monthly_income DECIMAL(12,2) NOT NULL DEFAULT 0,
  yearly_income DECIMAL(12,2) NOT NULL DEFAULT 0,
  expenses DECIMAL(12,2) NOT NULL DEFAULT 0,
  net_income DECIMAL(12,2) NOT NULL DEFAULT 0,
  yield_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  location VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  build_year INTEGER,
  structure VARCHAR(100),
  total_floors INTEGER DEFAULT 1,
  management_company VARCHAR(255) DEFAULT '高橋ホーム',
  property_manager VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 支出テーブル
CREATE TABLE expenses (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 税・保険テーブル
CREATE TABLE tax_insurance (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('tax', 'insurance')),
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 文書テーブル
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('receipt', 'contract', 'invoice', 'other')),
  filename VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  ocr_data JSONB,
  extracted_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 取引テーブル（収支データの一元管理）
CREATE TABLE transactions (
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

-- インデックスの作成
CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_expenses_property_id ON expenses(property_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_tax_insurance_property_id ON tax_insurance(property_id);
CREATE INDEX idx_tax_insurance_due_date ON tax_insurance(due_date);
CREATE INDEX idx_tax_insurance_status ON tax_insurance(status);
CREATE INDEX idx_documents_property_id ON documents(property_id);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_transactions_property_id ON transactions(property_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_document_id ON transactions(document_id);
CREATE INDEX idx_taxes_insurances_property_id ON taxes_insurances(property_id);
CREATE INDEX idx_taxes_insurances_type ON taxes_insurances(type);
CREATE INDEX idx_taxes_insurances_due_date ON taxes_insurances(due_date);
CREATE INDEX idx_taxes_insurances_status ON taxes_insurances(status);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at 
  BEFORE UPDATE ON properties 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入
INSERT INTO properties (
  name, type, units, occupied_units, monthly_income, yearly_income, 
  expenses, net_income, yield_rate, location, address, build_year, 
  structure, total_floors, property_manager
) VALUES 
('高橋ホーム福井中央アパート', 'apartment', 16, 15, 960000, 11520000, 1800000, 9720000, 9.2, '福井市中央', '福井県福井市中央1-5-12', 2020, 'RC造', 4, '高橋 太郎'),
('高橋ホーム駅前パーキング', 'parking', 35, 32, 350000, 4200000, 680000, 3520000, 12.8, '福井市大手', '福井県福井市大手2-8-5', 2021, 'アスファルト舗装', 1, '高橋 花子'),
('高橋ホーム片町商業ビル', 'commercial', 8, 7, 640000, 7680000, 1400000, 6280000, 8.7, '福井市順化', '福井県福井市順化1-12-8', 2018, 'SRC造', 5, '高橋 次郎'),
('高橋ホーム花堂ファミリーマンション', 'family_mansion', 12, 11, 780000, 9360000, 1200000, 8160000, 9.5, '福井市花堂南', '福井県福井市花堂南3-2-15', 2019, 'RC造', 4, '高橋 美咲'),
('高橋ホーム学園前学生マンション', 'student_mansion', 20, 18, 900000, 10800000, 1600000, 9200000, 10.1, '福井市文京', '福井県福井市文京4-15-3', 2022, 'RC造', 3, '高橋 健一'); 