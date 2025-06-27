// キャッシュ管理ユーティリティ
export class CacheUtils {
  // すべてのキャッシュをクリア
  static async clearAllCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  // Service Workerをアンインストール
  static async unregisterServiceWorker(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const unregisterPromises = registrations.map(registration => 
        registration.unregister()
      );
      const results = await Promise.all(unregisterPromises);
      const success = results.some(result => result);
      console.log('Service workers unregistered:', success);
      return success;
    }
    return false;
  }

  // アプリケーションのキャッシュを完全にクリア
  static async clearAppCache(): Promise<void> {
    try {
      // ブラウザキャッシュをクリア
      await this.clearAllCaches();
      
      // Service Workerをアンインストール
      await this.unregisterServiceWorker();
      
      // IndexedDBをクリア（もし使用している場合）
      if ('indexedDB' in window) {
        const databases = await window.indexedDB.databases();
        databases.forEach(db => {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      }
      
      // localStorageをクリア
      localStorage.clear();
      
      // sessionStorageをクリア
      sessionStorage.clear();
      
      // Next.jsの内部キャッシュをクリア
      await this.clearNextJsCache();
      
      console.log('App cache cleared successfully');
    } catch (error) {
      console.error('Error clearing app cache:', error);
    }
  }

  // Next.jsの内部キャッシュをクリア
  static async clearNextJsCache(): Promise<void> {
    try {
      // Next.jsのルートキャッシュをクリア
      if ('caches' in window) {
        const nextJsCacheNames = [
          'next-data',
          'static-js-assets',
          'static-style-assets',
          'static-image-assets',
          'static-font-assets',
          'apis',
          'others',
          'cross-origin'
        ];
        
        for (const cacheName of nextJsCacheNames) {
          try {
            await caches.delete(cacheName);
          } catch (e) {
            // キャッシュが存在しない場合は無視
          }
        }
      }

      // Next.jsの内部状態をクリア
      if (typeof window !== 'undefined') {
        // __NEXT_DATA__をクリア
        if ((window as any).__NEXT_DATA__) {
          delete (window as any).__NEXT_DATA__;
        }
        
        // Next.jsのルーティングキャッシュをクリア
        if ((window as any).__NEXT_ROUTER_BASEPATH) {
          delete (window as any).__NEXT_ROUTER_BASEPATH;
        }
      }
      
      console.log('Next.js cache cleared');
    } catch (error) {
      console.error('Error clearing Next.js cache:', error);
    }
  }

  // ページをリロード（キャッシュクリア後）
  static async reloadPage(): Promise<void> {
    await this.clearAppCache();
    window.location.reload();
  }

  // 新しいバージョンが利用可能かチェック
  static async checkForUpdates(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        // Service Workerの更新をチェック
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          return true;
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
    return false;
  }

  // 手動でアプリケーションを更新
  static async forceUpdate(): Promise<void> {
    try {
      await this.clearAppCache();
      await this.checkForUpdates();
      window.location.reload();
    } catch (error) {
      console.error('Error forcing update:', error);
      // エラーが発生した場合でもリロード
      window.location.reload();
    }
  }

  // ハードリフレッシュ（キャッシュを完全に無視）
  static async hardRefresh(): Promise<void> {
    try {
      await this.clearAppCache();
      
      // ハードリフレッシュを実行
      if (typeof window !== 'undefined') {
        // ブラウザのキャッシュを無視してリロード
        window.location.href = window.location.href;
        window.location.reload();
      }
    } catch (error) {
      console.error('Error during hard refresh:', error);
      // フォールバック
      window.location.reload();
    }
  }

  // 特定のチャンクファイルのキャッシュをクリア
  static async clearChunkCache(chunkName?: string): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const url = request.url;
          if (url.includes('_next/static/chunks/')) {
            if (!chunkName || url.includes(chunkName)) {
              await cache.delete(request);
              console.log(`Cleared chunk cache: ${url}`);
            }
          }
        }
      }
    }
  }

  // キャッシュ状態を診断
  static async diagnoseCache(): Promise<any> {
    const diagnosis: any = {
      timestamp: new Date().toISOString(),
      caches: 'caches' in window,
      serviceWorker: 'serviceWorker' in navigator,
      cacheNames: [],
      serviceWorkerRegistrations: 0,
      nextJsData: !!(typeof window !== 'undefined' && (window as any).__NEXT_DATA__),
    };

    if ('caches' in window) {
      diagnosis.cacheNames = await caches.keys();
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      diagnosis.serviceWorkerRegistrations = registrations.length;
    }

    return diagnosis;
  }

  // 強制的に新しいバージョンを取得
  static async forceNewVersion(): Promise<void> {
    try {
      // すべてのキャッシュをクリア
      await this.clearAppCache();
      
      // Service Workerを強制的に更新
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.update();
        }
      }
      
      // 少し待ってからハードリフレッシュ
      setTimeout(() => {
        this.hardRefresh();
      }, 2000);
      
    } catch (error) {
      console.error('Error forcing new version:', error);
      this.hardRefresh();
    }
  }
}

// グローバル関数として公開（開発者ツールからアクセス可能）
if (typeof window !== 'undefined') {
  (window as any).CacheUtils = CacheUtils;
} 