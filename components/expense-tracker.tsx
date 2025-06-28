'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, Plus, Edit, Trash2, Receipt, Calendar, DollarSign, Building2, TrendingUp, TrendingDown, Filter, X, Loader2, List, Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, TooltipProps, Legend } from 'recharts';
import { supabase } from '@/lib/supabase';
import { ChartErrorBoundary } from '@/components/chart-error-boundary';
import { 
  sanitizeArrayNumbers, 
  filterValidChartData, 
  createDefaultChartData, 
  getSafeDomain,
  isValidChartData 
} from '@/lib/chart-utils';
import { useProperties } from '@/contexts/PropertyContext';

// カスタムTooltipコンポーネント
const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const totalAmount = payload.reduce((sum, entry) => {
      const safeValue = isNaN(entry.value) || !isFinite(entry.value) ? 0 : entry.value;
      return sum + (safeValue || 0);
    }, 0);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <p className="font-semibold text-gray-900 mb-2">{label}の支出</p>
        <div className="space-y-1">
          {payload.map((entry, index) => {
            const safeValue = isNaN(entry.value) || !isFinite(entry.value) ? 0 : entry.value;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ¥{safeValue.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-200 mt-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">合計</span>
            <span className="text-sm font-bold text-blue-600">
              ¥{totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

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
  property_id: number;
  property_name: string;
  date: string;
  category: string;
  amount: number;
  room_no?: string;
  tenant_name?: string;
  created_at: string;
}

interface PropertyData {
  id: number;
  name: string;
  type: string;
  units: number;
  occupied_units: number;
  monthly_income: number;
  yearly_income: number;
  expenses: number;
  net_income: number;
  yield_rate: number;
  location: string;
  address: string;
  build_year: number;
  structure: string;
  total_floors: number;
}

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { properties, fetchProperties } = useProperties();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ propertyId: number; yearMonth: string } | null>(null);

  // 追加: 必要なstateの初期化
  const [newExpense, setNewExpense] = useState({
    propertyName: '',
    date: '',
    category: '',
    amount: '',
    roomNo: '',
    tenantName: '',
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
    totalFloors: '',
    date: '',
    roomNo: '',
    tenantName: '',
    amount: '',
    category: '家賃',
  });
  const [isAddPropertyDialogOpen, setIsAddPropertyDialogOpen] = useState(false);
  const [selectedProperties, setSelectedProperties] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [newTenant, setNewTenant] = useState({
    roomNo: '',
    tenantName: '',
    amount: '',
    date: '',
  });

  // データフェッチ
  useEffect(() => {
    fetchData();
  }, [properties]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 支出データを取得
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          *,
          properties(name)
        `)
        .order('date', { ascending: false });

      if (expensesError) {
        console.error('Expenses fetch error:', expensesError);
        setError('支出データの取得に失敗しました');
        return;
      }

      const formattedExpenses = expensesData?.map(expense => ({
        ...expense,
        property_name: expense.property_name || expense.properties?.name || '不明'
      })) || [];

      setExpenses(formattedExpenses);

    } catch (error) {
      console.error('Data fetch error:', error);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 物件・年月ごとにグループ化（家賃のみ）
  const propertyMonthGroups = (() => {
    const map = new Map<string, { propertyId: number; propertyName: string; yearMonth: string; total: number }>();
    const rentExpenses = expenses.filter(exp => exp.category === '家賃');
    
    // フィルター適用
    const filteredRentExpenses = rentExpenses.filter(expense => {
      const propertyMatch = selectedProperties.length === 0 || selectedProperties.includes(expense.property_id);
      return propertyMatch;
    });
    
    filteredRentExpenses.forEach(exp => {
      const yearMonth = exp.date.slice(0, 7); // YYYY-MM
      const key = `${exp.property_id}_${yearMonth}`;
      if (!map.has(key)) {
        map.set(key, {
          propertyId: exp.property_id,
          propertyName: exp.property_name,
          yearMonth,
          total: 0,
        });
      }
      map.get(key)!.total += exp.amount || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  })();

  // 年間比較グラフ用データ（物件ごと・年ごと・月ごと）
  const yearlyComparisonData = (() => {
    // { [year]: { [propertyName]: [12ヶ月分の合計] } }
    const yearMap: Record<string, Record<string, number[]>> = {};
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const property = exp.property_name;
      if (!yearMap[year]) yearMap[year] = {};
      if (!yearMap[year][property]) yearMap[year][property] = Array(12).fill(0);
      yearMap[year][property][month] += exp.amount || 0;
    });
    // グラフ用配列 [{ year, month, property1: 金額, property2: 金額, ... }]
    const result: any[] = [];
    Object.entries(yearMap).forEach(([year, propObj]) => {
      for (let m = 0; m < 12; m++) {
        const row: any = { year, month: `${m + 1}月` };
        Object.entries(propObj).forEach(([property, arr]) => {
          row[property] = arr[m];
        });
        result.push(row);
      }
    });
    return result;
  })();

  // 家賃のみフィルタ
  const rentExpenses = expenses.filter(exp => exp.category === '家賃');

  // フィルター適用
  const filteredExpenses = rentExpenses.filter(expense => {
    const propertyMatch = selectedProperties.length === 0 || selectedProperties.includes(expense.property_id);
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(expense.category);
    return propertyMatch && categoryMatch;
  });

  const filteredPropertyData = properties.filter(property => 
    selectedProperties.length === 0 || selectedProperties.includes(property.id)
  );

  // 月別支出データ（実際のデータから生成）
  const getFilteredMonthlyData = () => {
    const monthlyData: { [key: string]: any } = {};
    
    filteredExpenses.forEach(expense => {
      const month = new Date(expense.date).getMonth() + 1;
      const monthKey = `${month}月`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey };
      }
      
      if (!monthlyData[monthKey][expense.category]) {
        monthlyData[monthKey][expense.category] = 0;
      }
      
      monthlyData[monthKey][expense.category] += expense.amount || 0;
    });

    // 各月のデータにNaNチェックを追加
    const validatedData = Object.values(monthlyData).map(monthData => {
      const validatedMonth: { [key: string]: any } = { month: monthData.month };
      
      Object.keys(monthData).forEach(key => {
        if (key !== 'month') {
          const value = monthData[key];
          validatedMonth[key] = isNaN(value) || !isFinite(value) ? 0 : value;
        }
      });
      
      return validatedMonth;
    });

    // データをサニタイズして返す
    return sanitizeArrayNumbers(validatedData);
  };

  // カテゴリ別分析（実際のデータから生成）
  const getCategoryAnalysis = () => {
    const categoryTotals: { [key: string]: number } = {};
    const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];
    
    filteredExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount || 0;
    });

    const total = Object.values(categoryTotals).reduce((sum, value) => sum + (value || 0), 0);

    const analysis = Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value: value || 0,
      percentage: total > 0 ? Number(((value || 0) / total * 100).toFixed(1)) : 0,
      color: colors[index % colors.length]
    }));

    // データをサニタイズして返す
    return sanitizeArrayNumbers(analysis);
  };

  const handleAddExpense = async () => {
    if (newExpense.propertyName && newExpense.date && newExpense.category && newExpense.amount && newExpense.roomNo && newExpense.tenantName) {
      try {
        const property = properties.find(p => p.name === newExpense.propertyName);
        const expenseData = {
          property_id: property?.id || null,
          property_name: newExpense.propertyName,
          date: newExpense.date ? (newExpense.date.length === 7 ? newExpense.date + '-01' : newExpense.date) : '', // YYYY-MM → YYYY-MM-01
          category: newExpense.category || '家賃',
          amount: parseInt(newExpense.amount),
          room_no: newExpense.roomNo,
          tenant_name: newExpense.tenantName,
        };
        const { data, error } = await supabase
          .from('expenses')
          .insert([expenseData])
          .select();
        if (error) {
          alert('支出の追加に失敗しました。');
          return;
        }
        if (data && data[0]) {
          setExpenses(prev => [data[0], ...prev]);
        }
        setNewExpense({
          propertyName: '',
          date: '',
          category: '',
          amount: '',
          roomNo: '',
          tenantName: '',
        });
        setIsAddDialogOpen(false);
      } catch (error) {
        alert('支出の追加に失敗しました。');
      }
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      propertyName: expense.property_name,
      date: expense.date,
      category: expense.category,
      amount: expense.amount.toString(),
      roomNo: expense.room_no || '',
      tenantName: expense.tenant_name || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateExpense = async () => {
    if (editingExpense && newExpense.propertyName && newExpense.date && newExpense.category && newExpense.amount) {
      try {
        const property = properties.find(p => p.name === newExpense.propertyName);
        
        // Supabaseに更新するデータ
        const updateData = {
          property_id: property?.id || null,
          property_name: newExpense.propertyName,
          date: newExpense.date,
          category: newExpense.category,
          amount: parseInt(newExpense.amount),
          room_no: newExpense.roomNo,
          tenant_name: newExpense.tenantName,
        };

        // Supabaseでデータを更新
        const { data, error } = await supabase
          .from('expenses')
          .update(updateData)
          .eq('id', editingExpense.id)
          .select();

        if (error) {
          console.error('Expense update error:', error);
          alert('支出の更新に失敗しました。');
          return;
        }

        // 成功メッセージ
        alert('支出を更新しました。');
        
        // フロントエンドの状態を即座に更新
        if (data && data[0]) {
          const updatedExpenseItem = {
            ...data[0],
            property_name: newExpense.propertyName,
            room_no: newExpense.roomNo,
            tenant_name: newExpense.tenantName,
          };
          setExpenses(prev => prev.map(exp => 
            exp.id === editingExpense.id ? updatedExpenseItem : exp
          ));
        }
        
        // フォームをリセット
        setNewExpense({
          propertyName: '',
          date: '',
          category: '',
          amount: '',
          roomNo: '',
          tenantName: '',
        });
        setEditingExpense(null);
        setIsEditDialogOpen(false);
      } catch (error) {
        console.error('Update expense error:', error);
        alert('支出の更新に失敗しました。');
      }
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    const expenseToDelete = expenses.find(exp => exp.id === expenseId);
    if (expenseToDelete) {
      try {
        // Supabaseからデータを削除
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', expenseId);

        if (error) {
          console.error('Expense delete error:', error);
          alert('支出の削除に失敗しました。');
          return;
        }

        // 成功メッセージを表示
        alert(`支出（¥${expenseToDelete.amount.toLocaleString()}）を削除しました。`);
        
        // フロントエンドの状態を即座に更新
        setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
      } catch (error) {
        console.error('Delete expense error:', error);
        alert('支出の削除に失敗しました。');
      }
    }
  };

  const handleDownloadExpense = (expense: Expense) => {
    // CSV形式でダウンロード
    const csvContent = `物件名,日付,カテゴリ,金額\n${expense.property_name},${expense.date},${expense.category},${expense.amount}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `支出_${expense.property_name}_${expense.date}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddProperty = async () => {
    if (newProperty.name && newProperty.roomNo && newProperty.tenantName && newProperty.amount && newProperty.date) {
      const amountValue = parseInt(newProperty.amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        alert('金額を正しく入力してください');
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(newProperty.date)) {
        alert('日付を正しい形式で入力してください（例: 2024-07-15）');
        return;
      }
      try {
        // 1. 物件名が未登録ならpropertiesにinsert
        let propertyId: number | null = null;
        let property = properties.find(p => p.name === newProperty.name);
        if (!property) {
          const { data: propData, error: propError } = await supabase
          .from('properties')
            .insert([{ name: newProperty.name, type: 'apartment', location: '未設定', address: '未設定' }])
            .select('*');
          if (propError || !propData || !propData[0]) {
          alert('物件の追加に失敗しました。');
          return;
        }
          propertyId = propData[0].id;
          await fetchProperties(); // 物件リストを更新
        } else {
          propertyId = property.id;
        }
        // 2. 支出（家賃）をexpensesにinsert
        const expenseData = {
          property_id: propertyId,
          property_name: newProperty.name,
          date: newProperty.date, // YYYY-MM-DD形式をそのまま使用
          category: newProperty.category || '家賃',
          amount: amountValue,
          room_no: newProperty.roomNo,
          tenant_name: newProperty.tenantName,
        };
        const { data: expData, error: expError } = await supabase
          .from('expenses')
          .insert([expenseData])
          .select();
        if (expError) {
          alert('支出の追加に失敗しました。');
          return;
        }
        if (expData && expData[0]) {
          setExpenses(prev => [expData[0], ...prev]);
        }
        // フォームをリセット
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
          totalFloors: '',
          date: '',
          roomNo: '',
          tenantName: '',
          amount: '',
          category: '家賃',
        });
        setIsAddPropertyDialogOpen(false);
      } catch (error) {
        alert('追加に失敗しました。');
      }
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
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyAverage = totalExpenses / 10;
  const totalExpenseCount = filteredExpenses.length;

  // 選択中の物件・月の契約者ごと集計
  const selectedDetails = (() => {
    if (!selected) return [];
    return rentExpenses
      .filter(exp => exp.property_id === selected.propertyId && exp.date.slice(0, 7) === selected.yearMonth)
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

  // 契約者関連の関数
  const handleAddTenant = async () => {
    if (!selected || !newTenant.roomNo || !newTenant.tenantName || !newTenant.amount || !newTenant.date) {
      alert('全ての項目を入力してください。');
      return;
    }

    try {
      const property = properties.find(p => p.id === selected.propertyId);
      const expenseData = {
        property_id: selected.propertyId,
        property_name: property?.name || '',
        date: newTenant.date,
        category: '家賃',
        amount: parseInt(newTenant.amount),
        room_no: newTenant.roomNo,
        tenant_name: newTenant.tenantName,
      };

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select();

      if (error) {
        alert('契約者の追加に失敗しました。');
        return;
      }

      if (data && data[0]) {
        setExpenses(prev => [data[0], ...prev]);
      }

      setNewTenant({
        roomNo: '',
        tenantName: '',
        amount: '',
        date: selected.yearMonth + '-15',
      });
      setIsTenantModalOpen(false);
      alert('契約者を追加しました。');
    } catch (error) {
      alert('契約者の追加に失敗しました。');
    }
  };

  const handleEditTenant = (tenant: any) => {
    setEditingTenant(tenant);
    setNewTenant({
      roomNo: tenant.room_no,
      tenantName: tenant.tenant_name,
      amount: tenant.total.toString(),
      date: selected?.yearMonth + '-15',
    });
    setIsTenantModalOpen(true);
  };

  const handleUpdateTenant = async () => {
    if (!editingTenant || !newTenant.roomNo || !newTenant.tenantName || !newTenant.amount) {
      alert('全ての項目を入力してください。');
      return;
    }

    try {
      // 該当する契約者の支出レコードを更新
      const { error } = await supabase
        .from('expenses')
        .update({
          room_no: newTenant.roomNo,
          tenant_name: newTenant.tenantName,
          amount: parseInt(newTenant.amount),
        })
        .eq('property_id', selected?.propertyId)
        .eq('room_no', editingTenant.room_no)
        .eq('tenant_name', editingTenant.tenant_name)
        .eq('category', '家賃');

      if (error) {
        alert('契約者の更新に失敗しました。');
        return;
      }

      // フロントエンドの状態を更新
      setExpenses(prev => prev.map(exp => {
        if (exp.property_id === selected?.propertyId && 
            exp.room_no === editingTenant.room_no && 
            exp.tenant_name === editingTenant.tenant_name &&
            exp.category === '家賃') {
          return {
            ...exp,
            room_no: newTenant.roomNo,
            tenant_name: newTenant.tenantName,
            amount: parseInt(newTenant.amount),
          };
        }
        return exp;
      }));

      setNewTenant({
        roomNo: '',
        tenantName: '',
        amount: '',
        date: selected?.yearMonth + '-15',
      });
      setEditingTenant(null);
      setIsTenantModalOpen(false);
      alert('契約者を更新しました。');
    } catch (error) {
      alert('契約者の更新に失敗しました。');
    }
  };

  const handleDeleteTenant = async (tenant: any) => {
    if (!confirm(`契約者「${tenant.tenant_name}」を削除しますか？`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('property_id', selected?.propertyId)
        .eq('room_no', tenant.room_no)
        .eq('tenant_name', tenant.tenant_name)
        .eq('category', '家賃');

      if (error) {
        alert('契約者の削除に失敗しました。');
        return;
      }

      // フロントエンドの状態を更新
      setExpenses(prev => prev.filter(exp => 
        !(exp.property_id === selected?.propertyId && 
          exp.room_no === tenant.room_no && 
          exp.tenant_name === tenant.tenant_name &&
          exp.category === '家賃')
      ));

      alert('契約者を削除しました。');
    } catch (error) {
      alert('契約者の削除に失敗しました。');
    }
  };

  return (
    <div className="space-y-8">
      {/* 収入追加ダイアログ（物件追加と統合） */}
      <Dialog open={isAddPropertyDialogOpen} onOpenChange={setIsAddPropertyDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              収入を追加
            </DialogTitle>
                    <DialogDescription>
              新しい収入を登録します。物件が未登録の場合は同時に登録されます。
                    </DialogDescription>
                  </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="property-name">物件名</Label>
                        <Input
                id="property-name" 
                value={newProperty.name} 
                onChange={e => setNewProperty({ ...newProperty, name: e.target.value })} 
                placeholder="例: タカハシマンション101"
              />
                      </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="property-room">部屋No.</Label>
                      <Input
                id="property-room" 
                value={newProperty.roomNo} 
                onChange={e => setNewProperty({ ...newProperty, roomNo: e.target.value })} 
                placeholder="例: 101"
                      />
                    </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="property-tenant">契約者名</Label>
                      <Input
                id="property-tenant" 
                value={newProperty.tenantName} 
                onChange={e => setNewProperty({ ...newProperty, tenantName: e.target.value })} 
                placeholder="例: 田中太郎"
                      />
                    </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="property-amount">収入金額</Label>
                      <Input
                id="property-amount" 
                type="number" 
                value={newProperty.amount} 
                onChange={e => setNewProperty({ ...newProperty, amount: e.target.value })} 
                placeholder="例: 80000"
                      />
                    </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="property-category">収入カテゴリ</Label>
              <Select value={newProperty.category || '家賃'} onValueChange={value => setNewProperty({ ...newProperty, category: value })}>
                <SelectTrigger id="property-category">
                  <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                  <SelectItem value="家賃">家賃</SelectItem>
                  <SelectItem value="共益費">共益費</SelectItem>
                  <SelectItem value="駐車場">駐車場</SelectItem>
                  <SelectItem value="更新料">更新料</SelectItem>
                  <SelectItem value="敷金">敷金</SelectItem>
                  <SelectItem value="礼金">礼金</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="property-date">収入日</Label>
              <Input 
                id="property-date" 
                type="date" 
                value={newProperty.date} 
                onChange={e => setNewProperty({ ...newProperty, date: e.target.value })} 
                lang="ja"
                      />
                    </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddPropertyDialogOpen(false)}>キャンセル</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow" onClick={handleAddProperty}>追加</Button>
                  </div>
                  </div>
                </DialogContent>
              </Dialog>

      {/* 支出追加ダイアログ */}
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              支出を追加
            </DialogTitle>
                        <DialogDescription>
              新しい支出を登録します
                        </DialogDescription>
                      </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-property">物件名</Label>
              <Select value={newExpense.propertyName} onValueChange={value => setNewExpense({ ...newExpense, propertyName: value })}>
                <SelectTrigger id="expense-property">
                  <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.name}>{property.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-room">部屋No.</Label>
              <Input id="expense-room" value={newExpense.roomNo || ''} onChange={e => setNewExpense({ ...newExpense, roomNo: e.target.value })} />
                        </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-tenant">契約者名</Label>
              <Input id="expense-tenant" value={newExpense.tenantName || ''} onChange={e => setNewExpense({ ...newExpense, tenantName: e.target.value })} />
                        </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-amount">金額</Label>
              <Input id="expense-amount" type="number" value={newExpense.amount || ''} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-date">日付</Label>
              <Input id="expense-date" type="date" lang="ja" value={newExpense.date || ''} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expense-category">費用項目</Label>
              <Select value={newExpense.category} onValueChange={value => setNewExpense({ ...newExpense, category: value })}>
                <SelectTrigger id="expense-category">
                  <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                  <SelectItem value="家賃">家賃</SelectItem>
                  <SelectItem value="共益費">共益費</SelectItem>
                  <SelectItem value="駐車場">駐車場</SelectItem>
                  <SelectItem value="更新料">更新料</SelectItem>
                  <SelectItem value="敷金">敷金</SelectItem>
                  <SelectItem value="礼金">礼金</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>キャンセル</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow" onClick={handleAddExpense}>追加</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

      {/* 支出編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              支出を編集
            </DialogTitle>
                        <DialogDescription>
              支出情報を編集します
                        </DialogDescription>
                      </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-expense-property">物件名</Label>
              <Select value={newExpense.propertyName} onValueChange={value => setNewExpense({ ...newExpense, propertyName: value })}>
                <SelectTrigger id="edit-expense-property">
                  <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.name}>{property.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-expense-room">部屋No.</Label>
              <Input id="edit-expense-room" value={newExpense.roomNo || ''} onChange={e => setNewExpense({ ...newExpense, roomNo: e.target.value })} />
                          </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-expense-tenant">契約者名</Label>
              <Input id="edit-expense-tenant" value={newExpense.tenantName || ''} onChange={e => setNewExpense({ ...newExpense, tenantName: e.target.value })} />
                          </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-expense-amount">金額</Label>
              <Input id="edit-expense-amount" type="number" value={newExpense.amount || ''} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
                        </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-expense-date">日付</Label>
              <Input id="edit-expense-date" type="date" lang="ja" value={newExpense.date || ''} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
                          </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-expense-category">費用項目</Label>
              <Select value={newExpense.category} onValueChange={value => setNewExpense({ ...newExpense, category: value })}>
                <SelectTrigger id="edit-expense-category">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="家賃">家賃</SelectItem>
                  <SelectItem value="共益費">共益費</SelectItem>
                  <SelectItem value="駐車場">駐車場</SelectItem>
                  <SelectItem value="更新料">更新料</SelectItem>
                  <SelectItem value="敷金">敷金</SelectItem>
                  <SelectItem value="礼金">礼金</SelectItem>
                  <SelectItem value="その他">その他</SelectItem>
                </SelectContent>
              </Select>
                          </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>キャンセル</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow" onClick={handleUpdateExpense}>更新</Button>
                        </div>
                        </div>
        </DialogContent>
      </Dialog>

      {/* 契約者内訳モーダル */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <Building2 className="h-5 w-5 text-green-600" />
              {(() => {
                const prop = properties.find(p => p.id === selected?.propertyId);
                return `${prop?.name || ''} - ${selected?.yearMonth} の契約者内訳`;
              })()}
            </DialogTitle>
            <DialogDescription>
              契約者ごとの詳細な収入内訳
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <div className="text-sm text-gray-600">
              契約者数: {selected && Object.values(selectedDetails).length}名
            </div>
            <Button 
              onClick={() => {
                setNewTenant({
                  roomNo: '',
                  tenantName: '',
                  amount: '',
                  date: selected?.yearMonth + '-15',
                });
                setEditingTenant(null);
                setIsTenantModalOpen(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              契約者追加
            </Button>
          </div>

          {/* 縦に伸びるカード形式の契約者リスト */}
          <div className="space-y-3">
            {selected && Object.values(selectedDetails).map((row, i) => (
              <div key={row.room_no + row.tenant_name} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">部屋No.</div>
                    <div className="font-semibold text-gray-900">{row.room_no}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">契約者</div>
                    <div className="font-semibold text-gray-900">{row.tenant_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">合計</div>
                    <div className="font-bold text-green-600">{row.total !== null ? `¥${row.total.toLocaleString()}` : '-'}</div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditTenant(row)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTenant(row)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 契約者追加・編集モーダル */}
      <Dialog open={isTenantModalOpen} onOpenChange={setIsTenantModalOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingTenant ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingTenant ? '契約者を編集' : '契約者を追加'}
            </DialogTitle>
            <DialogDescription>
              {editingTenant ? '契約者情報を編集します' : '新しい契約者を追加します'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tenant-room">部屋No.</Label>
                          <Input
                id="tenant-room" 
                value={newTenant.roomNo} 
                onChange={e => setNewTenant({ ...newTenant, roomNo: e.target.value })} 
                placeholder="例: 101"
                          />
                        </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tenant-name">契約者名</Label>
                          <Input
                id="tenant-name" 
                value={newTenant.tenantName} 
                onChange={e => setNewTenant({ ...newTenant, tenantName: e.target.value })} 
                placeholder="例: 田中太郎"
                          />
                        </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tenant-amount">家賃金額</Label>
                            <Input
                id="tenant-amount" 
                              type="number"
                value={newTenant.amount} 
                onChange={e => setNewTenant({ ...newTenant, amount: e.target.value })} 
                placeholder="例: 80000"
                            />
                          </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tenant-date">収入日</Label>
                            <Input
                id="tenant-date" 
                type="date" 
                value={newTenant.date} 
                onChange={e => setNewTenant({ ...newTenant, date: e.target.value })} 
                lang="ja"
                            />
                          </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => {
                setIsTenantModalOpen(false);
                setEditingTenant(null);
                setNewTenant({
                  roomNo: '',
                  tenantName: '',
                  amount: '',
                  date: '',
                });
              }}>
                          キャンセル
                        </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow" 
                onClick={editingTenant ? handleUpdateTenant : handleAddTenant}
              >
                {editingTenant ? '更新' : '追加'}
                        </Button>
            </div>
                      </div>
                    </DialogContent>
                  </Dialog>

      {/* CRMライクな収入管理ダッシュボード */}
      <div className="space-y-6">
        {/* ヘッダーセクション */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">物件収入管理</h1>
              <p className="text-blue-100 text-base sm:text-lg">物件別の収入を一元管理</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-center sm:text-right">
                <div className="text-xl sm:text-2xl font-bold">{propertyMonthGroups.length}</div>
                <div className="text-blue-100 text-sm">収入レコード</div>
              </div>
              <Button 
                onClick={() => setIsAddPropertyDialogOpen(true)}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">新規物件追加</span>
                <span className="sm:hidden">物件追加</span>
              </Button>
            </div>
          </div>
        </div>

        {/* フィルターセクション */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">フィルター</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700 sm:ml-auto w-fit"
            >
              <X className="h-4 w-4 mr-2" />
              フィルタークリア
            </Button>
          </div>
          
          {/* 物件フィルター */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">物件で絞り込み</Label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {properties.map(property => (
                <Badge
                  key={property.id}
                  variant={selectedProperties.includes(property.id) ? "default" : "outline"}
                  className={`cursor-pointer transition-all px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
                    selectedProperties.includes(property.id)
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-blue-300'
                  }`}
                  onClick={() => handlePropertyFilter(property.id)}
                >
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="truncate max-w-20 sm:max-w-none">{property.name}</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 収入一覧 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
              <Receipt className="h-6 w-6 text-blue-600" />
              収入一覧
              <Badge variant="secondary" className="ml-2">
                {propertyMonthGroups.length}件
              </Badge>
            </h2>
                                </div>
          
          <div className="p-6">
            {propertyMonthGroups.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Receipt className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">収入データがありません</h3>
                <p className="text-gray-500 mb-6">新しい収入を追加して管理を始めましょう</p>
                <Button 
                  onClick={() => setIsAddPropertyDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  最初の収入を追加
                </Button>
                  </div>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {propertyMonthGroups.map((row, index) => (
                  <div 
                    key={row.propertyId + row.yearMonth}
                    className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{row.propertyName}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {row.yearMonth}
                            </span>
                            <Badge variant="outline" className="text-xs w-fit">
                              収入データ
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                          ¥{row.total.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">月の収入</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <Receipt className="h-4 w-4" />
                          収入管理
                        </span>
                        <span className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          家賃収入
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelected({ propertyId: row.propertyId, yearMonth: row.yearMonth })}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 font-medium text-xs sm:text-sm"
                        >
                          <List className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">契約者詳細</span>
                          <span className="sm:hidden">詳細</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const expense = expenses.find(exp => 
                              exp.property_id === row.propertyId && 
                              exp.category === '家賃' &&
                              exp.date.slice(0, 7) === row.yearMonth
                            );
                            if (expense) handleEditExpense(expense);
                          }}
                          className="border-green-200 text-green-700 hover:bg-green-50 font-medium text-xs sm:text-sm"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">編集</span>
                          <span className="sm:hidden">編集</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const expense = expenses.find(exp => 
                              exp.property_id === row.propertyId && 
                              exp.category === '家賃' &&
                              exp.date.slice(0, 7) === row.yearMonth
                            );
                            if (expense) handleDeleteExpense(expense.id);
                          }}
                          className="border-red-200 text-red-700 hover:bg-red-50 font-medium text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">削除</span>
                          <span className="sm:hidden">削除</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
                </div>
              </div>
                  </div>
    </div>
  );
}