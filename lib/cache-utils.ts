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
      
      console.log('App cache cleared successfully');
    } catch (error) {
      console.error('Error clearing app cache:', error);
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
}

// グローバル関数として公開（開発者ツールからアクセス可能）
if (typeof window !== 'undefined') {
  (window as any).CacheUtils = CacheUtils;
} 