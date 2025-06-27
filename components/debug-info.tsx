'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CacheUtils } from '@/lib/cache-utils';

export function DebugInfo() {
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateCacheInfo();
  }, []);

  const updateCacheInfo = async () => {
    try {
      const info: any = {
        userAgent: navigator.userAgent,
        serviceWorker: 'serviceWorker' in navigator,
        caches: 'caches' in window,
        indexedDB: 'indexedDB' in window,
        localStorage: 'localStorage' in window,
        timestamp: new Date().toISOString(),
      };

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        info.cacheNames = cacheNames;
        info.cacheCount = cacheNames.length;
      }

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        info.serviceWorkerRegistrations = registrations.length;
      }

      setCacheInfo(info);
    } catch (error) {
      console.error('Error getting cache info:', error);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await CacheUtils.clearAppCache();
      await updateCacheInfo();
      alert('キャッシュをクリアしました');
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('キャッシュクリア中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceUpdate = async () => {
    setIsLoading(true);
    try {
      await CacheUtils.forceUpdate();
    } catch (error) {
      console.error('Error forcing update:', error);
      alert('更新中にエラーが発生しました');
      setIsLoading(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (!cacheInfo) {
    return <div>Loading debug info...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          デバッグ情報
          <Badge variant="outline">開発者向け</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Service Worker:</strong>
            <Badge variant={cacheInfo.serviceWorker ? "default" : "destructive"} className="ml-2">
              {cacheInfo.serviceWorker ? "有効" : "無効"}
            </Badge>
          </div>
          <div>
            <strong>Cache API:</strong>
            <Badge variant={cacheInfo.caches ? "default" : "destructive"} className="ml-2">
              {cacheInfo.caches ? "有効" : "無効"}
            </Badge>
          </div>
          <div>
            <strong>IndexedDB:</strong>
            <Badge variant={cacheInfo.indexedDB ? "default" : "destructive"} className="ml-2">
              {cacheInfo.indexedDB ? "有効" : "無効"}
            </Badge>
          </div>
          <div>
            <strong>LocalStorage:</strong>
            <Badge variant={cacheInfo.localStorage ? "default" : "destructive"} className="ml-2">
              {cacheInfo.localStorage ? "有効" : "無効"}
            </Badge>
          </div>
        </div>

        {cacheInfo.cacheNames && (
          <div>
            <strong>キャッシュ一覧 ({cacheInfo.cacheCount}):</strong>
            <div className="mt-2 space-y-1">
              {cacheInfo.cacheNames.map((name: string, index: number) => (
                <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <strong>Service Worker登録数:</strong> {cacheInfo.serviceWorkerRegistrations}
        </div>

        <div>
          <strong>最終更新:</strong> {new Date(cacheInfo.timestamp).toLocaleString()}
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          <Button 
            onClick={handleClearCache} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? "処理中..." : "キャッシュクリア"}
          </Button>
          <Button 
            onClick={handleForceUpdate} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? "処理中..." : "強制更新"}
          </Button>
          <Button 
            onClick={handleReload} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            ページリロード
          </Button>
          <Button 
            onClick={updateCacheInfo} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            情報更新
          </Button>
        </div>

        <div className="text-xs text-gray-500 pt-4">
          <p>開発者ツールのコンソールで <code>CacheUtils</code> を使用してキャッシュ管理ができます。</p>
          <p>例: <code>CacheUtils.clearAppCache()</code></p>
        </div>
      </CardContent>
    </Card>
  );
} 