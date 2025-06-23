# 高橋ホーム 不動産管理システム

福井市内の不動産オーナー向け物件別収支管理アプリケーションです。

## 🏗️ 技術スタック

- **フロントエンド**: Next.js 13 (App Router), TypeScript, Tailwind CSS
- **UI コンポーネント**: Shadcn UI, Radix UI
- **データベース**: Supabase (PostgreSQL)
- **AI/OCR**: OpenAI GPT-4, Tesseract.js
- **PDF/CSV出力**: jsPDF, xlsx

## 🚀 主要機能

### 1. 収支レポート（PDF/CSV出力）
- 物件別・期間別の収支レポート生成
- PDF/CSV形式での出力
- グラフ・チャートによる可視化

### 2. 物件別管理画面
- 利回り計算
- 空室率管理
- 収益性分析
- 物件詳細情報

### 3. 修繕費管理
- 支出履歴管理
- 領収書アップロード
- カテゴリ別分類
- 予算管理

### 4. 税・保険の一元管理
- 支払予定管理
- リマインダー機能
- 支払状況追跡

### 5. AI連携・文書読み取り
- PDF/画像からのデータ抽出
- OCRによる自動分類
- GPT-4による構造化データ生成

## 📋 セットアップ手順

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabaseデータベースのセットアップ
1. Supabaseプロジェクトを作成
2. `supabase-schema.sql` の内容をSupabaseのSQLエディタで実行
3. ストレージバケットを作成（文書アップロード用）
   - Supabaseコンソールの[Storage]→[New bucket]で `documents` という名前のパブリックバケットを作成してください。

### 4. 開発サーバーの起動
```bash
npm run dev
```

## 🗄️ データベース構造

### 主要テーブル
- `properties`: 物件情報
- `expenses`: 支出管理
- `tax_insurance`: 税・保険管理
- `documents`: 文書管理

## 📁 プロジェクト構造

```
├── app/
│   ├── api/           # API Routes
│   ├── globals.css    # グローバルスタイル
│   ├── layout.tsx     # レイアウト
│   └── page.tsx       # メインページ
├── components/
│   ├── ui/            # Shadcn UI コンポーネント
│   ├── property-dashboard.tsx
│   ├── expense-tracker.tsx
│   ├── document-ocr.tsx
│   ├── tax-insurance-manager.tsx
│   ├── reports-generator.tsx
│   └── user-guide.tsx
├── hooks/             # カスタムフック
├── lib/               # ユーティリティ
└── supabase-schema.sql # データベーススキーマ
```

## 🎯 開発ロードマップ

### Phase 1: MVP機能（現在）
- [x] 基本的なUI構築
- [x] データベース設計
- [x] API Routes作成
- [ ] Supabase連携
- [ ] 基本的なCRUD操作

### Phase 2: コア機能
- [ ] OCR機能実装
- [ ] AI連携
- [ ] レポート生成
- [ ] ファイルアップロード

### Phase 3: 高度な機能
- [ ] 通知システム
- [ ] データ分析
- [ ] モバイル対応
- [ ] 多言語対応

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

ご質問やサポートが必要な場合は、以下までお問い合わせください：
- メール: info@takahashi-home.jp
- 電話: 0776-XX-XXXX