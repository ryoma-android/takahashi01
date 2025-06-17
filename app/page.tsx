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

// 高橋ホームの福井市物件データ
const takahashiProperties = [
  {
    id: 1,
    name: '高橋ホーム福井中央アパート',
    type: 'アパート',
    units: 16,
    occupiedUnits: 15,
    monthlyIncome: 960000,
    yearlyIncome: 11520000,
    expenses: 1800000,
    netIncome: 9720000,
    yieldRate: 9.2,
    location: '福井市中央',
    address: '福井県福井市中央1-5-12',
    buildYear: 2020,
    structure: 'RC造',
    totalFloors: 4,
    managementCompany: '高橋ホーム',
    propertyManager: '高橋 太郎'
  },
  {
    id: 2,
    name: '高橋ホーム駅前パーキング',
    type: '駐車場',
    units: 35,
    occupiedUnits: 32,
    monthlyIncome: 350000,
    yearlyIncome: 4200000,
    expenses: 680000,
    netIncome: 3520000,
    yieldRate: 12.8,
    location: '福井市大手',
    address: '福井県福井市大手2-8-5',
    buildYear: 2021,
    structure: 'アスファルト舗装',
    totalFloors: 1,
    managementCompany: '高橋ホーム',
    propertyManager: '高橋 花子'
  },
  {
    id: 3,
    name: '高橋ホーム片町商業ビル',
    type: '店舗・オフィス',
    units: 8,
    occupiedUnits: 7,
    monthlyIncome: 640000,
    yearlyIncome: 7680000,
    expenses: 1400000,
    netIncome: 6280000,
    yieldRate: 8.7,
    location: '福井市順化',
    address: '福井県福井市順化1-12-8',
    buildYear: 2018,
    structure: 'SRC造',
    totalFloors: 5,
    managementCompany: '高橋ホーム',
    propertyManager: '高橋 次郎'
  },
  {
    id: 4,
    name: '高橋ホーム花堂ファミリーマンション',
    type: 'ファミリーマンション',
    units: 12,
    occupiedUnits: 11,
    monthlyIncome: 780000,
    yearlyIncome: 9360000,
    expenses: 1200000,
    netIncome: 8160000,
    yieldRate: 9.5,
    location: '福井市花堂南',
    address: '福井県福井市花堂南3-2-15',
    buildYear: 2019,
    structure: 'RC造',
    totalFloors: 4,
    managementCompany: '高橋ホーム',
    propertyManager: '高橋 美咲'
  },
  {
    id: 5,
    name: '高橋ホーム学園前学生マンション',
    type: '学生マンション',
    units: 20,
    occupiedUnits: 18,
    monthlyIncome: 900000,
    yearlyIncome: 10800000,
    expenses: 1600000,
    netIncome: 9200000,
    yieldRate: 10.1,
    location: '福井市文京',
    address: '福井県福井市文京4-15-3',
    buildYear: 2022,
    structure: 'RC造',
    totalFloors: 3,
    managementCompany: '高橋ホーム',
    propertyManager: '高橋 健一'
  }
];

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

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 高橋ホーム全体の集計データ
  const totalProperties = takahashiProperties.length;
  const totalUnits = takahashiProperties.reduce((sum, p) => sum + p.units, 0);
  const totalOccupiedUnits = takahashiProperties.reduce((sum, p) => sum + p.occupiedUnits, 0);
  const occupancyRate = (totalOccupiedUnits / totalUnits) * 100;
  const totalMonthlyIncome = takahashiProperties.reduce((sum, p) => sum + p.monthlyIncome, 0);
  const totalYearlyIncome = takahashiProperties.reduce((sum, p) => sum + p.yearlyIncome, 0);
  const totalExpenses = takahashiProperties.reduce((sum, p) => sum + p.expenses, 0);
  const totalNetIncome = takahashiProperties.reduce((sum, p) => sum + p.netIncome, 0);
  const averageYield = (totalNetIncome / totalYearlyIncome) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* 背景アニメーション */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        {/* 高橋ホーム専用ヘッダー */}
        <div className={`mb-8 glass-effect rounded-2xl shadow-2xl p-8 border-l-4 border-blue-600 hover-lift ${isLoaded ? 'animate-fade-in-up' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-2xl animate-pulse-glow">
                <Home className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  高橋ホーム
                </h1>
                <p className="text-xl text-blue-600 font-semibold flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  不動産管理システム
                </p>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <Target className="h-4 w-4 mr-1" />
                  福井市内物件ポートフォリオ管理
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4 mb-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors">
                  <MapPin className="h-3 w-3 mr-1" />
                  福井市
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors">
                  <Building2 className="h-3 w-3 mr-1" />
                  {totalProperties}物件
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors">
                  <Award className="h-3 w-3 mr-1" />
                  優良管理
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1 hover:text-blue-600 transition-colors cursor-pointer">
                  <Phone className="h-4 w-4" />
                  <span>0776-XX-XXXX</span>
                </div>
                <div className="flex items-center space-x-1 hover:text-blue-600 transition-colors cursor-pointer">
                  <Mail className="h-4 w-4" />
                  <span>info@takahashi-home.jp</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使い方ガイドバナー */}
        <Card className={`mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover-lift ${isLoaded ? 'animate-slide-in-right' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <HelpCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    初めてご利用の方へ
                  </h3>
                  <p className="text-yellow-700">
                    システムの使い方がわからない方は、こちらの使い方ガイドをご覧ください
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setActiveTab('guide')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                使い方ガイドを見る
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 高橋ホーム業績サマリー */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 ${isLoaded ? 'animate-slide-in-right' : ''}`}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white card-hover animate-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">管理物件数</CardTitle>
              <Building2 className="h-5 w-5 opacity-80 animate-float" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={totalProperties} />
              </div>
              <p className="text-xs opacity-75 flex items-center">
                <Star className="h-3 w-3 mr-1" />
                福井市内全域
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white card-hover animate-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">入居率</CardTitle>
              <TrendingUp className="h-5 w-5 opacity-80 animate-float" style={{ animationDelay: '0.5s' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={Math.round(occupancyRate * 10) / 10} />%
              </div>
              <p className="text-xs opacity-75">
                <AnimatedCounter value={totalOccupiedUnits} />/<AnimatedCounter value={totalUnits} /> 戸
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white card-hover animate-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">月間収入</CardTitle>
              <DollarSign className="h-5 w-5 opacity-80 animate-float" style={{ animationDelay: '1s' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ¥<AnimatedCounter value={Math.round(totalMonthlyIncome / 1000)} />K
              </div>
              <p className="text-xs opacity-75 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                前月比 +3.2%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-700 text-white card-hover animate-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">年間純利益</CardTitle>
              <BarChart3 className="h-5 w-5 opacity-80 animate-float" style={{ animationDelay: '1.5s' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ¥<AnimatedCounter value={Math.round(totalNetIncome / 1000000)} />M
              </div>
              <p className="text-xs opacity-75 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                前年比 +12.5%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white card-hover animate-gradient">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">平均利回り</CardTitle>
              <TrendingUp className="h-5 w-5 opacity-80 animate-float" style={{ animationDelay: '2s' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                <AnimatedCounter value={Math.round(averageYield * 10) / 10} />%
              </div>
              <p className="text-xs opacity-75">福井市平均: 7.2%</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {takahashiProperties.map((property, index) => (
                <div 
                  key={property.id} 
                  className="border rounded-xl p-6 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 card-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{property.name}</h4>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {property.location}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      {property.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">入居率:</span>
                      <span className="font-bold text-lg">
                        {((property.occupiedUnits / property.units) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">月収入:</span>
                      <span className="font-bold text-green-600 text-lg">
                        ¥{property.monthlyIncome.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">利回り:</span>
                      <span className="font-bold text-blue-600 text-lg">
                        {property.yieldRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">担当者:</span>
                      <span className="font-medium text-purple-600">
                        {property.propertyManager}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="w-full bg-gray-200 rounded-full h-3 progress-bar">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${(property.occupiedUnits / property.units) * 100}%`,
                          animationDelay: `${index * 0.2}s`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* メインタブコンテンツ */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-2">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center space-x-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 rounded-lg transition-all duration-300"
            >
              <BarChart3 className="h-4 w-4" />
              <span>ダッシュボード</span>
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="flex items-center space-x-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 rounded-lg transition-all duration-300"
            >
              <Receipt className="h-4 w-4" />
              <span>支出管理</span>
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="flex items-center space-x-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 rounded-lg transition-all duration-300"
            >
              <FileText className="h-4 w-4" />
              <span>書類読み取り</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tax" 
              className="flex items-center space-x-2 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 rounded-lg transition-all duration-300"
            >
              <Calculator className="h-4 w-4" />
              <span>税務・保険</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center space-x-2 data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 rounded-lg transition-all duration-300"
            >
              <Calendar className="h-4 w-4" />
              <span>レポート</span>
            </TabsTrigger>
            <TabsTrigger 
              value="guide" 
              className="flex items-center space-x-2 data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700 rounded-lg transition-all duration-300"
            >
              <HelpCircle className="h-4 w-4" />
              <span>使い方ガイド</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 tab-content">
            <PropertyDashboard properties={takahashiProperties} />
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6 tab-content">
            <ExpenseTracker properties={takahashiProperties} />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6 tab-content">
            <DocumentOCR />
          </TabsContent>

          <TabsContent value="tax" className="space-y-6 tab-content">
            <TaxInsuranceManager />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6 tab-content">
            <ReportsGenerator properties={takahashiProperties} />
          </TabsContent>

          <TabsContent value="guide" className="space-y-6 tab-content">
            <UserGuide />
          </TabsContent>
        </Tabs>

        {/* 高橋ホーム専用フッター */}
        <div className={`mt-12 glass-effect rounded-2xl shadow-2xl p-8 border-t-4 border-blue-600 hover-lift ${isLoaded ? 'animate-fade-in-up' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                高橋ホーム 不動産管理システム
              </h3>
              <p className="text-gray-600 mt-1">福井市内の不動産投資・管理のトータルサポート</p>
              <div className="flex items-center space-x-4 mt-3">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <Award className="h-3 w-3 mr-1" />
                  優良管理会社
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  <Star className="h-3 w-3 mr-1" />
                  満足度98%
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="hover-lift"
                onClick={() => setActiveTab('guide')}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                使い方ガイド
              </Button>
              <Button variant="outline" size="sm" className="hover-lift">
                <Settings className="h-4 w-4 mr-2" />
                システム設定
              </Button>
              <Button variant="outline" size="sm" className="hover-lift">
                <Users className="h-4 w-4 mr-2" />
                担当者管理
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white hover-lift">
                <Phone className="h-4 w-4 mr-2" />
                サポート連絡
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}