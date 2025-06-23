'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  FileText, 
  TrendingUp, 
  Calculator, 
  Receipt, 
  BarChart3,
  DollarSign,
  Calendar,
  MapPin,
  Home,
  Users,
  Phone,
  Mail,
  Settings,
  Star,
  Award,
  Zap,
  Target,
  HelpCircle,
  BookOpen
} from 'lucide-react';

// Import components dynamically to prevent potential circular dependencies
import dynamic from 'next/dynamic';
import { useProperties } from '@/hooks/use-properties';

const PropertyDashboard = dynamic(() => import('@/components/property-dashboard').then(mod => ({ default: mod.PropertyDashboard })), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

const ExpenseTracker = dynamic(() => import('@/components/expense-tracker').then(mod => ({ default: mod.ExpenseTracker })), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

const DocumentOCR = dynamic(() => import('@/components/document-ocr').then(mod => ({ default: mod.DocumentOCR })), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

const TaxInsuranceManager = dynamic(() => import('@/components/tax-insurance-manager').then(mod => ({ default: mod.TaxInsuranceManager })), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

const ReportsGenerator = dynamic(() => import('@/components/reports-generator').then(mod => ({ default: mod.ReportsGenerator })), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

const UserGuide = dynamic(() => import('@/components/user-guide').then(mod => ({ default: mod.UserGuide })), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

// アニメーション用のカウンター
function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span className="counter">{count.toLocaleString()}</span>;
}

export default function TakahashiHomeSystem() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 物件データを取得
  const { properties, loading: propertiesLoading, error: propertiesError } = useProperties();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // タブの変更を監視（デバッグ用）
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
  }, [activeTab]);

  // タブ切り替え関数
  const handleTabChange = (value: string) => {
    console.log('Tab change requested:', value);
    setActiveTab(value);
  };

  // タブまでスクロールする関数
  const scrollToTabs = () => {
    const tabsElement = document.querySelector('[role="tablist"]');
    if (tabsElement) {
      tabsElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };

  // 高橋ホーム全体の集計データ（プロパティがロードされている場合のみ計算）
  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const totalOccupiedUnits = properties.reduce((sum, p) => sum + p.occupied_units, 0);
  const occupancyRate = totalUnits > 0 ? (totalOccupiedUnits / totalUnits) * 100 : 0;
  const totalMonthlyIncome = properties.reduce((sum, p) => sum + p.monthly_income, 0);
  const totalYearlyIncome = properties.reduce((sum, p) => sum + p.yearly_income, 0);
  const totalExpenses = properties.reduce((sum, p) => sum + p.expenses, 0);
  const totalNetIncome = properties.reduce((sum, p) => sum + p.net_income, 0);
  const averageYield = totalYearlyIncome > 0 ? (totalNetIncome / totalYearlyIncome) * 100 : 0;

  // 使い方ガイドボタンのクリックハンドラー
  const handleGuideClick = () => {
    console.log('Guide button clicked');
    setActiveTab('guide');
    // タブ切り替え後に少し遅延してスクロール
    setTimeout(() => {
      scrollToTabs();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 relative z-10">
        {/* 高橋ホーム専用ヘッダー */}
        <div className={`mb-8 glass-effect rounded-2xl shadow-2xl p-4 sm:p-8 border-l-4 border-blue-600 hover-lift ${isLoaded ? 'animate-fade-in-up' : ''}`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 sm:p-4 rounded-2xl animate-pulse-glow">
                <Home className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  高橋ホーム
                </h1>
                <p className="text-lg sm:text-xl text-blue-600 font-semibold flex items-center">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  不動産管理システム
                </p>
                <p className="text-xs sm:text-sm text-gray-600 flex items-center mt-1">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  福井市内物件ポートフォリオ管理
                </p>
              </div>
            </div>
            <div className="text-left lg:text-right w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  福井市
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors text-xs">
                  <Building2 className="h-3 w-3 mr-1" />
                  {propertiesLoading ? '...' : totalProperties}物件
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center space-x-1 hover:text-blue-600 transition-colors cursor-pointer">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>080-8699-7005</span>
                </div>
                <div className="flex items-center space-x-1 hover:text-blue-600 transition-colors cursor-pointer">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>takahashiryouma0102@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使い方ガイドバナー */}
        <Card className={`mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover-lift ${isLoaded ? 'animate-slide-in-right' : ''}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
                  <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-yellow-800">
                    初めてご利用の方へ
                  </h3>
                  <p className="text-sm sm:text-base text-yellow-700">
                    システムの使い方がわからない方は、こちらの使い方ガイドをご覧ください
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleGuideClick}
                className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                使い方ガイドを見る
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 高橋ホーム業績サマリー */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8 ${isLoaded ? 'animate-slide-in-right' : ''}`}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white card-hover animate-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium opacity-90">管理物件数</CardTitle>
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 opacity-80 animate-float" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {propertiesLoading ? '...' : <AnimatedCounter value={totalProperties} />}
              </div>
              <p className="text-xs sm:text-sm text-blue-100">物件</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white card-hover animate-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium opacity-90">入居率</CardTitle>
              <Users className="h-4 w-4 sm:h-5 sm:w-5 opacity-80 animate-float" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {propertiesLoading ? '...' : `${occupancyRate.toFixed(1)}%`}
              </div>
              <p className="text-xs sm:text-sm text-green-100">
                {propertiesLoading ? '...' : `${totalOccupiedUnits}/${totalUnits}`} 区画
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white card-hover animate-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium opacity-90">月収入</CardTitle>
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 opacity-80 animate-float" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {propertiesLoading ? '...' : <AnimatedCounter value={totalMonthlyIncome} />}
              </div>
              <p className="text-xs sm:text-sm text-purple-100">円</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-700 text-white card-hover animate-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium opacity-90">年収入</CardTitle>
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 opacity-80 animate-float" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {propertiesLoading ? '...' : <AnimatedCounter value={totalYearlyIncome} />}
              </div>
              <p className="text-xs sm:text-sm text-orange-100">円</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-700 text-white card-hover animate-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium opacity-90">平均利回り</CardTitle>
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 opacity-80 animate-float" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {propertiesLoading ? '...' : `${averageYield.toFixed(1)}%`}
              </div>
              <p className="text-xs sm:text-sm text-red-100">年率</p>
            </CardContent>
          </Card>
        </div>

        {/* 高橋ホーム物件一覧（簡易表示） */}
        <Card className={`mb-8 glass-effect hover-lift ${isLoaded ? 'animate-slide-in-left' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-blue-600 animate-float" />
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                高橋ホーム管理物件一覧
              </span>
            </CardTitle>
            <CardDescription>福井市内の全管理物件の概要</CardDescription>
          </CardHeader>
          <CardContent>
            {propertiesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">物件データを読み込み中...</p>
                </div>
              </div>
            ) : propertiesError ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-red-600 mb-4">データの読み込みに失敗しました</p>
                  <p className="text-gray-600 text-sm">{propertiesError}</p>
                </div>
              </div>
            ) : properties.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">物件データが見つかりません</p>
                  <p className="text-gray-500 text-sm">Supabaseにデータを追加してください</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {properties.map((property, index) => (
                  <div 
                    key={property.id} 
                    className="border rounded-xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 card-hover"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-base sm:text-lg truncate">{property.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{property.location}</span>
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-2 flex-shrink-0">
                        {getPropertyTypeDisplay(property.type)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">入居率:</span>
                        <span className="font-bold text-base sm:text-lg">
                          {((property.occupied_units / property.units) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">月収入:</span>
                        <span className="font-bold text-green-600 text-base sm:text-lg">
                          ¥{property.monthly_income.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">利回り:</span>
                        <span className="font-bold text-blue-600 text-base sm:text-lg">
                          {property.yield_rate}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">担当者:</span>
                        <span className="font-medium text-purple-600 truncate">
                          {property.property_manager}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 progress-bar">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${(property.occupied_units / property.units) * 100}%`,
                            animationDelay: `${index * 0.2}s`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* メインタブコンテンツ */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="flex flex-wrap w-full bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-2 gap-1 sm:gap-2 overflow-x-auto">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">ダッシュボード</span>
              <span className="sm:hidden">ダッシュ</span>
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 rounded-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0"
            >
              <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">支出管理</span>
              <span className="sm:hidden">支出</span>
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">書類読み取り</span>
              <span className="sm:hidden">書類</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tax" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 rounded-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0"
            >
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">税務・保険</span>
              <span className="sm:hidden">税務</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 rounded-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">レポート</span>
              <span className="sm:hidden">レポート</span>
            </TabsTrigger>
            <TabsTrigger 
              value="guide" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700 rounded-lg transition-all duration-300 text-xs sm:text-sm px-2 sm:px-3 py-2 whitespace-nowrap flex-shrink-0"
            >
              <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">使い方ガイド</span>
              <span className="sm:hidden">ガイド</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 tab-content">
            <PropertyDashboard />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6 tab-content">
            <ExpenseTracker properties={[]} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6 tab-content">
            <DocumentOCR />
          </TabsContent>

          <TabsContent value="tax" className="space-y-6 tab-content">
            <TaxInsuranceManager />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6 tab-content">
            <ReportsGenerator properties={[]} />
          </TabsContent>

          <TabsContent value="guide" className="space-y-6 tab-content">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">ガイドタブが選択されました。UserGuideコンポーネントを読み込み中...</p>
            </div>
            <UserGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 物件タイプの表示用変換関数
function getPropertyTypeDisplay(type: string): string {
  const typeMap: { [key: string]: string } = {
    'apartment': 'アパート',
    'parking': '駐車場',
    'commercial': '店舗・オフィス',
    'family_mansion': 'ファミリーマンション',
    'student_mansion': '学生マンション'
  };
  return typeMap[type] || type;
}