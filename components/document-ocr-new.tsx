'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  RefreshCw,
  Trash2,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { useProperties } from '@/contexts/PropertyContext';

interface DocumentOCRProps {
  onSuccess?: () => void;
}

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
    contracts?: Array<{ room_no: string; tenant_name: string; amount: number; date: string }>;
  };
  rawText?: string;
  previewUrl?: string;
  error?: string;
  expense?: boolean;
}

export function DocumentOCR(props: DocumentOCRProps) {
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingResult, setEditingResult] = useState<string | null>(null);
  const [editData, setEditData] = useState<OCRResult['extractedData']>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const { properties: contextProperties, fetchProperties } = useProperties();

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (contextProperties.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(contextProperties[0].id.toString());
    }
  }, [contextProperties, selectedPropertyId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/ocr');
      if (response.ok) {
        const data = await response.json();
        const convertedData = data.map((doc: any) => ({
          id: doc.id.toString(),
          fileName: doc.filename,
          fileType: doc.filename.includes('.pdf') ? 'pdf' : 'image',
          uploadDate: new Date(doc.created_at).toISOString().split('T')[0],
          status: 'completed' as const,
          extractedData: doc.extracted_data || {},
          rawText: doc.extracted_text || '',
          expense: doc.expense
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

        const formData = new FormData();
        formData.append('file', file);
        if (selectedPropertyId) {
          formData.append('propertyId', selectedPropertyId);
        }

        setUploadProgress(0);
        
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

        if (newResult) {
          setOcrResults(prev => prev.map(item => 
            item.id === newResult!.id 
              ? { 
                  ...item, 
                  id: result.document.id.toString(),
                  status: 'completed' as const,
                  rawText: result.document.extracted_text,
                  extractedData: result.structuredData || {},
                  expense: !!result.expense,
                  previewUrl: result.document.file_url
                }
              : item
          ));
        }

        await fetchProperties();
        if (props.onSuccess) props.onSuccess();

        if (result.expense) {
          setSuccessMessage(`OCR処理が完了しました！支出データが自動的に登録されました。`);
        } else {
          setSuccessMessage(`OCR処理が完了しました！`);
        }

      } catch (error) {
        console.error('Upload error:', error);
        setError(error instanceof Error ? error.message : 'アップロードに失敗しました');
        
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
    event.target.value = '';
  }, [selectedPropertyId, fetchProperties, props]);

  const handleEdit = (result: OCRResult) => {
    setEditingResult(result.id);
    setEditData({ ...result.extractedData });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingResult) return;

    try {
      const response = await fetch('/api/ocr', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingResult,
          extractedData: editData,
        }),
      });

      if (!response.ok) {
        throw new Error('編集の保存に失敗しました');
      }

      setOcrResults(prev => prev.map(result => 
        result.id === editingResult 
          ? { ...result, extractedData: editData }
          : result
      ));

      setIsEditModalOpen(false);
      setEditingResult(null);
      setEditData({});
      setSuccessMessage('編集が保存されました');
    } catch (error) {
      console.error('Save error:', error);
      setError('保存に失敗しました');
    }
  };

  const handleDelete = async (resultId: string) => {
    if (!confirm('この文書を削除しますか？関連する支出データも削除されます。')) {
      return;
    }

    setIsDeleting(resultId);
    try {
      const response = await fetch(`/api/ocr?id=${resultId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      setOcrResults(prev => prev.filter(result => result.id !== resultId));
      setSuccessMessage('文書が削除されました');
    } catch (error) {
      console.error('Delete error:', error);
      setError('削除に失敗しました');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setEditingResult(null);
    setEditData({});
  };

  const addContract = () => {
    setEditData(prev => ({
      ...prev,
      contracts: [...(prev.contracts || []), { room_no: '', tenant_name: '', amount: 0, date: '' }]
    }));
  };

  const removeContract = (index: number) => {
    setEditData(prev => ({
      ...prev,
      contracts: prev.contracts?.filter((_, i) => i !== index) || []
    }));
  };

  const updateContract = (index: number, field: string, value: string | number) => {
    setEditData(prev => ({
      ...prev,
      contracts: prev.contracts?.map((contract, i) => 
        i === index ? { ...contract, [field]: value } : contract
      ) || []
    }));
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
            <AlertCircle className="h-4 w-4 mr-1" />
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
    .filter(r => r.status === 'completed' && r.extractedData.contracts)
    .reduce((sum, r) => sum + (r.extractedData.contracts?.reduce((cSum, c) => cSum + (c.amount || 0), 0) || 0), 0);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fakeEvent = { target: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(fakeEvent);
    }
  };

  return (
    <div className="space-y-6">
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

      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
            <div className="flex space-x-2 mt-2">
              <button 
                onClick={() => setSuccessMessage(null)}
                className="text-green-600 underline hover:no-underline"
              >
                閉じる
              </button>
              {successMessage.includes('支出データが自動的に登録されました') && (
                <button 
                  onClick={() => {
                    window.location.href = '/expenses';
                  }}
                  className="text-green-600 underline hover:no-underline font-medium"
                >
                  支出データを確認 →
                </button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

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

      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-6 w-6 text-blue-600" />
            <span>ファイルをアップロード</span>
          </CardTitle>
          <CardDescription>
            関連物件を選択、または未選択でファイルをアップロードしてください。物件が存在しない場合は自動で登録されます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="property-select">関連物件</Label>
              <Select
                value={selectedPropertyId || ''}
                onValueChange={setSelectedPropertyId}
                disabled={contextProperties.length === 0}
              >
                <SelectTrigger id="property-select">
                  <SelectValue placeholder="物件を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {contextProperties.length > 0 ? (
                    contextProperties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id.toString()}>
                        {prop.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-properties" disabled>
                      登録されている物件がありません
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {contextProperties.length === 0 && (
                 <p className="text-sm text-red-600 mt-2">
                   アップロードするには、まず物件を登録してください。
                 </p>
              )}
              {contextProperties.length > 0 && !selectedPropertyId && (
                 <p className="text-sm text-gray-500 mt-2">
                   物件を選択せずにアップロードすると、書類から物件名が読み取られ、存在しない場合は新規に自動登録されます。
                 </p>
              )}
            </div>

            <div
              ref={dropRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex items-center space-x-4 transition-colors border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}`}
            >
              <Label htmlFor="file-upload" className="cursor-pointer flex items-center space-x-2">
                <Upload className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">ファイルを選択またはここにドロップ</span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf"
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
                <div className="flex justify-between text-sm text-gray-600">
                  <span>アップロード中...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">処理中</CardTitle>
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{processingCount}</div>
            <p className="text-xs text-muted-foreground">ファイル</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-muted-foreground">ファイル</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総収入</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">抽出済み</p>
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
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
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
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(result)}
                            className="hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            編集
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(result.id)}
                            disabled={isDeleting === result.id}
                            className="hover:bg-red-50 text-red-600 border-red-200"
                          >
                            {isDeleting === result.id ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            削除
                          </Button>
                        </>
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
                      {result.extractedData.contracts && result.extractedData.contracts.length > 0 ? (
                        <div className="mb-4">
                          <div className="font-semibold text-gray-700 mb-2">抽出結果</div>
                          <div className="mb-2 text-sm text-gray-700">
                            物件名: <span className="font-bold">{result.extractedData.propertyName}</span>
                          </div>
                          <div className="mb-2 text-sm text-gray-700">
                            合計金額: <span className="font-bold">
                              ¥{result.extractedData.contracts.reduce((sum, c) => sum + (c.amount || 0), 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full border text-sm">
                              <thead>
                                <tr>
                                  <th className="border px-2 py-1">部屋No.</th>
                                  <th className="border px-2 py-1">契約者</th>
                                  <th className="border px-2 py-1">合計</th>
                                  <th className="border px-2 py-1">年月</th>
                                </tr>
                              </thead>
                              <tbody>
                                {result.extractedData.contracts.map((c: any, idx: number) => (
                                  <tr key={c.room_no + c.tenant_name + idx}>
                                    <td className="border px-2 py-1">{c.room_no}</td>
                                    <td className="border px-2 py-1">{c.tenant_name}</td>
                                    <td className="border px-2 py-1">¥{c.amount?.toLocaleString()}</td>
                                    <td className="border px-2 py-1">{c.date}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">抽出データがありません</div>
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>OCR結果の編集</span>
            </DialogTitle>
            <DialogDescription>
              抽出されたデータを編集できます。変更後は保存ボタンを押してください。
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="property-name">物件名</Label>
              <Input
                id="property-name"
                value={editData.propertyName || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, propertyName: e.target.value }))}
                placeholder="物件名を入力"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">契約データ</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContract}
                  className="hover:bg-green-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  契約を追加
                </Button>
              </div>
              
              <div className="space-y-4">
                {editData.contracts?.map((contract, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">契約 {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeContract(index)}
                        className="hover:bg-red-50 text-red-600"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`room-${index}`}>部屋番号</Label>
                        <Input
                          id={`room-${index}`}
                          value={contract.room_no || ''}
                          onChange={(e) => updateContract(index, 'room_no', e.target.value)}
                          placeholder="101"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`tenant-${index}`}>契約者名</Label>
                        <Input
                          id={`tenant-${index}`}
                          value={contract.tenant_name || ''}
                          onChange={(e) => updateContract(index, 'tenant_name', e.target.value)}
                          placeholder="契約者名"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`amount-${index}`}>金額</Label>
                        <Input
                          id={`amount-${index}`}
                          type="number"
                          value={contract.amount || ''}
                          onChange={(e) => updateContract(index, 'amount', parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`date-${index}`}>年月</Label>
                        <Input
                          id={`date-${index}`}
                          value={contract.date || ''}
                          onChange={(e) => updateContract(index, 'date', e.target.value)}
                          placeholder="2025-06"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!editData.contracts || editData.contracts.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>契約データがありません</p>
                    <p className="text-sm">「契約を追加」ボタンで新しい契約を追加できます</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 