'use client';

import { useState, useEffect, useMemo } from 'react';
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
  BookOpen,
  Plus,
  Check,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { supabase } from '@/lib/supabase';

// Import components dynamically to prevent potential circular dependencies
import dynamic from 'next/dynamic';
import { useProperties } from '@/contexts/PropertyContext';

const PropertyDashboard = dynamic(() => import('@/components/property-dashboard').then(mod => mod.PropertyDashboard), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

const ExpenseTracker = dynamic(() => import('@/components/expense-tracker').then(mod => mod.ExpenseTracker), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

const DocumentOCR = dynamic(() => import('@/components/document-ocr-new').then(mod => mod.DocumentOCR), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

const TaxInsuranceManager = dynamic(() => import('@/components/tax-insurance-manager').then(mod => mod.TaxInsuranceManager), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

const ReportsGenerator = dynamic(() => import('@/components/reports-generator').then(mod => mod.ReportsGenerator), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

const UserGuide = dynamic(() => import('@/components/user-guide').then(mod => mod.UserGuide), {
  loading: () => <div className="flex items-center justify-center h-64 animate-pulse">読み込み中...</div>
});

// --- 型定義 ---
interface Expense {
  id: number;
  property_id: number;
  property_name?: string;
  date: string;
  category: string;
  amount: number;
  room_no?: string;
  tenant_name?: string;
  created_at: string;
}
import { Property } from '@/contexts/PropertyContext';

export default function TakahashiHomeSystem() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedYears, setSelectedYears] = useState<string[]>(['2025']);
  const [selectedDetailYear, setSelectedDetailYear] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [isYearSelectorOpen, setIsYearSelectorOpen] = useState(false);
  
  // コンテキストから物件データを取得
  const { properties, fetchProperties, isLoading: propertiesLoading } = useProperties();

  // 物件名が空でないものだけをフィルター対象・初期値に
  const validPropertyNames = properties.filter(p => p.name && p.name.trim() !== '').map(p => p.name);
  const [selectedProperties, setSelectedProperties] = useState<string[]>(validPropertyNames);
  // propertiesが変わったらselectedPropertiesも更新
  useEffect(() => {
    setSelectedProperties(validPropertyNames);
  }, [validPropertyNames]);

  // 1. Fetch expenses from the DB
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const fetchExpenses = async () => {
    const { data, error } = await supabase.from('expenses').select('*');
    if (!error && data) setExpenses(data);
  };
  useEffect(() => {
    fetchExpenses();
  }, [properties]);

  useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0]);
    }
  }, [properties, selectedProperty]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // タブ切り替え関数
  const handleTabChange = (value: string) => {
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

  // 年選択の処理
  const handleYearToggle = (year: string) => {
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        // 最低1つは選択状態を保つ
        if (prev.length === 1) return prev;
        return prev.filter(y => y !== year);
      } else {
        return [...prev, year];
      }
    });
  };

  // 年選択をリセット
  const handleResetYears = () => {
    setSelectedYears(['2025']);
  };

  // ドロップダウンの外側をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.year-selector')) {
        setIsYearSelectorOpen(false);
      }
    };

    if (isYearSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isYearSelectorOpen]);

  // タカハシホーム全体の集計データ（プロパティがロードされている場合のみ計算）
  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const totalOccupiedUnits = properties.reduce((sum, p) => sum + p.occupied_units, 0);
  const occupancyRate = totalUnits > 0 ? (totalOccupiedUnits / totalUnits) * 100 : 0;
  const totalMonthlyIncome = properties.reduce((sum, p) => sum + p.monthly_income, 0);
  const totalYearlyIncome = properties.reduce((sum, p) => sum + p.yearly_income, 0);
  const totalExpenses = properties.reduce((sum, p) => sum + p.expenses, 0);
  const totalNetIncome = properties.reduce((sum, p) => sum + p.net_income, 0);
  const averageYield = totalYearlyIncome > 0 ? (totalNetIncome / totalYearlyIncome) * 100 : 0;

  // 家賃のみフィルタ
  const rentExpenses = expenses.filter(exp => exp.category === '家賃');

  // 全体の月別データ（物件別ではなく全体の合計）
  const overallMonthGroups = useMemo(() => {
    const map = new Map<string, { yearMonth: string; total: number }>();
    rentExpenses.forEach(exp => {
      if (!exp.date || exp.date.length < 7) {
        return;
      }
      const yearMonth = exp.date.slice(0, 7);
      if (!map.has(yearMonth)) {
        map.set(yearMonth, { yearMonth, total: 0 });
      }
      map.get(yearMonth)!.total += exp.amount || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  }, [rentExpenses]);

  // 選択中物件の月リスト（物件詳細モーダル用）
  const months = selectedProperty
    ? Array.from(new Set(expenses.filter(e => e.property_id === selectedProperty.id).map(e => e.date.slice(0, 7)))).sort()
    : [];

  // 4. For property detail modal, aggregate monthly income and contract details from expenses
  const contractDetails = selectedMonth && selectedProperty ?
    rentExpenses.filter(e => e.property_id === selectedProperty.id && e.date.slice(0, 7) === selectedMonth)
      .map(e => ({
        room_no: e.room_no ?? '',
        tenant_name: e.tenant_name ?? '',
        amount: e.amount,
        date: e.date
      })) : [];

  // Available years for the year selector
  const availableYears = Array.from(new Set(overallMonthGroups.map(data => data.yearMonth.split('-')[0])));

  // --- 年ごとの合計金額比較表データ（全体の合計） ---
  const yearlyTotals: { [year: string]: number } = {};
  overallMonthGroups.forEach(({ yearMonth, total }) => {
    const year = yearMonth.split('-')[0];
    if (!yearlyTotals[year]) yearlyTotals[year] = 0;
    yearlyTotals[year] += total;
  });
  const sortedYears = Object.keys(yearlyTotals).sort();

  // --- 年ごと合計金額グラフ用データ（全体の合計） ---
  const yearlyBarData = sortedYears
    .filter(year => selectedYears.includes(year))
    .map(year => ({
      year,
      total: yearlyTotals[year]
    }));

  // 月別グラフ用データ（全体の合計、1月から12月まで）
  const monthlyBarData = useMemo(() => {
    if (selectedYears.length === 0) return [];
    
    const data: any[] = [];
    selectedYears.forEach(year => {
      // 1月から12月までのデータを作成
      for (let month = 1; month <= 12; month++) {
        const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
        const monthData = overallMonthGroups.find(data => data.yearMonth === yearMonth);
        const total = monthData?.total || 0;
        
        data.push({
          yearMonth: `${year}/${month}`,
          year,
          month,
          total
        });
      }
    });
    return data.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
  }, [selectedYears, overallMonthGroups]);

  // 物件詳細モーダルの月ごとの収入グラフ用データ
  const selectedPropertyMonthlyData = selectedProperty ? (() => {
    const propExpenses = expenses.filter(e => e.property_id === selectedProperty.id); // 一時的に全件
    const monthMap = new Map<string, number>();
    propExpenses.forEach(e => {
      if (!e.date || e.date.length < 7) return;
      const ym = e.date.slice(0, 7);
      monthMap.set(ym, (monthMap.get(ym) || 0) + (e.amount || 0));
    });
    return Array.from(monthMap.entries()).map(([yearMonth, income]: [string, number]) => ({ yearMonth: yearMonth.replace('-', '/'), income }));
  })() : [];

  // 年候補リスト
  const availableDetailYears = Array.from(new Set(selectedPropertyMonthlyData.map(d => d.yearMonth.split('/')[0])));
  // 年でフィルタ（複数年度対応）
  const filteredDetailMonthlyData = selectedYears.length > 0
    ? selectedPropertyMonthlyData.filter(d => selectedYears.includes(d.yearMonth.split('/')[0]))
    : selectedPropertyMonthlyData;

  // 契約者ごと内訳
  const selectedDetails = (() => {
    if (!selectedProperty?.id || !selectedMonth) return [];
    return rentExpenses
      .filter(exp => exp.property_id === selectedProperty.id && exp.date.slice(0, 7) === selectedMonth)
      .reduce((acc, exp) => {
        const key = `${exp.room_no || ''}_${exp.tenant_name || ''}`;
        if (!acc[key]) {
          acc[key] = {
            room_no: exp.room_no || '',
            tenant_name: exp.tenant_name || '',
            total: 0,
          };
        }
        acc[key].total += exp.amount || 0;
        return acc;
      }, {} as Record<string, { room_no: string; tenant_name: string; total: number }>);
  })();

  const [isPropertyDetailModalOpen, setIsPropertyDetailModalOpen] = useState(false);

  // 物件カードクリック時
  const handleOpenPropertyDetail = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyDetailModalOpen(true);
  };

  // 物件編集・追加用の状態
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [propertyForm, setPropertyForm] = useState<Partial<Property>>({});

  // 物件編集ボタン
  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setPropertyForm(property);
    setIsPropertyModalOpen(true);
  };
  // 物件追加ボタン
  const handleAddProperty = () => {
    setEditingProperty(null);
    setPropertyForm({});
    setIsPropertyModalOpen(true);
  };
  // 物件削除ボタン
  const handleDeleteProperty = async (property: Property) => {
    if (!confirm(`${property.name} を削除しますか？`)) return;
    await fetch('/api/properties', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: property.id }),
    });
    await fetchProperties();
  };
  // 物件保存
  const handleSaveProperty = async () => {
    const payload = { name: propertyForm.name };
    if (editingProperty) {
      // 編集
      await fetch(`/api/properties/${editingProperty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      // 追加
      await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setIsPropertyModalOpen(false);
    await fetchProperties();
  };

  // 契約編集・追加用の状態
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Expense | null>(null);
  const [contractForm, setContractForm] = useState<Partial<Expense>>({});

  // 契約編集ボタン
  const handleEditContract = (contract: Expense) => {
    setEditingContract(contract);
    setContractForm(contract);
    setIsContractModalOpen(true);
  };
  // 契約者追加ボタン
  const handleAddContract = () => {
    setEditingContract(null);
    setContractForm({ property_id: selectedProperty?.id, date: selectedMonth || '', amount: 0 });
    setIsContractModalOpen(true);
  };
  // 契約削除ボタン
  const handleDeleteContract = async (contract: Expense) => {
    if (!confirm(`${contract.room_no || ''} ${contract.tenant_name || ''} を削除しますか？`)) return;
    await fetch(`/api/expenses/${contract.id}`, { method: 'DELETE' });
    // 再取得
    const { data, error } = await supabase.from('expenses').select('*');
    if (!error && data) setExpenses(data);
  };
  // 契約保存
  const handleSaveContract = async () => {
    const payload = {
      property_id: contractForm.property_id,
      property_name: contractForm.property_name,
      room_no: contractForm.room_no,
      tenant_name: contractForm.tenant_name,
      amount: contractForm.amount,
      date: contractForm.date,
      category: '家賃',
    };
    if (editingContract) {
      // 編集
      await fetch(`/api/expenses/${editingContract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      // 追加
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setIsContractModalOpen(false);
    // 再取得
    const { data, error } = await supabase.from('expenses').select('*');
    if (!error && data) setExpenses(data);
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
        {/* タカハシホーム専用ヘッダー */}
        <div className={`mb-8 glass-effect rounded-2xl shadow-2xl p-4 sm:p-8 border-l-4 border-blue-600 hover-lift ${isLoaded ? 'animate-fade-in-up' : ''}`}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 sm:p-4 rounded-2xl animate-pulse-glow">
                <Home className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  タカハシホーム
                </h1>
                <p className="text-lg sm:text-xl text-blue-600 font-semibold flex items-center">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  不動産管理システム
                </p>
              </div>
            </div>
            <div className="text-left lg:text-right w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3">
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
                  <span className="break-all font-medium text-blue-700 underline hover:underline select-all">takahashiryouma0102@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* メインタブコンテンツ */}
        <div className="rounded-xl bg-white/60 backdrop-blur-md shadow-lg border border-gray-200/80">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="p-2 sm:p-4 border-b border-gray-200/80">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-1 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-100 data-[state=active]:to-green-100 data-[state=active]:text-blue-700 data-[state=active]:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 whitespace-nowrap"
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">ダッシュボード</span>
              <span className="sm:hidden">ダッシュ</span>
            </TabsTrigger>
            <TabsTrigger 
              value="expenses" 
              className="flex items-center gap-1 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-500 transition-all duration-200 hover:bg-green-50 hover:text-green-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-100 data-[state=active]:to-blue-100 data-[state=active]:text-green-700 data-[state=active]:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 whitespace-nowrap"
            >
              <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">支出管理</span>
              <span className="sm:hidden">支出</span>
            </TabsTrigger>
            <TabsTrigger 
                  value="ocr" 
              className="flex items-center gap-1 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-500 transition-all duration-200 hover:bg-purple-50 hover:text-purple-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-100 data-[state=active]:to-blue-100 data-[state=active]:text-purple-700 data-[state=active]:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 whitespace-nowrap"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">書類読み取り</span>
              <span className="sm:hidden">書類</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tax" 
              className="flex items-center gap-1 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-500 transition-all duration-200 hover:bg-amber-50 hover:text-amber-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-100 data-[state=active]:to-yellow-100 data-[state=active]:text-amber-700 data-[state=active]:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 whitespace-nowrap"
            >
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">税務・保険</span>
              <span className="sm:hidden">税務</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="flex items-center gap-1 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-500 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-100 data-[state=active]:to-blue-100 data-[state=active]:text-indigo-700 data-[state=active]:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 whitespace-nowrap"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">レポート</span>
              <span className="sm:hidden">レポート</span>
            </TabsTrigger>
            <TabsTrigger 
              value="guide" 
              className="flex items-center gap-1 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-500 transition-all duration-200 hover:bg-yellow-50 hover:text-yellow-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-100 data-[state=active]:to-amber-100 data-[state=active]:text-yellow-700 data-[state=active]:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 whitespace-nowrap"
            >
              <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">使い方ガイド</span>
              <span className="sm:hidden">ガイド</span>
            </TabsTrigger>
          </TabsList>
            </div>
            
            <TabsContent value="dashboard" className="p-4 sm:p-6">
              <Card className="mb-8 modern-glass-card shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-green-400 rounded-t-xl p-6">
                  <CardTitle className="text-white text-2xl font-bold flex items-center gap-3">
                    <Building2 className="h-7 w-7 text-white animate-float" />
                    物件一覧
                  </CardTitle>
                  <div className="text-white/80 text-base mt-2">タカハシホーム全管理物件</div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {properties.filter(p => p.name && p.name.trim() !== '').map((property) => (
                      <Card key={property.id} className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 hover:from-blue-50 hover:to-green-50 transition-all duration-300 rounded-2xl border-0 shadow-lg hover:shadow-2xl hover:-translate-y-1 cursor-pointer" onClick={() => { handleOpenPropertyDetail(property); }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardHeader className="relative p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow-lg">
                                <Home className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                                  {property.name || '(物件名未登録)'}
                                </CardTitle>
                                <div className="text-sm text-gray-600 mt-1">
                                  {getPropertyTypeDisplay(property.type)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="relative p-6 pt-0">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              クリックして詳細を表示
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-blue-100" onClick={e => { e.stopPropagation(); handleEditProperty(property); }}>
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z" /></svg>
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-red-100" onClick={e => { e.stopPropagation(); handleDeleteProperty(property); }}>
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="mb-8 modern-glass-card shadow-xl border-0">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-t-xl p-6">
                  <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-white" />
                    全体収入分析
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* 年選択フィルター */}
                    <div className="flex items-center gap-3">
                      <span className="text-white/90 text-sm font-medium">年選択:</span>
                      <div className="relative">
                        <button
                          onClick={() => setIsYearSelectorOpen(!isYearSelectorOpen)}
                          className="year-selector flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-white text-sm font-medium hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                          <Calendar className="h-4 w-4" />
                          <span>{selectedYears.length === 0 ? '年を選択' : `${selectedYears.length}年選択中`}</span>
                          <svg className="h-4 w-4 transition-transform duration-200" style={{ transform: isYearSelectorOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {/* 選択された年のバッジ */}
                        {selectedYears.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedYears.map(year => (
                              <Badge
                                key={year}
                                variant="secondary"
                                className="bg-white/30 text-white border-white/50 hover:bg-white/40 transition-all duration-200 cursor-pointer group"
                                onClick={() => handleYearToggle(year)}
                              >
                                {year}
                                <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </Badge>
                            ))}
                            {selectedYears.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleResetYears}
                                className="h-6 px-2 text-xs text-white/70 hover:text-white hover:bg-white/20"
                              >
                                リセット
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {/* 年選択ドロップダウン */}
                        {isYearSelectorOpen && (
                          <div className="year-selector absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
                            <div className="p-3 border-b border-gray-100">
                              <div className="text-sm font-medium text-gray-700 mb-2">比較したい年を選択</div>
                              <div className="text-xs text-gray-500">複数選択可能です</div>
                            </div>
                            <div className="p-2">
                              {availableYears.length > 0 ? (
                                availableYears.map(year => (
                                  <button
                                    key={year}
                                    onClick={() => handleYearToggle(year)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                                      selectedYears.includes(year)
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    <span className="font-medium">{year}年</span>
                                    {selectedYears.includes(year) && (
                                      <Check className="h-4 w-4 text-blue-600" />
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                  データがありません
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 表示モード切り替え */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/90 text-sm font-medium">表示:</span>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('month')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                            viewMode === 'month' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          月別
                        </button>
                        <button
                          onClick={() => setViewMode('year')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                            viewMode === 'year' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          年別
                        </button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* 年別合計サマリー */}
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(yearlyTotals).slice(-3).reverse().map(([year, total]) => (
                        <div key={year} className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl border border-blue-200">
                          <div className="text-sm text-gray-600 mb-1">{year}年合計</div>
                          <div className="text-2xl font-bold text-blue-700">¥{total.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* グラフ表示 */}
                  <ResponsiveContainer width="100%" height={400}>
                    {viewMode === 'month' ? (
                      // 月別グラフ
                      monthlyBarData.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                          <div className="text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>データがありません</p>
                          </div>
                        </div>
                      ) : (
                        <BarChart data={monthlyBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="yearMonth" 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickFormatter={(value) => `¥${value.toLocaleString()}`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value: any) => [`¥${value.toLocaleString()}`, '月収入']}
                          />
                          <Bar 
                            dataKey="total" 
                            name="月収入" 
                            fill="url(#gradient)"
                            radius={[4, 4, 0, 0]}
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      )
                    ) : (
                      // 年別グラフ
                      yearlyBarData.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                          <div className="text-center">
                            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>データがありません</p>
                          </div>
                        </div>
                      ) : (
                        <BarChart data={yearlyBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="year" 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                            tickFormatter={(value) => `¥${value.toLocaleString()}`}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value: any) => [`¥${value.toLocaleString()}`, '年収入']}
                          />
                          <Bar 
                            dataKey="total" 
                            name="年収入" 
                            fill="url(#yearGradient)"
                            radius={[4, 4, 0, 0]}
                          />
                          <defs>
                            <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      )
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>
          </TabsContent>

            <TabsContent value="expenses" className="p-4 sm:p-6">
              <ExpenseTracker />
          </TabsContent>

            <TabsContent value="ocr" className="p-4 sm:p-6">
              <DocumentOCR onSuccess={fetchExpenses} />
          </TabsContent>

            <TabsContent value="tax" className="p-4 sm:p-6">
            <TaxInsuranceManager />
          </TabsContent>

            <TabsContent value="reports" className="p-4 sm:p-6">
              {/* ReportsGeneratorの呼び出しを一時的に削除（型エラー回避のため） */}
          </TabsContent>

            <TabsContent value="guide" className="p-4 sm:p-6">
            <UserGuide />
          </TabsContent>
        </Tabs>
      </div>
      </div>

      {/* 物件カードクリックで詳細モーダルを開くUIを復活 */}
      <Dialog open={isPropertyDetailModalOpen} onOpenChange={(open) => {
        setIsPropertyDetailModalOpen(open);
        if (!open) {
          setSelectedProperty(null);
          setSelectedMonth(null);
        }
      }}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-screen">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              {selectedProperty?.name} 物件詳細
            </DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-8">
              {/* 月ごとの収入グラフ */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-green-500 rounded-t-xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-white" />
                      月ごとの収入グラフ
                    </CardTitle>
                    {/* 年フィルター - モダンなセレクト */}
                    <div className="flex items-center gap-3">
                      <span className="text-white/90 text-sm font-medium">年選択:</span>
                      <div className="relative">
                        <button
                          onClick={() => setIsYearSelectorOpen(!isYearSelectorOpen)}
                          className="year-selector flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-white text-sm font-medium hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                        >
                          <Calendar className="h-4 w-4" />
                          <span>{selectedYears.length === 0 ? '年を選択' : `${selectedYears.length}年選択中`}</span>
                          <svg className="h-4 w-4 transition-transform duration-200" style={{ transform: isYearSelectorOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {/* 選択された年のバッジ */}
                        {selectedYears.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedYears.map(year => (
                              <Badge
                                key={year}
                                variant="secondary"
                                className="bg-white/30 text-white border-white/50 hover:bg-white/40 transition-all duration-200 cursor-pointer group"
                                onClick={() => handleYearToggle(year)}
                              >
                                {year}
                                <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                              </Badge>
                            ))}
                            {selectedYears.length > 1 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleResetYears}
                                className="h-6 px-2 text-xs text-white/70 hover:text-white hover:bg-white/20"
                              >
                                リセット
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {/* 年選択ドロップダウン */}
                        {isYearSelectorOpen && (
                          <div className="year-selector absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
                            <div className="p-3 border-b border-gray-100">
                              <div className="text-sm font-medium text-gray-700 mb-2">比較したい年を選択</div>
                              <div className="text-xs text-gray-500">複数選択可能です</div>
                            </div>
                            <div className="p-2">
                              {availableYears.length > 0 ? (
                                availableYears.map(year => (
                                  <button
                                    key={year}
                                    onClick={() => handleYearToggle(year)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                                      selectedYears.includes(year)
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                                  >
                                    <span className="font-medium">{year}年</span>
                                    {selectedYears.includes(year) && (
                                      <Check className="h-4 w-4 text-blue-600" />
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                  データがありません
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    {filteredDetailMonthlyData.length === 0 ? (
                      <div className="flex items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>データがありません</p>
                        </div>
                      </div>
                    ) : (
                      <BarChart data={filteredDetailMonthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="yearMonth" 
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          axisLine={{ stroke: '#d1d5db' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          axisLine={{ stroke: '#d1d5db' }}
                          tickFormatter={(value) => `¥${value.toLocaleString()}`}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any) => [`¥${value.toLocaleString()}`, '月収入']}
                        />
                        <Bar dataKey="income" fill="url(#gradient)" name="月収入" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 月ごとの収入一覧 - カード形式 */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-600 to-blue-500 rounded-t-xl p-6">
                  <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-white" />
                    月ごとの収入一覧
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {months.map((m) => {
                      const monthData = selectedPropertyMonthlyData.find(d => d.yearMonth === m.replace('-', '/'));
                      const total = monthData?.income || 0;
                      return (
                        <Button
                          key={m}
                          size="sm"
                          variant={selectedMonth === m ? 'default' : 'outline'}
                          className={`h-auto p-4 flex flex-col items-center gap-2 rounded-xl transition-all duration-200 ${
                            selectedMonth === m 
                              ? 'bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-lg' 
                              : 'hover:bg-blue-50 hover:border-blue-300'
                          }`}
                          onClick={() => setSelectedMonth(selectedMonth === m ? null : m)}
                        >
                          <div className="text-lg font-bold">{m.replace('-', '/')}</div>
                          <div className={`text-sm ${selectedMonth === m ? 'text-white/90' : 'text-gray-600'}`}>
                            ¥{total.toLocaleString()}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 契約者内訳テーブル */}
              {selectedMonth && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-t-xl p-6">
                    <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                      <Users className="h-6 w-6 text-white" />
                      {selectedMonth.replace('-', '/')}の契約者内訳
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {/* 物件名・合計金額を表示 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                        <div className="text-sm text-gray-600 mb-1">合計金額</div>
                        <div className="font-bold text-green-700 text-lg">
                          ¥{contractDetails.reduce((sum, row) => sum + (row.amount || 0), 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* スクロール可能なテーブルラッパー */}
                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">部屋No.</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">契約者</th>
                              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">合計</th>
                              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {contractDetails.map((row, i) => (
                              <tr key={(row.room_no || '') + (row.tenant_name || '')} className="hover:bg-blue-50/50 transition-colors duration-150">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                      <span className="text-sm font-semibold text-blue-700">{row.room_no || '-'}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{row.room_no || '-'}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-900">{row.tenant_name || '-'}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <span className="text-sm font-bold text-green-700">¥{row.amount.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-8 w-8 p-0 rounded-full hover:bg-blue-100 hover:border-blue-300" 
                                      onClick={() => handleEditContract(expenses.find(e => e.property_id === selectedProperty?.id && e.date.slice(0, 7) === selectedMonth && e.room_no === row.room_no && e.tenant_name === row.tenant_name && e.amount === row.amount)!)}
                                    >
                                      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z" /></svg>
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-8 w-8 p-0 rounded-full hover:bg-red-100 hover:border-red-300" 
                                      onClick={() => handleDeleteContract(expenses.find(e => e.property_id === selectedProperty?.id && e.date.slice(0, 7) === selectedMonth && e.room_no === row.room_no && e.tenant_name === row.tenant_name && e.amount === row.amount)!)}
                                    >
                                      <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200">
                        <Button 
                          size="sm" 
                          onClick={handleAddContract}
                          className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          契約者追加
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 物件編集・追加モーダル */}
      <Dialog open={isPropertyModalOpen} onOpenChange={setIsPropertyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProperty ? '物件を編集' : '物件を追加'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); if (!propertyForm.name) { alert('物件名は必須です'); return; } handleSaveProperty(); }} className="space-y-4">
            <div>
              <label className="block mb-1">物件名</label>
              <input className="w-full border rounded px-2 py-1" value={propertyForm.name || ''} onChange={e => setPropertyForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsPropertyModalOpen(false)}>キャンセル</Button>
              <Button type="submit">保存</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 契約編集・追加モーダル */}
      <Dialog open={isContractModalOpen} onOpenChange={setIsContractModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl">
                {editingContract ? (
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z" />
                  </svg>
                ) : (
                  <Plus className="h-6 w-6 text-white" />
                )}
              </div>
              {editingContract ? '契約を編集' : '契約を追加'}
            </DialogTitle>
            <div className="text-gray-600 text-sm">
              {editingContract ? '契約情報を更新します' : '新しい契約者を追加します'}
            </div>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleSaveContract(); }} className="space-y-6">
            <div className="space-y-4">
              {/* 部屋番号 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <svg className="h-3 w-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  部屋番号
                </label>
                <input 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
                  value={contractForm.room_no || ''} 
                  onChange={e => setContractForm(f => ({ ...f, room_no: e.target.value }))} 
                  placeholder="例: 101"
                  required 
                />
              </div>

              {/* 契約者名 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <Users className="h-3 w-3 text-green-600" />
                  </div>
                  契約者名
                </label>
                <input 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
                  value={contractForm.tenant_name || ''} 
                  onChange={e => setContractForm(f => ({ ...f, tenant_name: e.target.value }))} 
                  placeholder="例: 田中太郎"
                  required 
                />
              </div>

              {/* 金額 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="p-1 bg-yellow-100 rounded">
                    <DollarSign className="h-3 w-3 text-yellow-600" />
                  </div>
                  月額
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">¥</span>
                  <input 
                    type="number" 
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
                    value={contractForm.amount || ''} 
                    onChange={e => setContractForm(f => ({ ...f, amount: Number(e.target.value) }))} 
                    placeholder="0"
                    required 
                  />
                </div>
              </div>

              {/* 日付 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <div className="p-1 bg-purple-100 rounded">
                    <Calendar className="h-3 w-3 text-purple-600" />
                  </div>
                  契約開始日
                </label>
                <input 
                  type="date" 
                  lang="ja" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm" 
                  value={contractForm.date || ''} 
                  onChange={e => setContractForm(f => ({ ...f, date: e.target.value }))} 
                  required 
                />
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-3 pt-4 pb-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsContractModalOpen(false)}
                className="flex-1 py-3 px-6 rounded-xl border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                キャンセル
              </Button>
              <Button 
                type="submit"
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {editingContract ? '更新' : '追加'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
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