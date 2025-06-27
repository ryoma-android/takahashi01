'use client';

import { useEffect } from 'react';
import { GlobalErrorHandler } from '@/lib/error-handler';

export function ErrorHandlerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // クライアントサイドでエラーハンドラーを初期化
    GlobalErrorHandler.init();
    
    // Service Worker の更新を監視
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('New service worker activated, reloading page...');
        window.location.reload();
      });
    }
  }, []);

  return <>{children}</>;
} 