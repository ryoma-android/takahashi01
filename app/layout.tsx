import React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import { PropertyProvider } from "@/contexts/PropertyContext";
import { ErrorHandlerProvider } from "@/components/error-handler-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'タカハシホーム 不動産管理システム',
  description: 'タカハシホームの不動産ポートフォリオを管理するための内部システム',
  keywords: 'タカハシホーム, 福井市, 不動産管理, 物件管理, 収支管理',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* PWA用メタタグ */}
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="manifest" href="/manifest.json" />
        {/* アイコン */}
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        {/* iOS用のPWAフルスクリーン表示 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="高橋ホーム" />
        {/* その他必要なタグ */}
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ErrorHandlerProvider>
          <PropertyProvider>
            {children}
            <Toaster />
          </PropertyProvider>
        </ErrorHandlerProvider>
      </body>
    </html>
  );
}