'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Plus, Edit, Trash2, Receipt, Calendar, DollarSign, Building2, TrendingUp, TrendingDown, Filter, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface Property {
  id: number;
  name: string;
  type: string;
  address: string;
}

interface ExpenseTrackerProps {
  properties: Property[];
}

interface Expense {
  id: number;
  propertyId: number;
  propertyName: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  vendor: string;
  receiptUrl?: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
}

interface PropertyData {
  id: number;
  name: string;
  type: string;
  units: number;
  occupiedUnits: number;
  monthlyIncome: number;
  yearlyIncome: number;
  expenses: number;
  netIncome: number;
  yieldRate: number;
  location: string;
  address: string;
  buildYear: number;
  structure: string;
  totalFloors: number;
}

export function ExpenseTracker({ properties }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 1,
      propertyId: 1,
      propertyName: '高橋ホーム福井中央アパート',
      date: '2024-10-15',
      category: '修繕費',
      description: '外壁塗装工事（福井市内業者）',
      amount: 1200000,
      vendor: '福井塗装工業株式会社',
      status: 'paid',
      paymentMethod: '銀行振込'
    },
    {
      id: 2,
      propertyId: 1,
      propertyName: '高橋ホーム福井中央アパート',
      date: '2024-10-20',
      category: '清掃費',
      description: '共用部清掃（月額）',
      amount: 35000,
      vendor: '福井クリーンサービス',
      status: 'paid',
      paymentMethod: '口座振替'
    },
    {
      id: 3,
      propertyId: 2,
      propertyName: '高橋ホーム駅前パーキング',
      date: '2024-10-25',
      category: '保守点検',
      description: 'アスファルト補修工事',
      amount: 180000,
      vendor: '福井道路工事株式会社',
      status: 'pending',
      paymentMethod: '現金'
    },
    {
      id: 4,
      propertyId: 3,
      propertyName: '高橋ホーム片町商業ビル',
      date: '2024-11-01',
      category: '設備費',
      description: 'エレベーター定期点検',
      amount: 85000,
      vendor: '北陸エレベーター',
      status: 'paid',
      paymentMethod: '銀行振込'
    },
    {
      id: 5,
      propertyId: 4,
      propertyName: '高橋ホーム花堂ファミリーマンション',
      date: '2024-11-05',
      category: '光熱費',
      description: '共用部電気代（10月分）',
      amount: 28000,
      vendor: '北陸電力',
      status: 'pending',
      paymentMethod: '口座振替'
    }
  ]);

  // 手動で追加する物件データ
  const [propertyData, setPropertyData] = useState<PropertyData[]>([
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
      totalFloors: 4
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [newExpense, setNewExpense] = useState({
    propertyId: '',
    date: '',
    category: '',
    description: '',
    amount: '',
    vendor: '',
    paymentMethod: ''
  });

  const [newProperty, setNewProperty] = useState({
    name: '',
    type: '',
    units: '',
    occupiedUnits: '',
    monthlyIncome: '',
    yearlyIncome: '',
    expenses: '',
    location: '',
    address: '',
    buildYear: '',
    structure: '',
    totalFloors: ''
  });

  const categories = [
    '修繕費', '清掃費', '保守点検', '保険料', '税金', '管理費', '広告費', '光熱費', '設備費', 'その他'
  ];

  const propertyTypes = ['アパート', 'マンション', '戸建て', '駐車場', '店舗・オフィス', '学生マンション', 'その他'];
  const structures = ['RC造', 'SRC造', 'S造', '木造', 'その他'];
  const paymentMethods = ['現金', '銀行振込', '口座振替', 'クレジットカード'];

  // フィルター適用
  const filteredExpenses = expenses.filter(expense => {
    const propertyMatch = selectedProperties.length === 0 || selectedProperties.includes(expense.propertyId);
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(expense.category);
    return propertyMatch && categoryMatch;
  });

  const filteredPropertyData = propertyData.filter(property => 
    selectedProperties.length === 0 || selectedProperties.includes(property.id)
  );

  // 福井市の月別支出データ（フィルター適用）
  const getFilteredMonthlyData = () => {
    const baseData = [
      { month: '1月', 修繕費: 200000, 清掃費: 35000, 保守点検: 60000, 光熱費: 45000, その他: 40000 },
      { month: '2月', 修繕費: 120000, 清掃費: 35000, 保守点検: 30000, 光熱費: 38000, その他: 25000 },
      { month: '3月', 修繕費: 350000, 清掃費: 35000, 保守点検: 80000, 光熱費: 42000, その他: 35000 },
      { month: '4月', 修繕費: 180000, 清掃費: 35000, 保守点検: 45000, 光熱費: 35000, その他: 30000 },
      { month: '5月', 修繕費: 450000, 清掃費: 35000, 保守点検: 120000, 光熱費: 32000, その他: 50000 },
      { month: '6月', 修繕費: 150000, 清掃費: 35000, 保守点検: 55000, 光熱費: 38000, その他: 25000 },
      { month: '7月', 修繕費: 220000, 清掃費: 35000, 保守点検: 70000, 光熱費: 48000, その他: 35000 },
      { month: '8月', 修繕費: 180000, 清掃費: 35000, 保守点検: 40000, 光熱費: 52000, その他: 28000 },
      { month: '9月', 修繕費: 130000, 清掃費: 35000, 保守点検: 35000, 光熱費: 40000, その他: 22000 },
      { month: '10月', 修繕費: 1200000, 清掃費: 35000, 保守点検: 180000, 光熱費: 35000, その他: 85000 },
    ];

    if (selectedCategories.length === 0) return baseData;

    return baseData.map(month => {
      const filteredMonth: any = { month: month.month };
      selectedCategories.forEach(category => {
        if (month[category as keyof typeof month]) {
          filteredMonth[category] = month[category as keyof typeof month];
        }
      });
      return filteredMonth;
    });
  };

  // カテゴリ別支出分析（フィルター適用）
  const getCategoryAnalysis = () => {
    const baseAnalysis = [
      { category: '修繕費', amount: 3200000, percentage: 65.3, color: '#EF4444' },
      { category: '清掃費', amount: 420000, percentage: 8.6, color: '#F59E0B' },
      { category: '保守点検', amount: 715000, percentage: 14.6, color: '#3B82F6' },
      { category: '光熱費', amount: 405000, percentage: 8.3, color: '#10B981' },
      { category: 'その他', amount: 160000, percentage: 3.2, color: '#8B5CF6' }
    ];

    if (selectedCategories.length === 0) return baseAnalysis;
    return baseAnalysis.filter(item => selectedCategories.includes(item.category));
  };

  const handleAddExpense = () => {
    if (newExpense.propertyId && newExpense.date && newExpense.category && newExpense.amount) {
      const property = properties.find(p => p.id.toString() === newExpense.propertyId);
      const expense: Expense = {
        id: Date.now(),
        propertyId: parseInt(newExpense.propertyId),
        propertyName: property?.name || '',
        date: newExpense.date,
        category: newExpense.category,
        description: newExpense.description,
        amount: parseInt(newExpense.amount),
        vendor: newExpense.vendor,
        status: 'paid',
        paymentMethod: newExpense.paymentMethod
      };
      setExpenses([...expenses, expense]);
      setNewExpense({
        propertyId: '',
        date: '',
        category: '',
        description: '',
        amount: '',
        vendor: '',
        paymentMethod: ''
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleAddProperty = () => {
    if (newProperty.name && newProperty.type && newProperty.units && newProperty.monthlyIncome) {
      const property: PropertyData = {
        id: Date.now(),
        name: newProperty.name,
        type: newProperty.type,
        units: parseInt(newProperty.units),
        occupiedUnits: parseInt(newProperty.occupiedUnits) || 0,
        monthlyIncome: parseInt(newProperty.monthlyIncome),
        yearlyIncome: parseInt(newProperty.yearlyIncome) || parseInt(newProperty.monthlyIncome) * 12,
        expenses: parseInt(newProperty.expenses) || 0,
        netIncome: (parseInt(newProperty.yearlyIncome) || parseInt(newProperty.monthlyIncome) * 12) - (parseInt(newProperty.expenses) || 0),
        yieldRate: 0, // 計算で求める
        location: newProperty.location,
        address: newProperty.address,
        buildYear: parseInt(newProperty.buildYear) || new Date().getFullYear(),
        structure: newProperty.structure,
        totalFloors: parseInt(newProperty.totalFloors) || 1
      };
      
      // 利回り計算
      property.yieldRate = property.yearlyIncome > 0 ? (property.netIncome / property.yearlyIncome) * 100 : 0;
      
      setPropertyData([...propertyData, property]);
      setNewProperty({
        name: '',
        type: '',
        units: '',
        occupiedUnits: '',
        monthlyIncome: '',
        yearlyIncome: '',
        expenses: '',
        location: '',
        address: '',
        buildYear: '',
        structure: '',
        totalFloors: ''
      });
      setIsAddPropertyDialogOpen(false);
    }
  };

  const handlePropertyFilter = (propertyId: number) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedProperties([]);
    setSelectedCategories([]);
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyAverage = totalExpenses / 10;
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'pending');
  const paidExpenses = filteredExpenses.filter(e => e.status === 'paid');

  return (
    <div className="space-y-6">
      {/* フィルターセクション */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Filter className="h-5 w-5" />
            <span>フィルター機能</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            特定の物件やカテゴリのデータだけを表示できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium mb-3 block">物件で絞り込み</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {properties.map((property) => (
                  <div key={property.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`property-filter-${property.id}`}
                      checked={selectedProperties.includes(property.id)}
                      onCheckedChange={() => handlePropertyFilter(property.id)}
                    />
                    <Label htmlFor={`property-filter-${property.id}`} className="text-sm">
                      {property.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium mb-3 block">カテゴリで絞り込み</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-filter-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryFilter(category)}
                    />
                    <Label htmlFor={`category-filter-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex flex-wrap gap-2">
              {selectedProperties.map(propertyId => {
                const property = properties.find(p => p.id === propertyId);
                return property ? (
                  <Badge key={propertyId} variant="outline" className="bg-blue-50 text-blue-700">
                    {property.name}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => handlePropertyFilter(propertyId)}
                    />
                  </Badge>
                ) : null;
              })}
              {selectedCategories.map(category => (
                <Badge key={category} variant="outline" className="bg-purple-50 text-purple-700">
                  {category}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleCategoryFilter(category)}
                  />
                </Badge>
              ))}
            </div>
            {(selectedProperties.length > 0 || selectedCategories.length > 0) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                フィルターをクリア
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総支出額</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedProperties.length > 0 || selectedCategories.length > 0 ? 'フィルター適用済み' : '今年度累計'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">月平均支出</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{Math.round(monthlyAverage).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">10ヶ月平均</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">支払済み</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidExpenses.length}</div>
            <p className="text-xs text-muted-foreground">項目</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未払い</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{pendingExpenses.length}</div>
            <p className="text-xs text-muted-foreground">¥{pendingExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expense Chart */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>月別支出推移</CardTitle>
                <CardDescription>
                  {selectedCategories.length > 0 ? `選択カテゴリ: ${selectedCategories.join(', ')}` : 'カテゴリ別の支出状況'}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      支出を追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>新しい支出を登録</DialogTitle>
                      <DialogDescription>
                        支出の詳細情報を入力してください。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="property" className="text-right">物件</Label>
                        <Select value={newExpense.propertyId} onValueChange={(value) => setNewExpense({...newExpense, propertyId: value})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="物件を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id.toString()}>
                                {property.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">日付</Label>
                        <Input
                          id="date"
                          type="date"
                          className="col-span-3"
                          value={newExpense.date}
                          onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">カテゴリ</Label>
                        <Select value={newExpense.category} onValueChange={(value) => setNewExpense({...newExpense, category: value})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="カテゴリを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">金額</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="金額を入力"
                          className="col-span-3"
                          value={newExpense.amount}
                          onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="vendor" className="text-right">業者</Label>
                        <Input
                          id="vendor"
                          placeholder="業者名"
                          className="col-span-3"
                          value={newExpense.vendor}
                          onChange={(e) => setNewExpense({...newExpense, vendor: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="paymentMethod" className="text-right">支払方法</Label>
                        <Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense({...newExpense, paymentMethod: value})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="支払方法を選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">詳細</Label>
                        <Textarea
                          id="description"
                          placeholder="支出の詳細"
                          className="col-span-3"
                          value={newExpense.description}
                          onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={handleAddExpense}>
                        追加
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isAddPropertyDialogOpen} onOpenChange={setIsAddPropertyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Building2 className="h-4 w-4 mr-2" />
                      物件を追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>新しい物件を登録</DialogTitle>
                      <DialogDescription>
                        物件の詳細情報を入力してください。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="propertyName" className="text-right">物件名</Label>
                        <Input
                          id="propertyName"
                          placeholder="高橋ホーム○○"
                          className="col-span-3"
                          value={newProperty.name}
                          onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="propertyType" className="text-right">物件タイプ</Label>
                        <Select value={newProperty.type} onValueChange={(value) => setNewProperty({...newProperty, type: value})}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="物件タイプを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {propertyTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="units" className="text-right">総戸数</Label>
                          <Input
                            id="units"
                            type="number"
                            placeholder="戸数"
                            className="col-span-3"
                            value={newProperty.units}
                            onChange={(e) => setNewProperty({...newProperty, units: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="occupiedUnits" className="text-right">入居戸数</Label>
                          <Input
                            id="occupiedUnits"
                            type="number"
                            placeholder="入居戸数"
                            className="col-span-3"
                            value={newProperty.occupiedUnits}
                            onChange={(e) => setNewProperty({...newProperty, occupiedUnits: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="monthlyIncome" className="text-right">月収入</Label>
                          <Input
                            id="monthlyIncome"
                            type="number"
                            placeholder="月収入"
                            className="col-span-3"
                            value={newProperty.monthlyIncome}
                            onChange={(e) => setNewProperty({...newProperty, monthlyIncome: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="yearlyIncome" className="text-right">年収入</Label>
                          <Input
                            id="yearlyIncome"
                            type="number"
                            placeholder="年収入（自動計算）"
                            className="col-span-3"
                            value={newProperty.yearlyIncome || (parseInt(newProperty.monthlyIncome) * 12 || '')}
                            onChange={(e) => setNewProperty({...newProperty, yearlyIncome: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="expenses" className="text-right">年間経費</Label>
                        <Input
                          id="expenses"
                          type="number"
                          placeholder="年間経費"
                          className="col-span-3"
                          value={newProperty.expenses}
                          onChange={(e) => setNewProperty({...newProperty, expenses: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">所在地</Label>
                        <Input
                          id="location"
                          placeholder="福井市○○"
                          className="col-span-3"
                          value={newProperty.location}
                          onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">住所</Label>
                        <Input
                          id="address"
                          placeholder="福井県福井市○○"
                          className="col-span-3"
                          value={newProperty.address}
                          onChange={(e) => setNewProperty({...newProperty, address: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="buildYear" className="text-right">築年</Label>
                          <Input
                            id="buildYear"
                            type="number"
                            placeholder="2020"
                            className="col-span-3"
                            value={newProperty.buildYear}
                            onChange={(e) => setNewProperty({...newProperty, buildYear: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="structure" className="text-right">構造</Label>
                          <Select value={newProperty.structure} onValueChange={(value) => setNewProperty({...newProperty, structure: value})}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="構造" />
                            </SelectTrigger>
                            <SelectContent>
                              {structures.map((structure) => (
                                <SelectItem key={structure} value={structure}>
                                  {structure}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="totalFloors" className="text-right">階数</Label>
                          <Input
                            id="totalFloors"
                            type="number"
                            placeholder="3"
                            className="col-span-3"
                            value={newProperty.totalFloors}
                            onChange={(e) => setNewProperty({...newProperty, totalFloors: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsAddPropertyDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button onClick={handleAddProperty}>
                        追加
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={getFilteredMonthlyData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`¥${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="修繕費" stackId="a" fill="#EF4444" />
                <Bar dataKey="清掃費" stackId="a" fill="#F59E0B" />
                <Bar dataKey="保守点検" stackId="a" fill="#3B82F6" />
                <Bar dataKey="光熱費" stackId="a" fill="#10B981" />
                <Bar dataKey="その他" stackId="a" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>カテゴリ別支出分析</CardTitle>
            <CardDescription>
              {selectedCategories.length > 0 ? '選択されたカテゴリの構成比' : '年間支出の構成比'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={getCategoryAnalysis()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} ${percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {getCategoryAnalysis().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 手動追加した物件データのグラフ */}
      {filteredPropertyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>追加物件の収支グラフ</CardTitle>
            <CardDescription>手動で追加された物件の収支状況</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredPropertyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                <Bar dataKey="yearlyIncome" fill="#3B82F6" name="年間収入" />
                <Bar dataKey="expenses" fill="#EF4444" name="年間経費" />
                <Bar dataKey="netIncome" fill="#10B981" name="純利益" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>支出一覧</CardTitle>
          <CardDescription>
            {selectedProperties.length > 0 || selectedCategories.length > 0 
              ? 'フィルター適用済みの支出履歴' 
              : '最近の支出履歴'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="outline">{expense.category}</Badge>
                    <Badge variant="secondary">{expense.propertyName}</Badge>
                    <Badge 
                      variant={expense.status === 'paid' ? 'default' : expense.status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {expense.status === 'paid' ? '支払済' : expense.status === 'pending' ? '未払い' : '期限切れ'}
                    </Badge>
                    {expense.paymentMethod && (
                      <Badge variant="outline" className="text-xs">
                        {expense.paymentMethod}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-semibold">{expense.description}</h4>
                  <p className="text-sm text-gray-600">
                    {expense.vendor} • {expense.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">¥{expense.amount.toLocaleString()}</p>
                  <div className="flex space-x-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}