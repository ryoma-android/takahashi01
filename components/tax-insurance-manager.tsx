'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, CheckCircle, Clock, Plus, Bell, FileText, Building2, MapPin, Loader2, Calculator } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TaxInsuranceItem {
  id: number;
  name: string;
  type: 'tax' | 'insurance';
  category: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  description?: string;
  paymentDate?: string;
  reminderDays: number;
  location?: string;
  insuranceCompany?: string;
  contractPeriod?: string;
  municipality?: string;
}

export function TaxInsuranceManager() {
  const [items, setItems] = useState<TaxInsuranceItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'tax' as 'tax' | 'insurance',
    category: '',
    amount: '',
    dueDate: '',
    description: '',
    reminderDays: '7',
    location: '',
    insuranceCompany: '',
    contractPeriod: '',
    municipality: '',
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<TaxInsuranceItem | null>(null);

  const taxCategories = ['固定資産税', '所得税', '事業税', '住民税', '消費税', 'その他'];
  const insuranceCategories = ['火災保険', '地震保険', '賠償責任保険', 'その他'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return '支払済';
      case 'pending': return '未払い';
      case 'overdue': return '期限切れ';
      default: return '不明';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return null;
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddItem = async () => {
    if (newItem.name && newItem.category && newItem.amount && newItem.dueDate) {
      try {
        // DBカラムだけを送信
        const postData = {
          type: newItem.type,
          name: newItem.name,
          amount: parseInt(newItem.amount),
          due_date: newItem.dueDate,
          status: 'pending',
          description: newItem.description || '',
          created_at: new Date().toISOString(),
        };
        const res = await fetch('/api/tax-insurance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData),
        });
        if (!res.ok) {
          const err = await res.json();
          alert('保存に失敗しました: ' + (err.error || res.status));
          return;
        }
        // 保存後に一覧を再取得
        const listRes = await fetch('/api/tax-insurance');
        const list = await listRes.json();
        setItems(list.map((item: any) => ({ ...item, dueDate: item.due_date })));
        setNewItem({
          name: '',
          type: 'tax',
          category: '',
          amount: '',
          dueDate: '',
          description: '',
          reminderDays: '7',
          location: '',
          insuranceCompany: '',
          contractPeriod: '',
          municipality: '',
        });
        setIsAddDialogOpen(false);
      } catch (e) {
        alert('保存時にエラーが発生しました');
      }
    }
  };

  const markAsPaid = async (id: number) => {
    try {
      // DBのstatusを'paid'に更新
      await fetch(`/api/tax-insurance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'paid' }),
      });
      // 再取得
      const listRes = await fetch('/api/tax-insurance');
      const list = await listRes.json();
      setItems(list.map((item: any) => ({ ...item, dueDate: item.due_date })));
    } catch (e) {
      alert('支払済みへの更新に失敗しました');
    }
  };

  // フィルタ: 未払い・期限切れのみ表示
  const visibleItems = items.filter(item => item.status === 'pending' || item.status === 'overdue');
  const pendingItems = visibleItems.filter(item => item.status === 'pending');
  const overdueItems = visibleItems.filter(item => item.status === 'overdue');
  const totalPendingAmount = pendingItems.reduce((sum, item) => sum + item.amount, 0);
  const totalOverdueAmount = overdueItems.reduce((sum, item) => sum + item.amount, 0);

  // 編集開始
  const handleEdit = (item: TaxInsuranceItem) => {
    setEditItem(item);
    setIsEditDialogOpen(true);
  };
  // 編集保存
  const handleUpdate = async () => {
    if (!editItem) return;
    try {
      console.log('PATCH送信前 dueDate:', editItem.dueDate);
      const patchData = {
        id: editItem.id,
        name: editItem.name,
        type: editItem.type,
        amount: editItem.amount,
        due_date: editItem.dueDate,
        status: editItem.status,
        description: editItem.description || '',
      };
      await fetch('/api/tax-insurance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      });
      const listRes = await fetch('/api/tax-insurance');
      const list = await listRes.json();
      setItems(list.map((item: any) => ({ ...item, dueDate: item.due_date })));
      setIsEditDialogOpen(false);
      setEditItem(null);
    } catch (e) {
      alert('編集の保存に失敗しました');
    }
  };
  // 削除
  const handleDelete = async (id: number) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await fetch('/api/tax-insurance', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const listRes = await fetch('/api/tax-insurance');
      const list = await listRes.json();
      setItems(list.map((item: any) => ({ ...item, dueDate: item.due_date })));
    } catch (e) {
      alert('削除に失敗しました');
    }
  };

  useEffect(() => {
    // 初回マウント時にDBからデータ取得
    fetch('/api/tax-insurance')
      .then(res => res.json())
      .then(data => setItems(
        data.map((item: any) => ({
          ...item,
          dueDate: item.due_date,
        }))
      ))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-6">
      {/* Add Dialog is always rendered */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              新しい税務・保険項目を追加
            </DialogTitle>
            <DialogDescription>
              支払予定の詳細情報を入力してください。
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue={newItem.type} onValueChange={v => setNewItem({ ...newItem, type: v as 'tax' | 'insurance', category: '', insuranceCompany: '', contractPeriod: '', municipality: '' })}>
            <TabsList className="mb-4 w-full grid grid-cols-2">
              <TabsTrigger value="tax">税金</TabsTrigger>
              <TabsTrigger value="insurance">保険</TabsTrigger>
            </TabsList>
            <TabsContent value="tax">
              <div className="grid gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category">カテゴリ <span className="text-red-500">*</span></Label>
                  <Select value={newItem.category} onValueChange={value => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">項目名 <span className="text-red-500">*</span></Label>
                  <Input id="name" placeholder="例: 令和6年度 固定資産税" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                </div>
                {newItem.category === '固定資産税' && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="municipality">自治体 <span className="text-red-500">*</span></Label>
                    <Input id="municipality" placeholder="例: 福井市" value={newItem.municipality} onChange={e => setNewItem({ ...newItem, municipality: e.target.value })} />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="amount">金額 <span className="text-red-500">*</span></Label>
                  <Input id="amount" type="number" placeholder="金額を入力" value={newItem.amount} onChange={e => setNewItem({ ...newItem, amount: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dueDate">納期限 <span className="text-red-500">*</span></Label>
                  <Input id="dueDate" type="date" value={newItem.dueDate} onChange={e => setNewItem({ ...newItem, dueDate: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reminderDays">リマインダー</Label>
                  <Select value={newItem.reminderDays} onValueChange={value => setNewItem({ ...newItem, reminderDays: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="リマインダー日数を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1日前</SelectItem>
                      <SelectItem value="3">3日前</SelectItem>
                      <SelectItem value="7">7日前</SelectItem>
                      <SelectItem value="14">14日前</SelectItem>
                      <SelectItem value="30">30日前</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea id="description" placeholder="詳細説明（任意）" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="insurance">
              <div className="grid gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category">カテゴリ <span className="text-red-500">*</span></Label>
                  <Select value={newItem.category} onValueChange={value => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {insuranceCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">保険名 <span className="text-red-500">*</span></Label>
                  <Input id="name" placeholder="例: ○○火災保険" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="insuranceCompany">保険会社 <span className="text-red-500">*</span></Label>
                  <Input id="insuranceCompany" placeholder="例: ○○損保" value={newItem.insuranceCompany} onChange={e => setNewItem({ ...newItem, insuranceCompany: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="contractPeriod">契約期間 <span className="text-red-500">*</span></Label>
                  <Input id="contractPeriod" placeholder="例: 2024/04/01〜2025/03/31" value={newItem.contractPeriod} onChange={e => setNewItem({ ...newItem, contractPeriod: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="amount">年額 <span className="text-red-500">*</span></Label>
                  <Input id="amount" type="number" placeholder="年額を入力" value={newItem.amount} onChange={e => setNewItem({ ...newItem, amount: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="dueDate">納期限 <span className="text-red-500">*</span></Label>
                  <Input id="dueDate" type="date" value={newItem.dueDate} onChange={e => setNewItem({ ...newItem, dueDate: e.target.value })} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reminderDays">リマインダー</Label>
                  <Select value={newItem.reminderDays} onValueChange={value => setNewItem({ ...newItem, reminderDays: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="リマインダー日数を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1日前</SelectItem>
                      <SelectItem value="3">3日前</SelectItem>
                      <SelectItem value="7">7日前</SelectItem>
                      <SelectItem value="14">14日前</SelectItem>
                      <SelectItem value="30">30日前</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">説明</Label>
                  <Textarea id="description" placeholder="詳細説明（任意）" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              キャンセル
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow" onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-1" />追加
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CRMライクな税務・保険管理ダッシュボード */}
      <div className="space-y-6">
        {/* ヘッダーセクション */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">税務・保険管理</h1>
              <p className="text-purple-100 text-base sm:text-lg">支払予定の一元管理と期限管理</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-center sm:text-right">
                <div className="text-xl sm:text-2xl font-bold">{items.length}</div>
                <div className="text-purple-100 text-sm">管理項目</div>
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">新規項目</span>
                <span className="sm:hidden">項目追加</span>
              </Button>
            </div>
          </div>
        </div>

        {/* データが空の場合 */}
        {items.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calculator className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">税務・保険項目を追加してください</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                支払予定の税務・保険情報を登録すると、期限管理と支払い状況を一元管理できます
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">税金管理</p>
                  <p className="text-xs text-gray-500">固定資産税、所得税など</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Building2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">保険管理</p>
                  <p className="text-xs text-gray-500">火災保険、地震保険など</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <Bell className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">期限管理</p>
                  <p className="text-xs text-gray-500">支払期限の自動チェック</p>
                </div>
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                最初の項目を追加
              </Button>
            </div>
          </div>
        )}

        {/* データがある場合 */}
        {items.length > 0 && (
          <>
            {/* 統計カード */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-xs sm:text-sm">
                    未払い
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{pendingItems.length}</div>
                <p className="text-xs sm:text-sm text-gray-600">項目</p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-200 text-xs sm:text-sm">
                    期限切れ
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{overdueItems.length}</div>
                <p className="text-xs sm:text-sm text-gray-600">項目</p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs sm:text-sm">
                    未払い金額
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">¥{totalPendingAmount.toLocaleString()}</div>
                <p className="text-xs sm:text-sm text-gray-600">合計</p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <Badge variant="outline" className="text-red-600 border-red-200 text-xs sm:text-sm">
                    要対応
                  </Badge>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">¥{totalOverdueAmount.toLocaleString()}</div>
                <p className="text-xs sm:text-sm text-gray-600">期限切れ金額</p>
              </div>
            </div>

            {/* 緊急対応セクション */}
            {(overdueItems.length > 0 || pendingItems.some(item => (getDaysUntilDue(item.dueDate) ?? 0) <= 7)) && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 sm:p-6 border border-red-200 shadow-lg">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-red-800">緊急対応が必要な項目</h2>
                    <p className="text-red-700 text-xs sm:text-sm">期限切れまたは7日以内に期限を迎える項目</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:gap-4">
                  {[...overdueItems, ...pendingItems.filter(item => (getDaysUntilDue(item.dueDate) ?? 0) <= 7)].map((item) => (
                    <div key={item.id} className="bg-white rounded-xl p-4 sm:p-6 border border-red-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg">{item.name}</h3>
                            {item.municipality && (
                              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 w-fit">
                                <Building2 className="h-3 w-3 mr-1" />
                                {item.municipality}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                              期限: {item.dueDate}
                            </span>
                            {(() => { 
                              const days = getDaysUntilDue(item.dueDate); 
                              return item.status === 'overdue' ? (
                                <span className="text-red-600 font-semibold">({days === null ? '-' : `${Math.abs(days)}日経過`})</span>
                              ) : (
                                <span className="text-amber-600 font-semibold">({days === null ? '-' : `${days}日後`})</span>
                              ); 
                            })()}
                          </div>
                          {item.insuranceCompany && (
                            <p className="text-xs sm:text-sm text-gray-600">保険会社: {item.insuranceCompany}</p>
                          )}
                          {item.contractPeriod && (
                            <p className="text-xs sm:text-sm text-gray-600">契約期間: {item.contractPeriod}</p>
                          )}
                        </div>
                        <div className="text-center sm:text-right">
                          <div className="text-xl sm:text-2xl font-bold text-red-600 mb-3">
                            ¥{item.amount.toLocaleString()}
                          </div>
                          {item.status !== 'paid' && (
                            <Button 
                              size="sm" 
                              className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm"
                              onClick={() => markAsPaid(item.id)}
                            >
                              支払済にする
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* メインリスト */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2 sm:gap-3">
                    <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    税務・保険管理
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      {items.length}件
                    </Badge>
                  </h2>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                {visibleItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">すべての項目が完了しました</h3>
                    <p className="text-gray-500">新しい税務・保険項目を追加して管理を続けましょう</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleItems.map((item) => (
                      <div key={item.id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                        <div className="space-y-4">
                          {/* ヘッダー部分 */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-lg truncate">{item.name}</h3>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <Badge className={`${getStatusColor(item.status)} text-xs`}>
                                  {getStatusIcon(item.status)}
                                  {getStatusText(item.status)}
                                </Badge>
                                {item.municipality && (
                                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                                    <Building2 className="h-3 w-3 mr-1" />
                                    {item.municipality}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* 詳細情報 */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>{item.category}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>期限: {item.dueDate}</span>
                            </div>
                            {(() => { 
                              const days = getDaysUntilDue(item.dueDate); 
                              return item.status === 'overdue' ? (
                                <div className="text-red-600 font-semibold">({days === null ? '-' : `${Math.abs(days)}日経過`})</div>
                              ) : item.status === 'pending' ? (
                                <div className="text-amber-600 font-semibold">({days === null ? '-' : `${days}日後`})</div>
                              ) : (
                                <div className="text-green-600 font-semibold">支払済: {item.paymentDate}</div>
                              ); 
                            })()}
                          </div>
                          
                          {/* 追加情報 */}
                          {(item.insuranceCompany || item.contractPeriod || item.description) && (
                            <div className="space-y-2 text-sm text-gray-600">
                              {item.insuranceCompany && (
                                <p>保険会社: {item.insuranceCompany}</p>
                              )}
                              {item.contractPeriod && (
                                <p>契約期間: {item.contractPeriod}</p>
                              )}
                              {item.description && (
                                <p className="text-gray-500">{item.description}</p>
                              )}
                            </div>
                          )}
                          
                          {/* 金額とアクション */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-100">
                            <div className="text-2xl font-bold text-gray-900">
                              ¥{item.amount.toLocaleString()}
                            </div>
                            {item.status !== 'paid' && (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                                  onClick={() => markAsPaid(item.id)}
                                >
                                  支払済
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-purple-200 text-purple-700 hover:bg-purple-50 w-full sm:w-auto"
                                  onClick={() => handleEdit(item)}
                                >
                                  編集
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-red-200 text-red-700 hover:bg-red-50 w-full sm:w-auto"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  削除
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                税務・保険項目を編集
              </DialogTitle>
              <DialogDescription>
                項目の詳細情報を編集します
              </DialogDescription>
            </DialogHeader>
            {editItem && (
              <div className="grid gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-name">項目名</Label>
                  <Input id="edit-name" value={editItem?.name || ''} onChange={e => setEditItem(editItem ? { ...editItem, name: e.target.value } : null)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-amount">金額</Label>
                  <Input id="edit-amount" type="number" value={editItem?.amount || ''} onChange={e => setEditItem(editItem ? { ...editItem, amount: Number(e.target.value) } : null)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-dueDate">納期限</Label>
                  <Input id="edit-dueDate" type="date" value={editItem?.dueDate || ''} onChange={e => setEditItem(editItem ? { ...editItem, dueDate: e.target.value } : null)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="edit-description">説明</Label>
                  <Textarea id="edit-description" value={editItem?.description || ''} onChange={e => setEditItem(editItem ? { ...editItem, description: e.target.value } : null)} />
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>キャンセル</Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold shadow" onClick={handleUpdate}>保存</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}