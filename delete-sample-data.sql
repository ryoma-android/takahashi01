-- サンプルデータ削除スクリプト
-- Supabase SQL Editorで実行してください

-- 1. 物件テーブルのサンプルデータを削除
DELETE FROM properties WHERE name LIKE '高橋ホーム%';

-- 2. 支出テーブルのサンプルデータを削除（関連するデータがある場合）
DELETE FROM expenses WHERE property_id IN (
  SELECT id FROM properties WHERE name LIKE '高橋ホーム%'
);

-- 3. 税・保険テーブルのサンプルデータを削除（関連するデータがある場合）
DELETE FROM tax_insurance WHERE property_id IN (
  SELECT id FROM properties WHERE name LIKE '高橋ホーム%'
);


-- 5. 削除結果を確認
SELECT 'Properties count after deletion:' as info, COUNT(*) as count FROM properties;
SELECT 'Expenses count after deletion:' as info, COUNT(*) as count FROM expenses;
SELECT 'Tax insurance count after deletion:' as info, COUNT(*) as count FROM tax_insurance;
SELECT 'OCR documents count after deletion:' as info, COUNT(*) as count FROM ocr_documents; 