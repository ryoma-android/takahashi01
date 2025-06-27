-- expensesテーブルにproperty_nameとvendorカラムを追加
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS property_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS vendor VARCHAR(255);

-- 既存のデータに対して、property_nameを更新（property_idから取得）
UPDATE expenses 
SET property_name = (
  SELECT name 
  FROM properties 
  WHERE properties.id = expenses.property_id
)
WHERE property_name IS NULL AND property_id IS NOT NULL;

-- expensesテーブルにroom_noとtenant_nameカラムを追加
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS room_no VARCHAR(50),
ADD COLUMN IF NOT EXISTS tenant_name VARCHAR(255); 