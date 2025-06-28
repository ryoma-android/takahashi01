'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Play, 
  FileText, 
  Camera, 
  Calculator, 
  BarChart3,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  Phone,
  Mail,
  Video,
  BookOpen,
  MousePointer,
  Eye,
  Upload,
  Download,
  Settings,
  Users,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

export function UserGuide() {
  const [activeGuide, setActiveGuide] = useState('basic');

  const basicSteps = [
    {
      title: "1. ホーム画面の見方",
      description: "画面上部に物件の収入や入居率が表示されます",
      icon: <Eye className="h-5 w-5" />,
      details: [
        "青いカードには管理物件数が表示されます",
        "緑のカードには入居率（何％の部屋が埋まっているか）が表示されます",
        "紫のカードには月の収入が表示されます"
      ]
    },
    {
      title: "2. タブの切り替え方",
      description: "画面中央のボタンを押すと、違う画面に切り替わります",
      icon: <MousePointer className="h-5 w-5" />,
      details: [
        "「ダッシュボード」：全体の状況を見る画面",
        "「支出管理」：お金の出入りを記録する画面",
        "「書類OCR」：領収書などを写真で取り込む画面",
        "「税務・保険」：税金や保険の支払いを管理する画面",
        "「レポート」：月次・年次の報告書を作る画面"
      ]
    },
    {
      title: "3. データの見方",
      description: "グラフや表の見方を覚えましょう",
      icon: <BarChart3 className="h-5 w-5" />,
      details: [
        "棒グラフ：高いほど金額が大きいことを表します",
        "円グラフ：全体に対する割合を表します",
        "線グラフ：時間の経過とともに数値がどう変化したかを表します"
      ]
    }
  ];

  const ocrSteps = [
    {
      title: "OCR（書類読み取り）とは？",
      description: "写真を撮るだけで、領収書の内容を自動で読み取る機能です",
      icon: <Camera className="h-5 w-5" />,
      details: [
        "OCR = Optical Character Recognition（光学文字認識）",
        "領収書や請求書を写真で撮影するだけ",
        "金額、日付、業者名を自動で読み取ります",
        "手入力の手間が大幅に削減されます"
      ]
    },
    {
      title: "書類OCRの使い方",
      description: "簡単3ステップで書類を取り込めます",
      icon: <Upload className="h-5 w-5" />,
      details: [
        "1. 「書類OCR」タブをクリック",
        "2. 「ファイルを選択」ボタンを押す",
        "3. スマホで撮った写真やPDFを選択",
        "4. 自動で内容が読み取られます"
      ]
    },
    {
      title: "読み取り結果の確認",
      description: "自動読み取りした内容を確認・修正できます",
      icon: <CheckCircle className="h-5 w-5" />,
      details: [
        "金額が正しく読み取られているか確認",
        "業者名や日付に間違いがないかチェック",
        "間違いがあれば「編集」ボタンで修正",
        "「収支に追加」ボタンで帳簿に反映"
      ]
    }
  ];

  const troubleshooting = [
    {
      problem: "写真がうまく読み取れない",
      solution: "明るい場所で、文字がはっきり見えるように撮影してください",
      tips: [
        "蛍光灯の下など明るい場所で撮影",
        "影が入らないように注意",
        "文字が水平になるように撮影",
        "ピントを合わせてからシャッターを押す"
      ]
    },
    {
      problem: "金額が間違って読み取られる",
      solution: "「編集」ボタンを押して手動で修正できます",
      tips: [
        "読み取り結果の「編集」ボタンをクリック",
        "正しい金額を入力し直す",
        "「保存」ボタンを押して確定",
        "信頼度が低い場合は必ず確認を"
      ]
    },
    {
      problem: "どのボタンを押せばいいかわからない",
      solution: "各ボタンにマウスを合わせると説明が表示されます",
      tips: [
        "ボタンの上にマウスを置くと説明が出ます",
        "青いボタンは主要な操作",
        "灰色のボタンは補助的な操作",
        "赤いボタンは削除などの注意が必要な操作"
      ]
    }
  ];

  // 開発者連絡先への遷移
  const handleContactDeveloper = (type: 'line' | 'email') => {
    if (type === 'line') {
      // LINEの開発者アカウントに遷移
      window.open('https://line.me/ti/p/s5p2vsyaoB', '_blank');
    } else if (type === 'email') {
      // メールアプリを開く
      window.location.href = 'mailto:takahashiryouma0102@gmail.com?subject=タカハシホームシステムについて&body=お疲れ様です。%0A%0Aタカハシホームシステムについてお問い合わせいたします。%0A%0A【お問い合わせ内容】%0A%0A%0A【ご利用環境】%0A・ブラウザ：%0A・OS：%0A%0Aよろしくお願いいたします。';
    }
  };

  return (
    <div className="space-y-6">
      {/* ヘルプヘッダー */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center space-x-2 text-blue-800 text-lg sm:text-xl">
            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            <span>タカハシホームシステム 使い方ガイド</span>
          </CardTitle>
          <CardDescription className="text-blue-700 text-sm sm:text-base">
            ITが苦手な方でも安心してご利用いただけるよう、わかりやすく説明いたします
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg border flex items-center space-x-3">
              <Video className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm sm:text-base">動画マニュアル</h4>
                <p className="text-xs sm:text-sm text-gray-600">実際の操作を動画で確認</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border flex items-center space-x-3">
              <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm sm:text-base">電話サポート</h4>
                <p className="text-xs sm:text-sm text-gray-600">080-8699-7005</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border flex items-center space-x-3 sm:col-span-2 lg:col-span-1">
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm sm:text-base">メールサポート</h4>
                <p className="text-xs sm:text-sm text-gray-600 break-all">takahashiryouma0102@gmail.com</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ガイドタブ */}
      <Tabs value={activeGuide} onValueChange={setActiveGuide}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white shadow-lg">
          <TabsTrigger value="basic" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-3 sm:p-4 text-xs sm:text-sm">
            <BookOpen className="h-4 w-4" />
            <span>基本操作</span>
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-3 sm:p-4 text-xs sm:text-sm">
            <Camera className="h-4 w-4" />
            <span>書類読み取り</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-3 sm:p-4 text-xs sm:text-sm">
            <Settings className="h-4 w-4" />
            <span>機能説明</span>
          </TabsTrigger>
          <TabsTrigger value="trouble" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 p-3 sm:p-4 text-xs sm:text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>困った時は</span>
          </TabsTrigger>
        </TabsList>

        {/* 基本操作ガイド */}
        <TabsContent value="basic" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span>はじめての方へ - 基本操作</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                システムの基本的な使い方を順番に説明します
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {basicSteps.map((step, index) => (
                  <div key={index} className="border rounded-lg p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start space-x-2">
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OCRガイド */}
        <TabsContent value="ocr" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <span>書類OCR（自動読み取り）の使い方</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                領収書や請求書を写真で撮るだけで、自動で内容を読み取ります
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {ocrSteps.map((step, index) => (
                  <div key={index} className="border rounded-lg p-4 sm:p-6 hover:bg-purple-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start space-x-2">
                              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-700">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* OCR使用例 */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 mt-4 sm:mt-6">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-purple-800 text-base sm:text-lg">実際の使用例</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                        <Camera className="h-4 w-4 mr-2" />
                        撮影のコツ
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm">
                        <li>• 明るい場所で撮影する</li>
                        <li>• 領収書全体が写るように</li>
                        <li>• 文字が水平になるように</li>
                        <li>• ピントを合わせる</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        読み取れる情報
                      </h4>
                      <ul className="space-y-2 text-xs sm:text-sm">
                        <li>• 金額（税込み・税抜き）</li>
                        <li>• 日付</li>
                        <li>• 業者名・店舗名</li>
                        <li>• 商品・サービス内容</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 機能説明 */}
        <TabsContent value="features" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <span>ダッシュボード</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  物件の収支状況を一目で確認できる画面です
                </p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li>• 月間・年間の収入</li>
                  <li>• 入居率の推移</li>
                  <li>• 物件別の利回り</li>
                  <li>• 収支のグラフ表示</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span>支出管理</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  修繕費や管理費などの支出を記録・管理します
                </p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li>• 支出の登録・編集</li>
                  <li>• カテゴリ別の集計</li>
                  <li>• 月別の支出推移</li>
                  <li>• 領収書の添付</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  <span>書類OCR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  領収書や請求書を写真で撮って自動読み取り
                </p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li>• 写真・PDFの自動読み取り</li>
                  <li>• 金額・日付の抽出</li>
                  <li>• 読み取り結果の編集</li>
                  <li>• 支出データへの変換</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                  <span>レポート</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  月次・年次の収支報告書を自動作成します
                </p>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li>• 月次収支レポート</li>
                  <li>• 年次決算資料</li>
                  <li>• 確定申告用データ</li>
                  <li>• PDF・Excel出力</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* トラブルシューティング */}
        <TabsContent value="trouble" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                <span>よくある質問・困った時の対処法</span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                問題が発生した時の解決方法をご案内します
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {troubleshooting.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 sm:p-6 hover:bg-red-50 transition-colors">
                    <div className="mb-3 sm:mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        問題: {item.problem}
                      </h3>
                      <p className="text-green-700 font-medium mb-3 flex items-center text-sm sm:text-base">
                        <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        解決方法: {item.solution}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">詳しい手順:</h4>
                      <ul className="space-y-1">
                        {item.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start space-x-2">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 開発者連絡先 */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-green-800 flex items-center space-x-2 text-base sm:text-lg">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>開発者に直接相談</span>
              </CardTitle>
              <CardDescription className="text-green-700 text-sm sm:text-base">
                システムの不具合や改善要望は開発者に直接ご連絡ください
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-lg border">
                  <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                    <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-base sm:text-lg">LINE で相談</h4>
                      <p className="text-xs sm:text-sm text-gray-600">お気軽にメッセージをお送りください</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-gray-600">• 24時間受付</p>
                    <p className="text-xs sm:text-sm text-gray-600">• 返信時間: 平日12時間以内</p>
                    <p className="text-xs sm:text-sm text-gray-600">• 画面のスクリーンショットも送信可能</p>
                  </div>
                  <Button 
                    className="w-full mt-3 sm:mt-4 bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                    onClick={() => handleContactDeveloper('line')}
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <ExternalLink className="h-3 w-3 mr-1" />
                    LINE で開発者に連絡
                  </Button>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg border">
                  <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                    <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-base sm:text-lg">メールで相談</h4>
                      <p className="text-xs sm:text-sm text-gray-600">詳しい内容はメールでお送りください</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-gray-600 break-all">• takahashiryouma0102@gmail.com</p>
                    <p className="text-xs sm:text-sm text-gray-600">• 返信時間: 24時間以内</p>
                    <p className="text-xs sm:text-sm text-gray-600">• ファイル添付可能</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-3 sm:mt-4 border-blue-600 text-blue-600 hover:bg-blue-50 text-sm sm:text-base"
                    onClick={() => handleContactDeveloper('email')}
                  >
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <ExternalLink className="h-3 w-3 mr-1" />
                    メールで開発者に連絡
                  </Button>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">連絡時のお願い</h4>
                    <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
                      <li>• どの画面で問題が発生したかお教えください</li>
                      <li>• エラーメッセージがあれば、そのまま教えてください</li>
                      <li>• 可能であれば画面のスクリーンショットを添付してください</li>
                      <li>• ご利用のブラウザ（Chrome、Safari等）をお教えください</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 通常サポート連絡先 */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-blue-800 text-base sm:text-lg">タカハシホーム サポート窓口</CardTitle>
              <CardDescription className="text-blue-700 text-sm sm:text-base">
                一般的なご質問やサポートはこちらへ
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-lg border">
                  <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                    <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-base sm:text-lg">電話サポート</h4>
                      <p className="text-xs sm:text-sm text-gray-600">お急ぎの場合はお電話ください</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-lg sm:text-xl text-blue-600">080-8699-7005</p>
                  </div>
                  <Button className="w-full mt-3 sm:mt-4 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    今すぐ電話する
                  </Button>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg border">
                  <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                    <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-base sm:text-lg">メールサポート</h4>
                      <p className="text-xs sm:text-sm text-gray-600">詳しい質問はメールで</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-base sm:text-lg text-green-600 break-all">takahashiryouma0102@gmail.com</p>
                    <p className="text-xs sm:text-sm text-gray-600">返信時間: 24時間以内</p>
                    <p className="text-xs sm:text-sm text-gray-600">画面のスクリーンショットを添付していただくと、より早く解決できます</p>
                  </div>
                  <Button variant="outline" className="w-full mt-3 sm:mt-4 border-green-600 text-green-600 hover:bg-green-50 text-sm sm:text-base">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    メールを送る
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UserGuide;