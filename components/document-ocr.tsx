'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Zap
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
}

export function DocumentOCR() {
  const [ocrResults, setOcrResults] = useState<OCRResult[]>([
    {
      id: '1',
      fileName: '修繕費領収書_高橋ホーム福井中央_20241025.pdf',
      fileType: 'pdf',
      uploadDate: '2024-10-25',
      status: 'completed',
      extractedData: {
        amount: 1200000,
        date: '2024-10-15',
        vendor: '福井塗装工業株式会社',
        category: '修繕費',
        description: '外壁塗装工事一式（高橋ホーム福井中央アパート）',
        confidence: 94,
        propertyName: '高橋ホーム福井中央アパート'
      },
      rawText: '領収書\n福井塗装工業株式会社\n外壁塗装工事一式\n金額：1,200,000円\n日付：2024年10月15日\n福井県福井市中央1-5-12'
    },
    {
      id: '2',
      fileName: '固定資産税納税通知書_福井市.pdf',
      fileType: 'pdf',
      uploadDate: '2024-10-20',
      status: 'completed',
      extractedData: {
        amount: 285000,
        date: '2024-12-27',
        vendor: '福井市',
        category: '固定資産税',
        description: '令和6年度固定資産税（第3期）',
        confidence: 98,
        taxType: '固定資産税'
      }
    },
    {
      id: '3',
      fileName: '清掃費請求書_福井クリーン.jpg',
      fileType: 'image',
      uploadDate: '2024-10-22',
      status: 'completed',
      extractedData: {
        amount: 35000,
        date: '2024-10-20',
        vendor: '福井クリーンサービス',
        category: '清掃費',
        description: '共用部清掃（月額）',
        confidence: 89,
        propertyName: '高橋ホーム福井中央アパート'
      }
    },
    {
      id: '4',
      fileName: '駐車場補修見積書.pdf',
      fileType: 'pdf',
      uploadDate: '2024-11-01',
      status: 'processing',
      extractedData: {}
    },
    {
      id: '5',
      fileName: '北陸電力請求書_10月分.pdf',
      fileType: 'pdf',
      uploadDate: '2024-11-05',
      status: 'completed',
      extractedData: {
        amount: 28000,
        date: '2024-11-05',
        vendor: '北陸電力',
        category: '光熱費',
        description: '電気料金（10月分）',
        confidence: 96,
        propertyName: '高橋ホーム花堂ファミリーマンション'
      }
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);
  const [editingResult, setEditingResult] = useState<string | null>(null);
  const [editData, setEditData] = useState<OCRResult['extractedData']>({});
  const [showGuide, setShowGuide] = useState(false);

  // 高橋ホームの物件リスト
  const takahashiProperties = [
    '高橋ホーム福井中央アパート',
    '高橋ホーム駅前パーキング', 
    '高橋ホーム片町商業ビル',
    '高橋ホーム花堂ファミリーマンション',
    '高橋ホーム学園前学生マンション'
  ];

  // PDFデータから生成されたグラフ用データ
  const monthlyOCRData = [
    { month: '8月', 件数: 12, 金額: 850000 },
    { month: '9月', 件数: 15, 金額: 1200000 },
    { month: '10月', 件数: 18, 金額: 1650000 },
    { month: '11月', 件数: 8, 金額: 450000 }
  ];

  const categoryDistribution = [
    { category: '修繕費', 件数: 15, 金額: 2800000, color: '#EF4444' },
    { category: '清掃費', 件数: 12, 金額: 420000, color: '#F59E0B' },
    { category: '光熱費', 件数: 8, 金額: 280000, color: '#10B981' },
    { category: '固定資産税', 件数: 4, 金額: 1140000, color: '#3B82F6' },
    { category: 'その他', 件数: 6, 金額: 180000, color: '#8B5CF6' }
  ];

  const propertyExpenseData = [
    { property: '高橋ホーム福井中央アパート', 金額: 2100000 },
    { property: '高橋ホーム駅前パーキング', 金額: 680000 },
    { property: '高橋ホーム片町商業ビル', 金額: 1200000 },
    { property: '高橋ホーム花堂ファミリーマンション', 金額: 840000 },
    { property: '高橋ホーム学園前学生マンション', 金額: 950000 }
  ];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    Array.from(files).forEach((file) => {
      const newResult: OCRResult = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileType: file.type.includes('image') ? 'image' : 'pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'processing',
        extractedData: {},
        previewUrl: URL.createObjectURL(file)
      };

      setOcrResults(prev => [newResult, ...prev]);

      // Simulate OCR processing
      setTimeout(() => {
        simulateOCRProcessing(newResult.id, file.name);
      }, 2000 + Math.random() * 3000);
    });

    setIsUploading(false);
  }, []);

  const simulateOCRProcessing = (id: string, fileName: string) => {
    // 福井市の業者データベースを模擬
    const fukuiVendors = [
      '福井塗装工業株式会社', '福井クリーンサービス', '北陸電力', '福井道路工事株式会社',
      '北陸エレベーター', '福井市', '福井県', '福井ガス', '福井建設'
    ];

    let mockData: OCRResult['extractedData'] = {};
    
    if (fileName.includes('領収書') || fileName.includes('receipt')) {
      mockData = {
        amount: Math.floor(Math.random() * 800000) + 50000,
        date: '2024-11-' + (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0'),
        vendor: fukuiVendors[Math.floor(Math.random() * fukuiVendors.length)],
        category: ['修繕費', '清掃費', '保守点検'][Math.floor(Math.random() * 3)],
        description: '作業費一式（福井市内）',
        confidence: 85 + Math.random() * 15,
        propertyName: takahashiProperties[Math.floor(Math.random() * takahashiProperties.length)]
      };
    } else if (fileName.includes('税') || fileName.includes('tax')) {
      mockData = {
        amount: Math.floor(Math.random() * 400000) + 100000,
        date: '2024-12-' + (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0'),
        vendor: ['福井市', '福井県', '税務署'][Math.floor(Math.random() * 3)],
        category: '固定資産税',
        description: '令和6年度固定資産税',
        confidence: 95 + Math.random() * 5,
        taxType: '固定資産税'
      };
    } else if (fileName.includes('電力') || fileName.includes('ガス')) {
      mockData = {
        amount: Math.floor(Math.random() * 50000) + 15000,
        date: '2024-11-' + (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0'),
        vendor: ['北陸電力', '福井ガス'][Math.floor(Math.random() * 2)],
        category: '光熱費',
        description: '月額料金',
        confidence: 92 + Math.random() * 8,
        propertyName: takahashiProperties[Math.floor(Math.random() * takahashiProperties.length)]
      };
    }

    setOcrResults(prev => prev.map(result => 
      result.id === id 
        ? { ...result, status: 'completed', extractedData: mockData }
        : result
    ));
  };

  const handleEdit = (result: OCRResult) => {
    setEditingResult(result.id);
    setEditData(result.extractedData);
  };

  const handleSaveEdit = () => {
    if (!editingResult) return;

    setOcrResults(prev => prev.map(result => 
      result.id === editingResult 
        ? { ...result, extractedData: editData }
        : result
    ));
    setEditingResult(null);
    setEditData({});
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
                スマホで領収書や請求書を撮影するか、PDFファイルを選択します
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
            <p className="text-xs text-muted-foreground">アップロード済み</p>
          </CardContent>
        </Card>
      </div>

      {/* PDF Data Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>月別PDF処理状況</CardTitle>
            <CardDescription>アップロードされたPDFの処理件数と金額</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyOCRData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === '件数') return [value, '件'];
                    return [`¥${value.toLocaleString()}`, '金額'];
                  }}
                />
                <Bar yAxisId="left" dataKey="件数" fill="#3B82F6" />
                <Bar yAxisId="right" dataKey="金額" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>カテゴリ別データ分析</CardTitle>
            <CardDescription>PDFから抽出されたカテゴリ別データ</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, 件数 }) => `${category} ${件数}件`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="金額"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Property-wise Expense Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>高橋ホーム物件別支出分析（PDFデータ基準）</CardTitle>
          <CardDescription>PDFから抽出されたデータによる物件別支出状況</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={propertyExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="property" />
              <YAxis />
              <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
              <Bar dataKey="金額" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>書類アップロード</span>
          </CardTitle>
          <CardDescription>
            領収書、請求書、納税通知書などをアップロードして自動でデータを抽出・グラフ化します。
            対応形式: PDF, JPG, PNG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              ファイルをドラッグ&ドロップまたはクリックしてアップロード
            </p>
            <p className="text-sm text-gray-500 mb-4">
              PDF、画像ファイル（JPG、PNG）に対応 - 福井市の業者データベース対応
            </p>
            <Input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? '処理中...' : 'ファイルを選択'}
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <Card>
        <CardHeader>
          <CardTitle>処理結果一覧</CardTitle>
          <CardDescription>アップロードしたファイルの処理状況と抽出データ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ocrResults.map((result) => (
              <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(result.fileType)}
                    <div>
                      <p className="font-medium">{result.fileName}</p>
                      <p className="text-sm text-gray-600">アップロード日: {result.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(result.status)}
                    {result.extractedData.confidence && (
                      <Badge variant="outline">
                        信頼度: {Math.round(result.extractedData.confidence)}%
                      </Badge>
                    )}
                  </div>
                </div>

                {result.status === 'processing' && (
                  <div className="mt-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">OCR処理中...</span>
                    </div>
                    <Progress value={33} className="h-2" />
                  </div>
                )}

                {result.status === 'completed' && result.extractedData && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    {editingResult === result.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>金額</Label>
                            <Input
                              type="number"
                              value={editData.amount || ''}
                              onChange={(e) => setEditData({...editData, amount: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <Label>日付</Label>
                            <Input
                              type="date"
                              value={editData.date || ''}
                              onChange={(e) => setEditData({...editData, date: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>業者・支払先</Label>
                            <Input
                              value={editData.vendor || ''}
                              onChange={(e) => setEditData({...editData, vendor: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>物件名</Label>
                            <Select 
                              value={editData.propertyName || ''} 
                              onValueChange={(value) => setEditData({...editData, propertyName: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="物件を選択" />
                              </SelectTrigger>
                              <SelectContent>
                                {takahashiProperties.map((property) => (
                                  <SelectItem key={property} value={property}>
                                    {property}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>カテゴリ</Label>
                            <Select 
                              value={editData.category || ''} 
                              onValueChange={(value) => setEditData({...editData, category: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="カテゴリを選択" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="修繕費">修繕費</SelectItem>
                                <SelectItem value="清掃費">清掃費</SelectItem>
                                <SelectItem value="保守点検">保守点検</SelectItem>
                                <SelectItem value="固定資産税">固定資産税</SelectItem>
                                <SelectItem value="所得税">所得税</SelectItem>
                                <SelectItem value="保険料">保険料</SelectItem>
                                <SelectItem value="光熱費">光熱費</SelectItem>
                                <SelectItem value="その他">その他</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>詳細</Label>
                          <Textarea
                            value={editData.description || ''}
                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleSaveEdit} size="sm">
                            <Save className="h-4 w-4 mr-1" />
                            保存
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit} size="sm">
                            キャンセル
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">金額:</span>
                            <span className="ml-2 font-semibold">
                              {result.extractedData.amount ? `¥${result.extractedData.amount.toLocaleString()}` : '未検出'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">日付:</span>
                            <span className="ml-2">{result.extractedData.date || '未検出'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">業者・支払先:</span>
                            <span className="ml-2">{result.extractedData.vendor || '未検出'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">物件名:</span>
                            <span className="ml-2">{result.extractedData.propertyName || '未分類'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">カテゴリ:</span>
                            <span className="ml-2">
                              {result.extractedData.category ? (
                                <Badge variant="outline">{result.extractedData.category}</Badge>
                              ) : '未分類'}
                            </span>
                          </div>
                        </div>
                        {result.extractedData.description && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-600">詳細:</span>
                            <span className="ml-2">{result.extractedData.description}</span>
                          </div>
                        )}
                        <div className="flex space-x-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(result)}>
                            <Edit className="h-4 w-4 mr-1" />
                            編集
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            プレビュー
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-1" />
                            グラフに追加
                          </Button>
                          <Button variant="outline" size="sm">
                            収支に追加
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}