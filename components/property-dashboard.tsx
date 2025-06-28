'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useProperties } from '@/contexts/PropertyContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Expense {
  id: number;
  property_id: number;
  property_name: string;
  date: string;
  amount: number;
  room_no?: string;
  tenant_name?: string;
  created_at: string;
  category: string;
}

export function PropertyDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { properties } = useProperties();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [selectedYearMonth, setSelectedYearMonth] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  useEffect(() => {
    fetchData();
  }, [properties]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      if (error) {
        setError('支出データの取得に失敗しました');
        return;
      }
      setExpenses(data || []);
    } catch (e) {
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 家賃のみフィルタ
  const rentExpenses = expenses.filter(exp => exp.category === '家賃');

  // 物件名リスト
  const propertyList = properties.map(p => ({ id: p.id, name: p.name }));

  // 選択中物件の月ごと収支
  const monthGroups = useMemo(() => {
    if (!selectedPropertyId) return [];
    const filtered = rentExpenses.filter(exp => exp.property_id === selectedPropertyId);
    const map = new Map<string, { yearMonth: string; total: number }>();
    filtered.forEach(exp => {
      const yearMonth = exp.date.slice(0, 7); // YYYY-MM
      if (!map.has(yearMonth)) {
        map.set(yearMonth, { yearMonth, total: 0 });
      }
      map.get(yearMonth)!.total += exp.amount || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  }, [selectedPropertyId, rentExpenses]);

  // 年ごと収支
  const yearGroups = useMemo(() => {
    if (!selectedPropertyId) return [];
    const filtered = rentExpenses.filter(exp => exp.property_id === selectedPropertyId);
    const map = new Map<string, { year: string; total: number }>();
    filtered.forEach(exp => {
      const year = exp.date.slice(0, 4); // YYYY
      if (!map.has(year)) {
        map.set(year, { year, total: 0 });
      }
      map.get(year)!.total += exp.amount || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.year.localeCompare(a.year));
  }, [selectedPropertyId, rentExpenses]);

  // 選択中物件・月の契約者ごと集計
  const selectedDetails = useMemo(() => {
    if (!selectedPropertyId || !selectedYearMonth) return {};
    return rentExpenses
      .filter(exp => exp.property_id === selectedPropertyId && exp.date.slice(0, 7) === selectedYearMonth)
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
  }, [selectedPropertyId, selectedYearMonth, rentExpenses]);

    return (
    <div className="space-y-8">
      {/* 1. 物件名リスト */}
      {!selectedPropertyId && (
        <Card>
          <CardHeader>
            <CardTitle>物件一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {propertyList.map((p) => (
                <Button key={p.id} variant="outline" className="w-full justify-start" onClick={() => setSelectedPropertyId(p.id)}>
                  {p.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. 月/年ごとの収支リスト＋グラフ */}
      {selectedPropertyId && !selectedYearMonth && (
        <Card>
          <CardHeader>
            <CardTitle>
              {(() => {
                const prop = properties.find(p => p.id === selectedPropertyId);
                return `${prop?.name || ''} の収支`;
              })()}
            </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSelectedPropertyId(null)}>
              戻る
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={viewMode} onValueChange={v => setViewMode(v as 'month' | 'year')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="month">月別</TabsTrigger>
                <TabsTrigger value="year">年別</TabsTrigger>
              </TabsList>
              <TabsContent value="month">
                <div className="mb-4" style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={monthGroups.slice().reverse()} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="yearMonth" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* 縦に伸びるカード形式のリスト */}
                <div className="space-y-3">
                  {monthGroups.map((row) => (
                    <div key={row.yearMonth} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-lg font-semibold text-gray-900">{row.yearMonth}</div>
                          <div className="text-2xl font-bold text-green-600">¥{row.total.toLocaleString()}</div>
                        </div>
                        <div className="flex-shrink-0">
                          <Button size="sm" variant="outline" onClick={() => setSelectedYearMonth(row.yearMonth)}>
                            契約者内訳
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="year">
                <div className="mb-4" style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={yearGroups.slice().reverse()} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* 縦に伸びるカード形式のリスト */}
                <div className="space-y-3">
                  {yearGroups.map((row) => (
                    <div key={row.year} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <div className="text-lg font-semibold text-gray-900">{row.year}年</div>
                          <div className="text-2xl font-bold text-green-600">¥{row.total.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* 3. 契約者ごとの内訳（月別詳細） */}
      {selectedPropertyId && selectedYearMonth && (
        <Card>
            <CardHeader>
            <CardTitle>
              {(() => {
                const prop = properties.find(p => p.id === selectedPropertyId);
                return `${prop?.name || ''} - ${selectedYearMonth} の詳細`;
              })()}
              </CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSelectedYearMonth(null)}>
              戻る
            </Button>
            </CardHeader>
            <CardContent>
            {/* 物件名・合計金額 */}
            <div className="mb-2 text-sm text-gray-700">
              物件名: <span className="font-bold">{(() => {
                const prop = properties.find(p => p.id === selectedPropertyId);
                return prop?.name || '';
              })()}</span>
            </div>
            <div className="mb-2 text-sm text-gray-700">
              合計金額: <span className="font-bold">
                ¥{Object.values(selectedDetails).reduce((sum, row) => sum + (row.total || 0), 0).toLocaleString()}
              </span>
            </div>
              {/* 縦に伸びるカード形式の契約者リスト */}
              <div className="space-y-3">
                {rentExpenses
                  .filter(exp => exp.property_id === selectedPropertyId && exp.date.slice(0, 7) === selectedYearMonth)
                  .map((exp, i) => (
                    <div key={`${exp.room_no || ''}${exp.tenant_name || ''}${i}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">部屋No.</div>
                          <div className="font-semibold text-gray-900">{exp.room_no || '-'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">契約者</div>
                          <div className="font-semibold text-gray-900">{exp.tenant_name || '-'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">合計</div>
                          <div className="font-bold text-green-600">{exp.amount !== null ? `¥${exp.amount.toLocaleString()}` : '-'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">年月</div>
                          <div className="font-semibold text-gray-900">{exp.date.slice(0, 7)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}