'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Eye, 
  Edit, 
  Save,
  Camera,
  Scan,
  BarChart3,
  TrendingUp,
  Building2,
  HelpCircle,
  Lightbulb,
  Smartphone,
  Monitor,
  Zap,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface OCRResult {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  status: 'processing' | 'completed' | 'error';
  extractedData: {
    amount?: number;
    date?: string;
    vendor?: string;
    category?: string;
    description?: string;
    confidence?: number;
    propertyName?: string;
    taxType?: string;
  };
  rawText?: string;
  previewUrl?: string;
  error?: string;
}

export function DocumentOCR() {
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingResult, setEditingResult] = useState<string | null>(null);
  const [editData, setEditData] = useState<OCRResult['extractedData']>({});
  const [showGuide, setShowGuide] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 高橋ホームの物件リスト
  const takahashiProperties = [
    '高橋ホーム福井中央アパート',
    '高橋ホーム駅前パーキング', 
    '高橋ホーム片町商業ビル',
    '高橋ホーム花堂ファミリーマンション',
    '高橋ホーム学園前学生マンション'
  ];

  // 初期データの読み込み
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/ocr');
      if (response.ok) {
        const data = await response.json();
        // データベースの形式をUI用に変換
        const convertedData = data.map((doc: any) => ({
          id: doc.id.toString(),
          fileName: doc.filename,
          fileType: doc.filename.includes('.pdf') ? 'pdf' : 'image',
          uploadDate: new Date(doc.created_at).toISOString().split('T')[0],
          status: 'completed' as const,
          extractedData: doc.extracted_data || {},
          rawText: doc.ocr_data?.rawText || ''
        }));
        setOcrResults(convertedData);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      let newResult: OCRResult | null = null;
      
      try {
        // 新しい結果を追加（処理中状態）
        newResult = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          fileName: file.name,
          fileType: file.type.includes('image') ? 'image' : 'pdf',
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'processing',
          extractedData: {},
          previewUrl: URL.createObjectURL(file)
        };

        setOcrResults(prev => [newResult!, ...prev]);

        // ファイルをAPIに送信
        const formData = new FormData();
        formData.append('file', file);

        setUploadProgress(0);
        
        // プログレスシミュレーション
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 500);

        const response = await fetch('/api/ocr', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'アップロードに失敗しました');
        }

        const result = await response.json();

        // 結果を更新
        if (newResult) {
          setOcrResults(prev => prev.map(item => 
            item.id === newResult!.id 
              ? { ...item, ...result.data, status: 'completed' as const }
              : item
          ));
        }

        // プレビューURLをクリーンアップ
        if (newResult && newResult.previewUrl) {
          URL.revokeObjectURL(newResult.previewUrl);
        }

      } catch (error) {
        console.error('Upload error:', error);
        setError(error instanceof Error ? error.message : 'アップロードに失敗しました');
        
        // エラー状態に更新
        if (newResult) {
          setOcrResults(prev => prev.map(item => 
            item.id === newResult!.id 
              ? { ...item, status: 'error' as const, error: error instanceof Error ? error.message : 'エラーが発生しました' }
              : item
          ));
        }
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    
    // ファイル入力をリセット
    event.target.value = '';
  }, []);

  const handleEdit = (result: OCRResult) => {
    setEditingResult(result.id);
    setEditData(result.extractedData);
  };

  const handleSaveEdit = async () => {
    if (!editingResult) return;

    try {
      // ここでAPIを呼び出してデータを更新
      // 現在はローカル状態のみ更新
      setOcrResults(prev => prev.map(result => 
        result.id === editingResult 
          ? { ...result, extractedData: editData }
          : result
      ));
      setEditingResult(null);
      setEditData({});
    } catch (error) {
      console.error('Save error:', error);
      setError('保存に失敗しました');
    }
  };

  const handleCancelEdit = () => {
    setEditingResult(null);
    setEditData({});
  };

  const getStatusBadge = (status: OCRResult['status']) => {
    switch (status) {
      case 'processing':
        return (
          <Badge variant="secondary" className="animate-pulse">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            処理中
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            完了
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            エラー
          </Badge>
        );
    }
  };

  const getFileIcon = (fileType: string) => {
    return fileType === 'image' ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />;
  };

  const processingCount = ocrResults.filter(r => r.status === 'processing').length;
  const completedCount = ocrResults.filter(r => r.status === 'completed').length;
  const totalAmount = ocrResults
    .filter(r => r.status === 'completed' && r.extractedData.amount)
    .reduce((sum, r) => sum + (r.extractedData.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 underline hover:no-underline"
            >
              閉じる
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* OCR説明カード */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-800">
            <Camera className="h-6 w-6" />
            <span>書類読み取り（OCR）とは？</span>
          </CardTitle>
          <CardDescription className="text-purple-700">
            領収書や請求書を写真で撮るだけで、自動で内容を読み取る便利な機能です
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border flex flex-col items-center text-center">
              <Smartphone className="h-12 w-12 text-purple-600 mb-3" />
              <h4 className="font-semibold text-lg mb-2">1. 写真を撮る</h4>
              <p className="text-sm text-gray-600">
                スマホで領収書や請求書を撮影してください（画像ファイルのみ対応）
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border flex flex-col items-center text-center">
              <Zap className="h-12 w-12 text-blue-600 mb-3" />
              <h4 className="font-semibold text-lg mb-2">2. 自動で読み取り</h4>
              <p className="text-sm text-gray-600">
                AIが金額、日付、業者名などを自動で読み取ります
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border flex flex-col items-center text-center">
              <Monitor className="h-12 w-12 text-green-600 mb-3" />
              <h4 className="font-semibold text-lg mb-2">3. 帳簿に反映</h4>
              <p className="text-sm text-gray-600">
                読み取った内容を確認して、支出管理に自動で追加できます
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">撮影のコツ</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 明るい場所で撮影してください</li>
                  <li>• 文字がはっきり見えるようにピントを合わせてください</li>
                  <li>• 領収書全体が写るように撮影してください</li>
                  <li>• 影が入らないように注意してください</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ファイルアップロード */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-6 w-6 text-blue-600" />
            <span>ファイルをアップロード</span>
          </CardTitle>
          <CardDescription>
            画像ファイル（JPEG、PNG、GIF）を選択してください（最大10MB）。PDFファイルは現在サポートされていません。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">ファイルを選択</span>
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">アップロード中...</span>
                </div>
              )}
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                ファイル選択
              </Button>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>アップロード進捗</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">処理中</CardTitle>
            <Loader2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{processingCount}</div>
            <p className="text-xs text-muted-foreground">ファイル</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">処理完了</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">ファイル</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">抽出金額</CardTitle>
            <Scan className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">合計</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総ファイル数</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ocrResults.length}</div>
            <p className="text-xs text-muted-foreground">ファイル</p>
          </CardContent>
        </Card>
      </div>

      {/* OCR結果一覧 */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <span>処理結果一覧</span>
              </CardTitle>
              <CardDescription>アップロードされたファイルのOCR処理結果</CardDescription>
            </div>
            <Button 
              onClick={fetchDocuments}
              variant="outline"
              size="sm"
              className="hover-lift"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              更新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {ocrResults.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">まだファイルがアップロードされていません</p>
              <p className="text-sm text-gray-500 mt-2">上記の「ファイルを選択」ボタンからファイルをアップロードしてください</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ocrResults.map((result) => (
                <div 
                  key={result.id} 
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(result.fileType)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{result.fileName}</h4>
                        <p className="text-sm text-gray-600">
                          アップロード日: {result.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(result.status)}
                      {result.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(result)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          編集
                        </Button>
                      )}
                    </div>
                  </div>

                  {result.status === 'processing' && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>OCR処理中...</span>
                    </div>
                  )}

                  {result.status === 'error' && (
                    <div className="text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      {result.error || '処理中にエラーが発生しました'}
                    </div>
                  )}

                  {result.status === 'completed' && (
                    <div className="space-y-4">
                      {editingResult === result.id ? (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>金額</Label>
                              <Input
                                type="number"
                                value={editData.amount || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                              />
                            </div>
                            <div>
                              <Label>日付</Label>
                              <Input
                                type="date"
                                value={editData.date || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>業者名</Label>
                              <Input
                                value={editData.vendor || ''}
                                onChange={(e) => setEditData(prev => ({ ...prev, vendor: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>カテゴリ</Label>
                              <Select
                                value={editData.category || ''}
                                onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="カテゴリを選択" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="修繕費">修繕費</SelectItem>
                                  <SelectItem value="清掃費">清掃費</SelectItem>
                                  <SelectItem value="保守点検">保守点検</SelectItem>
                                  <SelectItem value="保険料">保険料</SelectItem>
                                  <SelectItem value="税金">税金</SelectItem>
                                  <SelectItem value="管理費">管理費</SelectItem>
                                  <SelectItem value="広告費">広告費</SelectItem>
                                  <SelectItem value="光熱費">光熱費</SelectItem>
                                  <SelectItem value="設備費">設備費</SelectItem>
                                  <SelectItem value="その他">その他</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>摘要</Label>
                            <Textarea
                              value={editData.description || ''}
                              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                              rows={3}
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button onClick={handleSaveEdit} size="sm">
                              <Save className="h-4 w-4 mr-1" />
                              保存
                            </Button>
                            <Button onClick={handleCancelEdit} variant="outline" size="sm">
                              キャンセル
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {result.extractedData.amount && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <p className="text-sm text-green-600 font-medium">金額</p>
                              <p className="text-lg font-bold text-green-800">
                                ¥{result.extractedData.amount.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {result.extractedData.date && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <p className="text-sm text-blue-600 font-medium">日付</p>
                              <p className="text-lg font-bold text-blue-800">
                                {result.extractedData.date}
                              </p>
                            </div>
                          )}
                          {result.extractedData.vendor && (
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <p className="text-sm text-purple-600 font-medium">業者名</p>
                              <p className="text-lg font-bold text-purple-800">
                                {result.extractedData.vendor}
                              </p>
                            </div>
                          )}
                          {result.extractedData.category && (
                            <div className="bg-orange-50 p-3 rounded-lg">
                              <p className="text-sm text-orange-600 font-medium">カテゴリ</p>
                              <p className="text-lg font-bold text-orange-800">
                                {result.extractedData.category}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {result.extractedData.description && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-600 font-medium">摘要</p>
                          <p className="text-gray-800">{result.extractedData.description}</p>
                        </div>
                      )}

                      {result.rawText && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                            <Eye className="h-4 w-4 inline mr-1" />
                            OCR抽出テキストを表示
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <Textarea
                              value={result.rawText}
                              readOnly
                              rows={4}
                              className="font-mono text-sm"
                            />
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}