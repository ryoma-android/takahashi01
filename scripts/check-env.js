#!/usr/bin/env node

// 環境変数の設定状況を確認するスクリプト
require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY'
];

console.log('🔍 環境変数の設定状況を確認中...\n');

let allSet = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value && value !== `your_${envVar.toLowerCase()}_here`) {
    console.log(`✅ ${envVar}: 設定済み`);
  } else {
    console.log(`❌ ${envVar}: 未設定`);
    allSet = false;
  }
});

console.log('\n📋 設定手順:');
console.log('1. Supabaseプロジェクトを作成');
console.log('2. OpenAIアカウントを作成してAPIキーを取得');
console.log('3. .env.localファイルに各APIキーを設定');
console.log('4. supabase-schema.sqlをSupabaseのSQLエディタで実行');

if (allSet) {
  console.log('\n🎉 すべての環境変数が正しく設定されています！');
  console.log('npm run dev で開発サーバーを起動できます。');
} else {
  console.log('\n⚠️  一部の環境変数が未設定です。上記の手順に従って設定してください。');
} 