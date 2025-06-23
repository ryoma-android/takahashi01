'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Property } from '@/lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PropertyDashboardProps {
  properties?: Property[]; // オプショナルに変更
}

export function PropertyDashboard({ properties: initialProperties }: PropertyDashboardProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初期データが渡されている場合はそれを使用、そうでなければAPIから取得
    if (initialProperties && initialProperties.length > 0) {
      setProperties(initialProperties);
      setLoading(false);
    } else {
      fetchProperties();
    }
  }, [initialProperties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/properties');
      
      if (!response.ok) {
        throw new Error('物件データの取得に失敗しました');
      }

      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(err instanceof Error ? err.message : 'データの取得中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="glass-effect hover-lift">
          <CardContent className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">物件データを読み込み中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <button 
              onClick={fetchProperties}
              className="ml-2 underline hover:no-underline"
            >
              再試行
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // データが空の場合
  if (properties.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="glass-effect hover-lift">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600 mb-4">物件データが見つかりません</p>
              <button 
                onClick={fetchProperties}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                データを再取得
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 福井市の月別データ（実際のデータに基づく）
  const monthlyData = [
    { month: '1月', revenue: 3030000, expenses: 680000, net: 2350000 },
    { month: '2月', revenue: 3030000, expenses: 620000, net: 2410000 },
    { month: '3月', revenue: 3030000, expenses: 750000, net: 2280000 },
    { month: '4月', revenue: 3030000, expenses: 690000, net: 2340000 },
    { month: '5月', revenue: 3030000, expenses: 820000, net: 2210000 },
    { month: '6月', revenue: 3030000, expenses: 710000, net: 2320000 },
    { month: '7月', revenue: 3030000, expenses: 780000, net: 2250000 },
    { month: '8月', revenue: 3030000, expenses: 650000, net: 2380000 },
    { month: '9月', revenue: 3030000, expenses: 720000, net: 2310000 },
    { month: '10月', revenue: 3030000, expenses: 760000, net: 2270000 },
    { month: '11月', revenue: 3030000, expenses: 800000, net: 2230000 },
    { month: '12月', revenue: 3030000, expenses: 890000, net: 2140000 }
  ];

  // データ変換関数（Supabaseのデータ形式をUI用に変換）
  const transformPropertyData = (property: Property) => ({
    id: property.id,
    name: property.name,
    type: getPropertyTypeDisplay(property.type),
    units: property.units,
    occupiedUnits: property.occupied_units,
    monthlyIncome: property.monthly_income,
    yearlyIncome: property.yearly_income,
    expenses: property.expenses,
    netIncome: property.net_income,
    yieldRate: property.yield_rate,
    location: property.location,
    address: property.address,
    buildYear: property.build_year,
    structure: property.structure,
    totalFloors: property.total_floors
  });

  const transformedProperties = properties.map(transformPropertyData);

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            高橋ホーム月別収支推移
          </CardTitle>
          <CardDescription>2024年の収入・支出・純利益の推移</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`¥${value.toLocaleString()}`, '']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="url(#revenueGradient)" 
                name="収入" 
                strokeWidth={4}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="url(#expenseGradient)" 
                name="支出" 
                strokeWidth={4}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#EF4444', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="url(#netGradient)" 
                name="純利益" 
                strokeWidth={4}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
              />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
                <linearGradient id="netGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Yield Comparison */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            高橋ホーム物件別利回り比較
          </CardTitle>
          <CardDescription>各物件の利回り実績と福井市平均との比較</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={transformedProperties} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis type="number" domain={[0, 15]} />
              <YAxis dataKey="name" type="category" width={200} />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, '利回り']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px'
                }}
              />
              <Bar 
                dataKey="yieldRate" 
                fill="url(#yieldGradient)"
                radius={[0, 8, 8, 0]}
              />
              <defs>
                <linearGradient id="yieldGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="50%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 詳細物件情報テーブル */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            高橋ホーム物件詳細一覧
          </CardTitle>
          <CardDescription>福井市内の全管理物件の詳細情報</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold text-gray-700">物件名</th>
                  <th className="text-left p-4 font-semibold text-gray-700">所在地</th>
                  <th className="text-right p-4 font-semibold text-gray-700">築年数</th>
                  <th className="text-right p-4 font-semibold text-gray-700">入居率</th>
                  <th className="text-right p-4 font-semibold text-gray-700">月収入</th>
                  <th className="text-right p-4 font-semibold text-gray-700">利回り</th>
                  <th className="text-right p-4 font-semibold text-gray-700">純利益</th>
                </tr>
              </thead>
              <tbody>
                {transformedProperties.map((property, index) => (
                  <tr 
                    key={property.id} 
                    className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-300"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-gray-900">{property.name}</p>
                        <p className="text-sm text-gray-600">{property.type}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-700">{property.location}</p>
                    </td>
                    <td className="p-4 text-right">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {new Date().getFullYear() - property.buildYear}年
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <span className="text-sm font-semibold">
                          {((property.occupiedUnits / property.units) * 100).toFixed(0)}%
                        </span>
                        <div className="w-20 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${(property.occupiedUnits / property.units) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-green-600">
                      ¥{property.monthlyIncome.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <Badge 
                        variant="outline" 
                        className={`${
                          property.yieldRate >= 10 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : property.yieldRate >= 8 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        {property.yieldRate}%
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-bold text-purple-600">
                      ¥{property.netIncome.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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