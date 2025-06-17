'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, CheckCircle, Clock, Plus, Bell, FileText, Building2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
  propertyName?: string;
  location?: string;
}

export function TaxInsuranceManager() {
  const [items, setItems] = useState<TaxInsuranceItem[]>([
    {
      id: 1,
      name: '固定資産税（第3期）',
      type: 'tax',
      category: '固定資産税',
      amount: 285000,
      dueDate: '2024-12-27',
      status: 'pending',
      description: '福井市内全物件の固定資産税',
      reminderDays: 7,
      location: '福井市'
    },
    {
      id: 2,
      name: '個人事業税',
      type: 'tax',
      category: '事業税',
      amount: 180000,
      dueDate: '2024-11-30',
      status: 'overdue',
      description: '不動産賃貸業 個人事業税',
      reminderDays: 7,
      location: '福井県'
    },
    {
      id: 3,
      name: '建物保険更新（福井中央）',
      type: 'insurance',
      category: '火災保険',
      amount: 95000,
      dueDate: '2024-12-15',
      status: 'pending',
      description: '火災・地震保険 年間保険料',
      reminderDays: 14,
      propertyName: 'アパート福井中央',
      location: '福井市中央1丁目'
    },
    {
      id: 4,
      name: '固定資産税（第2期）',
      type: 'tax',
      category: '固定資産税',
      amount: 285000,
      dueDate: '2024-09-30',
      status: 'paid',
      description: '福井市内全物件の固定資産税',
      paymentDate: '2024-09-25',
      reminderDays: 7,
      location: '福井市'
    },
    {
      id: 5,
      name: '所得税予定納税（第2期）',
      type: 'tax',
      category: '所得税',
      amount: 320000,
      dueDate: '2024-11-30',
      status: 'pending',
      description: '令和6年分所得税予定納税',
      reminderDays: 7,
      location: '福井税務署'
    },
    {
      id: 6,
      name: '駐車場保険更新',
      type: 'insurance',
      category: '賠償責任保険',
      amount: 45000,
      dueDate: '2024-12-20',
      status: 'pending',
      description: '駐車場賠償責任保険',
      reminderDays: 14,
      propertyName: '駐車場福井駅前',
      location: '福井市大手3丁目'
    },
    {
      id: 7,
      name: '店舗ビル保険更新',
      type: 'insurance',
      category: '火災保険',
      amount: 120000,
      dueDate: '2025-01-15',
      status: 'pending',
      description: '店舗総合保険',
      reminderDays: 30,
      propertyName: '店舗ビル片町',
      location: '福井市順化1丁目'
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'tax' as 'tax' | 'insurance',
    category: '',
    amount: '',
    dueDate: '',
    description: '',
    reminderDays: '7',
    propertyName: '',
    location: ''
  });

  const taxCategories = ['固定資産税', '所得税', '事業税', '住民税', '消費税', 'その他'];
  const insuranceCategories = ['火災保険', '地震保険', '賠償責任保険', 'その他'];
  
  // 福井市の物件リスト
  const fukuiProperties = [
    'アパート福井中央',
    '駐車場福井駅前', 
    '店舗ビル片町',
    'マンション福井南'
  ];

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
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.category && newItem.amount && newItem.dueDate) {
      const item: TaxInsuranceItem = {
        id: Date.now(),
        name: newItem.name,
        type: newItem.type,
        category: newItem.category,
        amount: parseInt(newItem.amount),
        dueDate: newItem.dueDate,
        status: 'pending',
        description: newItem.description,
        reminderDays: parseInt(newItem.reminderDays),
        propertyName: newItem.propertyName,
        location: newItem.location
      };
      setItems([...items, item]);
      setNewItem({
        name: '',
        type: 'tax',
        category: '',
        amount: '',
        dueDate: '',
        description: '',
        reminderDays: '7',
        propertyName: '',
        location: ''
      });
      setIsAddDialogOpen(false);
    }
  };

  const markAsPaid = (id: number) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, status: 'paid' as const, paymentDate: new Date().toISOString().split('T')[0] }
        : item
    ));
  };

  const pendingItems = items.filter(item => item.status === 'pending');
  const overdueItems = items.filter(item => item.status === 'overdue');
  const totalPendingAmount = pendingItems.reduce((sum, item) => sum + item.amount, 0);
  const totalOverdueAmount = overdueItems.reduce((sum, item) => sum + item.amount, 0);

  // 福井市特有の税務情報
  const fukuiTaxInfo = [
    { name: '固定資産税', rate: '1.4%', office: '福井市役所', phone: '0776-20-5310' },
    { name: '個人事業税', rate: '5%', office: '福井県税事務所', phone: '0776-21-8270' },
    { name: '所得税', rate: '累進課税', office: '福井税務署', phone: '0776-23-2690' }
  ];

  return (
    <div className="space-y-6">
      {/* 福井市税務情報 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <MapPin className="h-5 w-5" />
            <span>福井市税務・保険情報</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            福井市内不動産オーナー向けの税務・保険関連情報
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fukuiTaxInfo.map((info, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-900">{info.name}</h4>
                <p className="text-sm text-gray-600 mt-1">税率: {info.rate}</p>
                <p className="text-sm text-gray-600">{info.office}</p>
                <p className="text-sm text-blue-600 font-medium">{info.phone}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未払い項目</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingItems.length}</div>
            <p className="text-xs text-muted-foreground">項目</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">期限切れ</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueItems.length}</div>
            <p className="text-xs text-muted-foreground">項目</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未払い金額</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalPendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">合計</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">期限切れ金額</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">¥{totalOverdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">要対応</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Items */}
      {(overdueItems.length > 0 || pendingItems.some(item => getDaysUntilDue(item.dueDate) <= 7)) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              緊急対応が必要な項目
            </CardTitle>
            <CardDescription className="text-red-700">
              期限切れまたは7日以内に期限を迎える項目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...overdueItems, ...pendingItems.filter(item => getDaysUntilDue(item.dueDate) <= 7)].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium">{item.name}</p>
                      {item.propertyName && (
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          {item.propertyName}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      期限: {item.dueDate} • {item.location}
                      {item.status === 'overdue' ? (
                        <span className="text-red-600 ml-2">({Math.abs(getDaysUntilDue(item.dueDate))}日経過)</span>
                      ) : (
                        <span className="text-amber-600 ml-2">({getDaysUntilDue(item.dueDate)}日後)</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">¥{item.amount.toLocaleString()}</p>
                    <Button size="sm" className="mt-1" onClick={() => markAsPaid(item.id)}>
                      支払済にする
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>税務・保険管理</CardTitle>
              <CardDescription>福井市内物件の支払予定と実績の一覧</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  項目を追加
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>新しい税務・保険項目を追加</DialogTitle>
                  <DialogDescription>
                    支払予定の詳細情報を入力してください。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">種類</Label>
                    <Select value={newItem.type} onValueChange={(value: 'tax' | 'insurance') => setNewItem({...newItem, type: value, category: ''})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="種類を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tax">税金</SelectItem>
                        <SelectItem value="insurance">保険</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">カテゴリ</Label>
                    <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {(newItem.type === 'tax' ? taxCategories : insuranceCategories).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">項目名</Label>
                    <Input
                      id="name"
                      placeholder="項目名を入力"
                      className="col-span-3"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">金額</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="金額を入力"
                      className="col-span-3"
                      value={newItem.amount}
                      onChange={(e) => setNewItem({...newItem, amount: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dueDate" className="text-right">期限</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      className="col-span-3"
                      value={newItem.dueDate}
                      onChange={(e) => setNewItem({...newItem, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="propertyName" className="text-right">物件名</Label>
                    <Select value={newItem.propertyName} onValueChange={(value) => setNewItem({...newItem, propertyName: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="物件を選択（任意）" />
                      </SelectTrigger>
                      <SelectContent>
                        {fukuiProperties.map((property) => (
                          <SelectItem key={property} value={property}>
                            {property}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">所在地</Label>
                    <Input
                      id="location"
                      placeholder="福井市○○"
                      className="col-span-3"
                      value={newItem.location}
                      onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reminderDays" className="text-right">リマインダー</Label>
                    <Select value={newItem.reminderDays} onValueChange={(value) => setNewItem({...newItem, reminderDays: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3日前</SelectItem>
                        <SelectItem value="7">7日前</SelectItem>
                        <SelectItem value="14">14日前</SelectItem>
                        <SelectItem value="30">30日前</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">詳細</Label>
                    <Textarea
                      id="description"
                      placeholder="詳細情報"
                      className="col-span-3"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleAddItem}>
                    追加
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant={item.type === 'tax' ? 'default' : 'secondary'}>
                      {item.type === 'tax' ? '税金' : '保険'}
                    </Badge>
                    <Badge variant="outline">{item.category}</Badge>
                    {item.propertyName && (
                      <Badge variant="outline" className="text-xs">
                        <Building2 className="h-3 w-3 mr-1" />
                        {item.propertyName}
                      </Badge>
                    )}
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">{getStatusText(item.status)}</span>
                    </Badge>
                  </div>
                  <h4 className="font-semibold">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    期限: {item.dueDate} • {item.location}
                    {item.status === 'paid' && item.paymentDate && (
                      <span className="ml-2 text-green-600">（支払日: {item.paymentDate}）</span>
                    )}
                    {item.status !== 'paid' && (
                      <span className={`ml-2 ${getDaysUntilDue(item.dueDate) < 0 ? 'text-red-600' : getDaysUntilDue(item.dueDate) <= 7 ? 'text-amber-600' : 'text-gray-600'}`}>
                        {getDaysUntilDue(item.dueDate) < 0 
                          ? `${Math.abs(getDaysUntilDue(item.dueDate))}日経過`
                          : `${getDaysUntilDue(item.dueDate)}日後`
                        }
                      </span>
                    )}
                  </p>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">¥{item.amount.toLocaleString()}</p>
                  <div className="flex space-x-2 mt-2">
                    {item.status !== 'paid' && (
                      <Button variant="outline" size="sm" onClick={() => markAsPaid(item.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        支払済
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
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