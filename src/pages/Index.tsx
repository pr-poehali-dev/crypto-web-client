import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [apiToken, setApiToken] = useState('');
  const [balances, setBalances] = useState([
    { currency: 'USDT', available: '15,234.50', onhold: '1,200.00' },
    { currency: 'TON', available: '8,567.20', onhold: '0.00' },
    { currency: 'BTC', available: '0.45678', onhold: '0.00' },
    { currency: 'ETH', available: '12.3456', onhold: '0.50' },
  ]);
  
  const [stats, setStats] = useState({
    volume: '1,234,567',
    conversion: 85.4,
    uniqueUsers: 15432,
    createdInvoices: 9876,
    paidInvoices: 8430,
  });

  const [invoices, setInvoices] = useState([
    {
      id: 12345,
      amount: '100.00',
      currency: 'USDT',
      status: 'paid',
      description: 'Покупка товара #1234',
      createdAt: '2024-08-08T10:30:00Z',
      paidAt: '2024-08-08T10:35:00Z'
    },
    {
      id: 12346,
      amount: '250.00', 
      currency: 'TON',
      status: 'active',
      description: 'Подписка на месяц',
      createdAt: '2024-08-08T09:15:00Z'
    },
    {
      id: 12347,
      amount: '75.50',
      currency: 'ETH',
      status: 'expired',
      description: 'Услуга консультации',
      createdAt: '2024-08-07T16:20:00Z'
    }
  ]);

  const [newInvoice, setNewInvoice] = useState({
    amount: '',
    currency: 'USDT',
    description: '',
    allowComments: true,
    allowAnonymous: true
  });

  const [newTransfer, setNewTransfer] = useState({
    userId: '',
    amount: '',
    currency: 'USDT',
    comment: ''
  });

  const handleCreateInvoice = () => {
    const invoice = {
      id: Date.now(),
      amount: newInvoice.amount,
      currency: newInvoice.currency,
      status: 'active',
      description: newInvoice.description,
      createdAt: new Date().toISOString()
    };
    setInvoices([invoice, ...invoices]);
    setNewInvoice({ amount: '', currency: 'USDT', description: '', allowComments: true, allowAnonymous: true });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-crypto-green text-white';
      case 'active': return 'bg-crypto-blue text-white';
      case 'expired': return 'bg-crypto-orange text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'paid': return 'Оплачен';
      case 'active': return 'Активен';
      case 'expired': return 'Истёк';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-crypto-gray font-inter">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-crypto-blue rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={20} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-crypto-navy">CryptoPay Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-crypto-blue border-crypto-blue">
                API Connected
              </Badge>
              <Button variant="outline" size="sm">
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-fade-in">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crypto-navy">Объём платежей</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crypto-navy">${stats.volume}</div>
              <p className="text-xs text-muted-foreground">+12.5% за месяц</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crypto-navy">Конверсия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crypto-navy">{stats.conversion}%</div>
              <p className="text-xs text-muted-foreground">+2.1% за неделю</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crypto-navy">Уник. пользователи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crypto-navy">{stats.uniqueUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+5.7% за месяц</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crypto-navy">Создано инвойсов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crypto-navy">{stats.createdInvoices.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8.3% за неделю</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crypto-navy">Оплачено инвойсов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crypto-navy">{stats.paidInvoices.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Конверсия: {((stats.paidInvoices / stats.createdInvoices) * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Balances */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Wallet" size={20} />
              <span>Баланс кошелька</span>
            </CardTitle>
            <CardDescription>Текущие балансы по всем валютам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {balances.map((balance) => (
                <div key={balance.currency} className="bg-gradient-to-br from-crypto-blue to-crypto-navy rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold">{balance.currency}</span>
                    <Icon name="TrendingUp" size={16} />
                  </div>
                  <div className="space-y-1">
                    <div>
                      <p className="text-xs opacity-80">Доступно</p>
                      <p className="text-xl font-bold">{balance.available}</p>
                    </div>
                    {parseFloat(balance.onhold) > 0 && (
                      <div>
                        <p className="text-xs opacity-80">В холде</p>
                        <p className="text-sm">{balance.onhold}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="invoices" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="invoices" className="flex items-center space-x-2">
              <Icon name="Receipt" size={16} />
              <span>Инвойсы</span>
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center space-x-2">
              <Icon name="ArrowRightLeft" size={16} />
              <span>Переводы</span>
            </TabsTrigger>
            <TabsTrigger value="checks" className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} />
              <span>Чеки</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Icon name="BarChart3" size={16} />
              <span>Аналитика</span>
            </TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-crypto-navy">Управление инвойсами</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-crypto-blue hover:bg-crypto-navy">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать инвойс
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Создать новый инвойс</DialogTitle>
                    <DialogDescription>Заполните данные для создания инвойса</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Сумма</label>
                      <Input
                        type="number"
                        placeholder="100.00"
                        value={newInvoice.amount}
                        onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Валюта</label>
                      <Select value={newInvoice.currency} onValueChange={(value) => setNewInvoice({...newInvoice, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="TON">TON</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Описание</label>
                      <Textarea
                        placeholder="Описание для инвойса..."
                        value={newInvoice.description}
                        onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="comments"
                        checked={newInvoice.allowComments}
                        onCheckedChange={(checked) => setNewInvoice({...newInvoice, allowComments: checked})}
                      />
                      <label htmlFor="comments" className="text-sm font-medium">Разрешить комментарии</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="anonymous"
                        checked={newInvoice.allowAnonymous}
                        onCheckedChange={(checked) => setNewInvoice({...newInvoice, allowAnonymous: checked})}
                      />
                      <label htmlFor="anonymous" className="text-sm font-medium">Анонимная оплата</label>
                    </div>
                    <Button onClick={handleCreateInvoice} className="w-full bg-crypto-blue hover:bg-crypto-navy">
                      Создать инвойс
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-crypto-navy">#{invoice.id}</span>
                              <Badge className={getStatusColor(invoice.status)}>
                                {getStatusText(invoice.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{invoice.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-crypto-navy">
                            {invoice.amount} {invoice.currency}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Создан: {formatDate(invoice.createdAt)}
                          </p>
                          {invoice.paidAt && (
                            <p className="text-xs text-crypto-green">
                              Оплачен: {formatDate(invoice.paidAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-crypto-navy">Переводы</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-crypto-blue hover:bg-crypto-navy">
                    <Icon name="Send" size={16} className="mr-2" />
                    Новый перевод
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Создать перевод</DialogTitle>
                    <DialogDescription>Отправка средств пользователю</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">ID пользователя</label>
                      <Input
                        placeholder="123456789"
                        value={newTransfer.userId}
                        onChange={(e) => setNewTransfer({...newTransfer, userId: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Сумма</label>
                      <Input
                        type="number"
                        placeholder="50.00"
                        value={newTransfer.amount}
                        onChange={(e) => setNewTransfer({...newTransfer, amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Валюта</label>
                      <Select value={newTransfer.currency} onValueChange={(value) => setNewTransfer({...newTransfer, currency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDT">USDT</SelectItem>
                          <SelectItem value="TON">TON</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Комментарий</label>
                      <Textarea
                        placeholder="Комментарий к переводу..."
                        value={newTransfer.comment}
                        onChange={(e) => setNewTransfer({...newTransfer, comment: e.target.value})}
                      />
                    </div>
                    <Button className="w-full bg-crypto-blue hover:bg-crypto-navy">
                      Отправить перевод
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Icon name="ArrowRightLeft" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-crypto-navy mb-2">Пока переводов нет</h3>
                  <p className="text-muted-foreground mb-4">Создайте первый перевод для отображения истории</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Создать перевод</Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checks Tab */}
          <TabsContent value="checks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-crypto-navy">Чеки</h2>
              <Button className="bg-crypto-blue hover:bg-crypto-navy">
                <Icon name="Plus" size={16} className="mr-2" />
                Создать чек
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Icon name="CheckCircle" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-crypto-navy mb-2">Чеки не созданы</h3>
                  <p className="text-muted-foreground mb-4">Создавайте чеки для быстрой отправки средств</p>
                  <Button variant="outline">Создать первый чек</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-crypto-navy">Аналитика и статистика</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="TrendingUp" size={20} />
                    <span>График доходов</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {[65, 85, 45, 92, 78, 88, 95].map((height, i) => (
                      <div key={i} className="flex flex-col items-center space-y-2">
                        <div 
                          className="w-8 bg-gradient-to-t from-crypto-blue to-crypto-green rounded-t transition-all hover:opacity-80"
                          style={{height: `${height}%`}}
                        />
                        <span className="text-xs text-muted-foreground">
                          {new Date(Date.now() - (6-i) * 24 * 60 * 60 * 1000).getDate()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="PieChart" size={20} />
                    <span>Распределение валют</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { currency: 'USDT', percentage: 45, color: 'bg-crypto-blue' },
                      { currency: 'TON', percentage: 30, color: 'bg-crypto-green' },
                      { currency: 'ETH', percentage: 15, color: 'bg-crypto-orange' },
                      { currency: 'BTC', percentage: 10, color: 'bg-crypto-red' }
                    ].map((item) => (
                      <div key={item.currency} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{item.currency}</span>
                            <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${item.color}`}
                              style={{width: `${item.percentage}%`}}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;