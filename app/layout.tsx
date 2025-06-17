import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '高橋ホーム 不動産管理システム | 福井市',
  description: '高橋ホーム専用の福井市不動産管理システム。物件管理、収支管理、税務管理を一元化。',
  keywords: '高橋ホーム, 福井市, 不動産管理, 物件管理, 収支管理',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}