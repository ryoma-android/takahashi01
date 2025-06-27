'use client';

import { useState, useEffect } from 'react';
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
  const monthGroups = (() => {
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
  })();

  // 年ごと収支
  const yearGroups = (() => {
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
  })();

  // 選択中物件・月の契約者ごと集計
  const selectedDetails = (() => {
    if (!selectedPropertyId || !selectedYearMonth) return [];
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
  })();

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
            <Tabs defaultValue={viewMode} onValueChange={v => setViewMode(v as 'month' | 'year')} className="mb-4">
              <TabsList>
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
                      <Bar dataKey="total" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">年月</th>
                        <th className="border px-2 py-1">月の収入</th>
                        <th className="border px-2 py-1">詳細</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthGroups.map((row) => (
                        <tr key={row.yearMonth}>
                          <td className="border px-2 py-1">{row.yearMonth}</td>
                          <td className="border px-2 py-1">¥{row.total.toLocaleString()}</td>
                          <td className="border px-2 py-1">
                            <Button size="sm" variant="outline" onClick={() => setSelectedYearMonth(row.yearMonth)}>
                              契約者内訳
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">年</th>
                        <th className="border px-2 py-1">年の収入</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearGroups.map((row) => (
                        <tr key={row.year}>
                          <td className="border px-2 py-1">{row.year}</td>
                          <td className="border px-2 py-1">¥{row.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  {rentExpenses
                    .filter(exp => exp.property_id === selectedPropertyId && exp.date.slice(0, 7) === selectedYearMonth)
                    .map((exp, i) => (
                      <tr key={`${exp.room_no || ''}${exp.tenant_name || ''}${i}`}>
                        <td className="border px-2 py-1">{exp.room_no || '-'}</td>
                        <td className="border px-2 py-1">{exp.tenant_name || '-'}</td>
                        <td className="border px-2 py-1">{exp.amount !== null ? `¥${exp.amount.toLocaleString()}` : '-'}</td>
                        <td className="border px-2 py-1">{exp.date.slice(0, 7)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}