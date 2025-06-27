// グローバルエラーハンドラー - ChunkLoadError対策
import { CacheUtils } from './cache-utils';

export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private isReloading = false;
  private retryCount = 0;
  private maxRetries = 3;

  private constructor() {
    this.setupErrorHandling();
  }

  public static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  private setupErrorHandling() {
    // グローバルエラーハンドラーを設定
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event);
    });

    // Promise rejection ハンドラーを設定
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });

    // Next.js の chunk load error を検知
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        try {
          return await originalFetch(...args);
        } catch (error: any) {
          // chunk ファイルの読み込みエラーを検知
          if (error.message && error.message.includes('Loading chunk') && error.message.includes('failed')) {
            this.handleChunkLoadError(error);
          }
          throw error;
        }
      };
    }
  }

  private handleError(error: any) {
    // ChunkLoadError を検知
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;
    if (error.message && chunkFailedMessage.test(error.message)) {
      this.handleChunkLoadError(error);
      return;
    }

    // その他のエラーは通常通り処理
    console.error('Global error caught:', error);
  }

  private async handleChunkLoadError(error: any) {
    if (this.isReloading) return; // 既にリロード中の場合は何もしない
    
    console.warn('ChunkLoadError detected:', error.message);
    console.warn('Retry count:', this.retryCount);
    
    this.retryCount++;
    
    if (this.retryCount <= this.maxRetries) {
      // リトライ回数が上限に達していない場合
      console.log(`Attempting retry ${this.retryCount}/${this.maxRetries}`);
      
      // 軽微なキャッシュクリアを試行
      try {
        await CacheUtils.clearAllCaches();
        window.location.reload();
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        this.handleFinalChunkLoadError(error);
      }
    } else {
      // リトライ回数が上限に達した場合
      this.handleFinalChunkLoadError(error);
    }
  }

  private async handleFinalChunkLoadError(error: any) {
    this.isReloading = true;
    
    console.warn('Max retries reached, performing full cache clear and reload');
    
    // ユーザーに通知（オプション）
    if (typeof window !== 'undefined' && window.confirm) {
      const shouldReload = window.confirm('新しいバージョンが利用可能です。アプリケーションを完全に更新しますか？');
      if (shouldReload) {
        await this.performFullReload();
      } else {
        this.isReloading = false;
        this.retryCount = 0;
      }
    } else {
      // 自動リロード
      await this.performFullReload();
    }
  }

  private async performFullReload() {
    try {
      // 完全なキャッシュクリアとService Workerのアンインストール
      await CacheUtils.clearAppCache();
      
      // 少し待ってからリロード
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error during full reload:', error);
      // エラーが発生した場合でもリロード
      window.location.reload();
    }
  }

  // 手動でエラーハンドラーを初期化
  public static init() {
    return GlobalErrorHandler.getInstance();
  }

  // リトライカウントをリセット
  public resetRetryCount() {
    this.retryCount = 0;
    this.isReloading = false;
  }
}

// ブラウザ環境でのみ初期化
if (typeof window !== 'undefined') {
  GlobalErrorHandler.init();
} 