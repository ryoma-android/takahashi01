'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  FileText, 
  BarChart3, 
  Calendar, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  MapPin
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface Property {
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

interface ReportsGeneratorProps {
  properties: Property[];
}

interface ReportFilter {
  dateRange: {
    start: string;
    end: string;
  };
  properties: number[];
  categories: string[];
  reportType: 'revenue' | 'expenses' | 'tax' | 'comprehensive' | 'fukui-analysis';
}

export function ReportsGenerator({ properties }: ReportsGeneratorProps) {
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31',
    },
    properties: [],
    categories: [],
    reportType: 'comprehensive'
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const expenseCategories = ['修繕費', '清掃費', '保守点検', '固定資産税', '保険料', '管理費', '光熱費'];
  
  // 福井市特有のレポートデータ
  const reportData = {
    summary: {
      totalRevenue: 23880000,
      totalExpenses: 3220000,
      netIncome: 20660000,
      averageYield: 9.0,
      totalProperties: 4,
      totalUnits: 51,
      occupancyRate: 86.3,
      fukuiMarketGrowth: 8.5
    },
    monthlyTrend: [
      { month: '1月', revenue: 1990000, expenses: 180000, net: 1810000, fukui平均: 1650000 },
      { month: '2月', revenue: 1990000, expenses: 145000, net: 1845000, fukui平均: 1680000 },
      { month: '3月', revenue: 1990000, expenses: 220000, net: 1770000, fukui平均: 1720000 },
      { month: '4月', revenue: 1990000, expenses: 165000, net: 1825000, fukui平均: 1750000 },
      { month: '5月', revenue: 1990000, expenses: 280000, net: 1710000, fukui平均: 1780000 },
      { month: '6月', revenue: 1990000, expenses: 190000, net: 1800000, fukui平均: 1800000 },
      { month: '7月', revenue: 1990000, expenses: 210000, net: 1780000, fukui平均: 1820000 },
      { month: '8月', revenue: 1990000, expenses: 175000, net: 1815000, fukui平均: 1850000 },
      { month: '9月', revenue: 1990000, expenses: 155000, net: 1835000, fukui平均: 1880000 },
      { month: '10月', revenue: 1990000, expenses: 195000, net: 1795000, fukui平均: 1900000 },
      { month: '11月', revenue: 1990000, expenses: 240000, net: 1750000, fukui平均: 1920000 },
      { month: '12月', revenue: 1990000, expenses: 265000, net: 1725000, fukui平均: 1950000 }
    ],
    expenseBreakdown: [
      { category: '修繕費', amount: 1800000, percentage: 55.9 },
      { category: '清掃費', amount: 420000, percentage: 13.0 },
      { category: '固定資産税', amount: 570000, percentage: 17.7 },
      { category: '保険料', amount: 260000, percentage: 8.1 },
      { category: '管理費', amount: 170000, percentage: 5.3 }
    ],
    propertyPerformance: properties.map(p => ({
      name: p.name,
      revenue: p.yearlyIncome,
      expenses: p.expenses,
      netIncome: p.netIncome,
      yield: p.yieldRate,
      occupancy: (p.occupiedUnits / p.units) * 100,
      location: p.location,
      buildYear: p.buildYear
    })),
    fukuiMarketAnalysis: {
      averageRent: {
        apartment: 65000,
        parking: 9200,
        commercial: 80000,
        mansion: 70000
      },
      marketTrends: [
        { area: '中央', growth: 12.5, avgYield: 8.8 },
        { area: '大手', growth: 15.2, avgYield: 11.0 },
        { area: '順化', growth: 8.3, avgYield: 7.9 },
        { area: '花堂南', growth: 10.1, avgYield: 8.7 }
      ]
    }
  };

  const handleGenerateReport = async (format: 'pdf' | 'csv') => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const fileName = `福井不動産収支レポート_${filters.reportType}_${new Date().getFullYear()}年.${format}`;
    console.log(`Generated report: ${fileName}`);
    
    setIsGenerating(false);
  };

  const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* 福井市市場分析 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <MapPin className="h-5 w-5" />
            <span>福井市不動産市場分析</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            福井市内の不動産市場動向と比較分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900">アパート平均家賃</h4>
              <p className="text-2xl font-bold text-blue-600">¥{reportData.fukuiMarketAnalysis.averageRent.apartment.toLocaleString()}</p>
              <p className="text-sm text-gray-600">福井市平均</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900">駐車場平均料金</h4>
              <p className="text-2xl font-bold text-green-600">¥{reportData.fukuiMarketAnalysis.averageRent.parking.toLocaleString()}</p>
              <p className="text-sm text-gray-600">月額平均</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900">店舗平均家賃</h4>
              <p className="text-2xl font-bold text-purple-600">¥{reportData.fukuiMarketAnalysis.averageRent.commercial.toLocaleString()}</p>
              <p className="text-sm text-gray-600">坪単価</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-900">市場成長率</h4>
              <p className="text-2xl font-bold text-amber-600">{reportData.summary.fukuiMarketGrowth}%</p>
              <p className="text-sm text-gray-600">前年比</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>レポート設定</span>
          </CardTitle>
          <CardDescription>
            レポートの対象期間、物件、カテゴリを選択してください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>レポートタイプ</Label>
              <Select 
                value={filters.reportType} 
                onValueChange={(value: any) => setFilters({...filters, reportType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">総合レポート</SelectItem>
                  <SelectItem value="revenue">収入レポート</SelectItem>
                  <SelectItem value="expenses">支出レポート</SelectItem>
                  <SelectItem value="tax">税務レポート</SelectItem>
                  <SelectItem value="fukui-analysis">福井市場分析</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>開始日</Label>
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => setFilters({
                  ...filters, 
                  dateRange: { ...filters.dateRange, start: e.target.value }
                })}
              />
            </div>

            <div>
              <Label>終了日</Label>
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => setFilters({
                  ...filters, 
                  dateRange: { ...filters.dateRange, end: e.target.value }
                })}
              />
            </div>

            <div className="flex items-end space-x-2">
              <Button 
                onClick={() => handleGenerateReport('pdf')} 
                disabled={isGenerating}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF出力
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleGenerateReport('csv')} 
                disabled={isGenerating}
              >
                CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">対象物件</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {properties.map((property) => (
                  <div key={property.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`property-${property.id}`}
                      checked={filters.properties.includes(property.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({
                            ...filters,
                            properties: [...filters.properties, property.id]
                          });
                        } else {
                          setFilters({
                            ...filters,
                            properties: filters.properties.filter(id => id !== property.id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`property-${property.id}`} className="text-sm">
                      {property.name} ({property.location})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">支出カテゴリ</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {expenseCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters({
                            ...filters,
                            categories: [...filters.categories, category]
                          });
                        } else {
                          setFilters({
                            ...filters,
                            categories: filters.categories.filter(c => c !== category)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`category-${category}`} className="text-sm">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総収入</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{reportData.summary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">前年比 +15.2%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総支出</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">¥{reportData.summary.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">前年比 -3.8%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">純利益</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">¥{reportData.summary.netIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">利益率 {((reportData.summary.netIncome / reportData.summary.totalRevenue) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">入居率</CardTitle>
            <Building2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{reportData.summary.occupancyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">福井市平均: 82.3%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>月別収支推移（福井市平均との比較）</CardTitle>
            <CardDescription>2024年の収支と福井市平均の比較</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="net" stroke="#3B82F6" name="純利益" strokeWidth={3} />
                <Line type="monotone" dataKey="fukui平均" stroke="#94A3B8" name="福井市平均" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>支出カテゴリ別内訳</CardTitle>
            <CardDescription>年間支出の構成比</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category} ${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {reportData.expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>クイックエクスポート</CardTitle>
          <CardDescription>福井市不動産オーナー向けレポート形式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGenerating}
            >
              <FileText className="h-6 w-6" />
              <span>年間収支レポート（PDF）</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleGenerateReport('csv')}
              disabled={isGenerating}
            >
              <BarChart3 className="h-6 w-6" />
              <span>福井市場分析データ（CSV）</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleGenerateReport('pdf')}
              disabled={isGenerating}
            >
              <Calendar className="h-6 w-6" />
              <span>確定申告用レポート</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}