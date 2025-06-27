'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CacheUtils } from '@/lib/cache-utils';
import { GlobalErrorHandler } from '@/lib/error-handler';

export function DebugInfo() {
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [errorLog, setErrorLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);

  useEffect(() => {
    updateCacheInfo();
    updateErrorLog();
    runDiagnosis();
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

  const updateErrorLog = () => {
    const handler = GlobalErrorHandler.getInstance();
    setErrorLog(handler.getErrorLog());
  };

  const runDiagnosis = async () => {
    try {
      const result = await CacheUtils.diagnoseCache();
      setDiagnosis(result);
    } catch (error) {
      console.error('Error running diagnosis:', error);
    }
  };

  const handleClearCache = async () => {
    setIsLoading(true);
    try {
      await CacheUtils.clearAppCache();
      await updateCacheInfo();
      await runDiagnosis();
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

  const handleHardRefresh = async () => {
    setIsLoading(true);
    try {
      await CacheUtils.hardRefresh();
    } catch (error) {
      console.error('Error during hard refresh:', error);
      alert('ハードリフレッシュ中にエラーが発生しました');
      setIsLoading(false);
    }
  };

  const handleForceNewVersion = async () => {
    setIsLoading(true);
    try {
      await CacheUtils.forceNewVersion();
    } catch (error) {
      console.error('Error forcing new version:', error);
      alert('新バージョン強制取得中にエラーが発生しました');
      setIsLoading(false);
    }
  };

  const handleClearErrorLog = () => {
    const handler = GlobalErrorHandler.getInstance();
    handler.clearErrorLog();
    setErrorLog([]);
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (!cacheInfo) {
    return <div>Loading debug info...</div>;
  }

  return (
    <Tabs defaultValue="cache" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="cache">キャッシュ</TabsTrigger>
        <TabsTrigger value="errors">エラーログ</TabsTrigger>
        <TabsTrigger value="diagnosis">診断</TabsTrigger>
        <TabsTrigger value="actions">アクション</TabsTrigger>
      </TabsList>

      <TabsContent value="cache" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>キャッシュ情報</CardTitle>
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
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="errors" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              エラーログ
              <Button onClick={handleClearErrorLog} variant="outline" size="sm">
                クリア
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorLog.length === 0 ? (
              <p className="text-gray-500">エラーログはありません</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {errorLog.map((error, index) => (
                  <div key={index} className="text-xs bg-red-50 p-2 rounded border-l-4 border-red-400">
                    {error}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="diagnosis" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>キャッシュ診断</CardTitle>
          </CardHeader>
          <CardContent>
            {diagnosis ? (
              <div className="space-y-2 text-sm">
                <div><strong>診断時刻:</strong> {new Date(diagnosis.timestamp).toLocaleString()}</div>
                <div><strong>Cache API:</strong> {diagnosis.caches ? "有効" : "無効"}</div>
                <div><strong>Service Worker:</strong> {diagnosis.serviceWorker ? "有効" : "無効"}</div>
                <div><strong>Service Worker登録数:</strong> {diagnosis.serviceWorkerRegistrations}</div>
                <div><strong>Next.jsデータ:</strong> {diagnosis.nextJsData ? "有効" : "無効"}</div>
                <div><strong>キャッシュ数:</strong> {diagnosis.cacheNames?.length || 0}</div>
                {diagnosis.cacheNames && (
                  <div>
                    <strong>キャッシュ名:</strong>
                    <div className="mt-1 space-y-1">
                      {diagnosis.cacheNames.map((name: string, index: number) => (
                        <div key={index} className="text-xs bg-gray-100 p-1 rounded">
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>診断情報を読み込み中...</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="actions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>キャッシュ管理アクション</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleClearCache} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? "処理中..." : "キャッシュクリア"}
              </Button>
              <Button 
                onClick={handleForceUpdate} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? "処理中..." : "強制更新"}
              </Button>
              <Button 
                onClick={handleHardRefresh} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? "処理中..." : "ハードリフレッシュ"}
              </Button>
              <Button 
                onClick={handleForceNewVersion} 
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? "処理中..." : "新バージョン強制取得"}
              </Button>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleReload} 
                disabled={isLoading}
                variant="default"
                className="w-full"
              >
                ページリロード
              </Button>
            </div>

            <div className="text-xs text-gray-500 pt-4">
              <p>開発者ツールのコンソールで <code>CacheUtils</code> を使用してキャッシュ管理ができます。</p>
              <p>例: <code>CacheUtils.clearAppCache()</code></p>
              <p>例: <code>CacheUtils.forceNewVersion()</code></p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 