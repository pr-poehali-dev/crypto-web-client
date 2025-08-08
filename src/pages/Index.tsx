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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import Icon from '@/components/ui/icon';
import { createCryptoPayApi, CryptoPayStorage, generateSpendId, type Invoice, type Balance, type AppStats, type Transfer, type Check, type ExchangeRate } from '@/lib/cryptoPayApi';

const Index = () => {
  // Auth state
  const [apiToken, setApiToken] = useState('');
  const [isTestnet, setIsTestnet] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [appInfo, setAppInfo] = useState<any>(null);
  
  // API state
  const [api, setApi] = useState<any>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [currencies, setCurrencies] = useState<{fiat: string[], crypto: string[]}>({fiat: [], crypto: []});

  // Data state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [newInvoice, setNewInvoice] = useState({
    amount: '',
    currency_type: 'crypto' as 'crypto' | 'fiat',
    asset: 'USDT',
    fiat: 'USD',
    description: '',
    allowComments: true,
    allowAnonymous: true,
    expiresIn: ''
  });

  const [newTransfer, setNewTransfer] = useState({
    userId: '',
    amount: '',
    currency: 'USDT',
    comment: '',
    disableNotification: false
  });

  const [newCheck, setNewCheck] = useState({
    amount: '',
    currency: 'USDT',
    pinToUserId: '',
    pinToUsername: ''
  });

  // Initialize on mount
  useEffect(() => {
    const { token, isTestnet: savedTestnet } = CryptoPayStorage.getToken();
    if (token) {
      setApiToken(token);
      setIsTestnet(savedTestnet);
      initializeApi(token, savedTestnet);
    }
  }, []);

  // Initialize API
  const initializeApi = async (token: string, testnet: boolean) => {
    const cryptoApi = createCryptoPayApi({ apiToken: token, isTestnet: testnet });
    setApi(cryptoApi);
    
    try {
      setLoading(true);
      const appResponse = await cryptoApi.getMe();
      
      if (appResponse.ok && appResponse.result) {
        setAppInfo(appResponse.result);
        setIsConnected(true);
        await loadAllData(cryptoApi);
      } else {
        toast({
          title: 'Ошибка подключения',
          description: appResponse.error || 'Неверный токен',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('API initialization error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к API',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load all data
  const loadAllData = async (cryptoApi: any) => {
    const [balanceRes, statsRes, invoicesRes, transfersRes, checksRes, ratesRes, currenciesRes] = await Promise.all([
      cryptoApi.getBalance(),
      cryptoApi.getStats(),
      cryptoApi.getInvoices({ count: 50 }),
      cryptoApi.getTransfers({ count: 50 }),
      cryptoApi.getChecks({ count: 50 }),
      cryptoApi.getExchangeRates(),
      cryptoApi.getCurrencies()
    ]);

    if (balanceRes.ok) setBalances(balanceRes.result || []);
    if (statsRes.ok) setStats(statsRes.result);
    if (invoicesRes.ok) setInvoices(invoicesRes.result || []);
    if (transfersRes.ok) setTransfers(transfersRes.result || []);
    if (checksRes.ok) setChecks(checksRes.result || []);
    if (ratesRes.ok) setExchangeRates(ratesRes.result || []);
    if (currenciesRes.ok) setCurrencies(currenciesRes.result || {fiat: [], crypto: []});
  };

  // Connect to API
  const handleConnectApi = async () => {
    if (!apiToken.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите API токен',
        variant: 'destructive'
      });
      return;
    }

    CryptoPayStorage.saveToken(apiToken, isTestnet);
    await initializeApi(apiToken, isTestnet);
  };

  // Disconnect API
  const handleDisconnect = () => {
    CryptoPayStorage.clearToken();
    setIsConnected(false);
    setApi(null);
    setAppInfo(null);
    setBalances([]);
    setStats(null);
    setInvoices([]);
    setTransfers([]);
    setChecks([]);
  };

  // Create invoice
  const handleCreateInvoice = async () => {
    if (!api || !newInvoice.amount) return;

    try {
      setLoading(true);
      const params: any = {
        amount: newInvoice.amount,
        currency_type: newInvoice.currency_type,
        description: newInvoice.description,
        allow_comments: newInvoice.allowComments,
        allow_anonymous: newInvoice.allowAnonymous
      };

      if (newInvoice.currency_type === 'crypto') {
        params.asset = newInvoice.asset;
      } else {
        params.fiat = newInvoice.fiat;
      }

      if (newInvoice.expiresIn) {
        params.expires_in = parseInt(newInvoice.expiresIn);
      }

      const response = await api.createInvoice(params);
      
      if (response.ok && response.result) {
        setInvoices([response.result, ...invoices]);
        setNewInvoice({
          amount: '',
          currency_type: 'crypto',
          asset: 'USDT',
          fiat: 'USD',
          description: '',
          allowComments: true,
          allowAnonymous: true,
          expiresIn: ''
        });
        toast({
          title: 'Успех',
          description: 'Инвойс создан'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: response.error || 'Не удалось создать инвойс',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Create invoice error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create transfer
  const handleCreateTransfer = async () => {
    if (!api || !newTransfer.userId || !newTransfer.amount) return;

    try {
      setLoading(true);
      const response = await api.transfer({
        user_id: parseInt(newTransfer.userId),
        asset: newTransfer.currency,
        amount: newTransfer.amount,
        spend_id: generateSpendId(),
        comment: newTransfer.comment,
        disable_send_notification: newTransfer.disableNotification
      });
      
      if (response.ok && response.result) {
        setTransfers([response.result, ...transfers]);
        setNewTransfer({
          userId: '',
          amount: '',
          currency: 'USDT',
          comment: '',
          disableNotification: false
        });
        toast({
          title: 'Успех',
          description: 'Перевод выполнен'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: response.error || 'Не удалось выполнить перевод',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Create transfer error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create check
  const handleCreateCheck = async () => {
    if (!api || !newCheck.amount) return;

    try {
      setLoading(true);
      const params: any = {
        asset: newCheck.currency,
        amount: newCheck.amount
      };

      if (newCheck.pinToUserId) {
        params.pin_to_user_id = parseInt(newCheck.pinToUserId);
      }
      if (newCheck.pinToUsername) {
        params.pin_to_username = newCheck.pinToUsername;
      }

      const response = await api.createCheck(params);
      
      if (response.ok && response.result) {
        setChecks([response.result, ...checks]);
        setNewCheck({
          amount: '',
          currency: 'USDT',
          pinToUserId: '',
          pinToUsername: ''
        });
        toast({
          title: 'Успех',
          description: 'Чек создан'
        });
      } else {
        toast({
          title: 'Ошибка',
          description: response.error || 'Не удалось создать чек',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Create check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-crypto-green text-white';
      case 'active': return 'bg-crypto-blue text-white';
      case 'activated': return 'bg-crypto-green text-white';
      case 'expired': return 'bg-crypto-orange text-white';
      case 'completed': return 'bg-crypto-green text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'paid': return 'Оплачен';
      case 'active': return 'Активен';
      case 'activated': return 'Активирован';
      case 'expired': return 'Истёк';
      case 'completed': return 'Завершён';
      default: return status;
    }
  };

  const refreshData = async () => {
    if (api) {
      setLoading(true);
      await loadAllData(api);
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: 'Ссылка скопирована в буфер обмена'
    });
  };

  // Token setup dialog
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-crypto-gray font-inter flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-crypto-blue rounded-lg flex items-center justify-center mx-auto mb-4">
              <Icon name="Zap" size={24} className="text-white" />
            </div>
            <CardTitle className="text-2xl">CryptoPay Dashboard</CardTitle>
            <CardDescription>
              Введите API токен для подключения к CryptoPay
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="token">API Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="123456789:AAzQcZWQqQAbsfgPnOLr4FHC8Doa4L7KryC"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="testnet"
                checked={isTestnet}
                onCheckedChange={setIsTestnet}
              />
              <Label htmlFor="testnet">Использовать Testnet</Label>
            </div>
            <Alert>
              <Icon name="Info" size={16} />
              <AlertDescription>
                {isTestnet 
                  ? 'Используйте @CryptoTestnetBot для получения тестового токена'
                  : 'Используйте @CryptoBot для получения API токена'
                }
              </AlertDescription>
            </Alert>
            <Button 
              onClick={handleConnectApi} 
              className="w-full bg-crypto-blue hover:bg-crypto-navy"
              disabled={loading}
            >
              {loading ? 'Подключение...' : 'Подключиться'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Badge variant="outline" className="text-crypto-green border-crypto-green">
                {isTestnet ? 'Testnet' : 'Mainnet'} • {appInfo?.name}
              </Badge>
              <Button onClick={refreshData} variant="outline" size="sm" disabled={loading}>
                <Icon name="RefreshCw" size={16} className="mr-2" />
                Обновить
              </Button>
              <Button onClick={handleDisconnect} variant="outline" size="sm">
                <Icon name="LogOut" size={16} className="mr-2" />
                Отключить
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
              <div className="text-2xl font-bold text-crypto-navy">${stats?.volume.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">USD</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crypto-navy">Конверсия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crypto-navy">{stats?.conversion.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">Оплаченные инвойсы</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crypto-navy">Уник. пользователи</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crypto-navy">{stats?.unique_users_count.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Всего пользователей</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crypto-navy">Создано инвойсов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crypto-navy">{stats?.created_invoice_count.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Всего создано</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-crypto-navy">Оплачено инвойсов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crypto-navy">{stats?.paid_invoice_count.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Успешно оплачены</p>
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
              {balances.length > 0 ? balances.map((balance) => (
                <div key={balance.currency_code} className="bg-gradient-to-br from-crypto-blue to-crypto-navy rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold">{balance.currency_code}</span>
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
              )) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Нет данных о балансе
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="invoices" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="invoices" className="flex items-center space-x-2">
              <Icon name="Receipt" size={16} />
              <span>Инвойсы ({invoices.length})</span>
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center space-x-2">
              <Icon name="ArrowRightLeft" size={16} />
              <span>Переводы ({transfers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="checks" className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} />
              <span>Чеки ({checks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Icon name="BarChart3" size={16} />
              <span>Курсы валют</span>
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
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Создать новый инвойс</DialogTitle>
                    <DialogDescription>Заполните данные для создания инвойса</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Тип валюты</Label>
                        <Select 
                          value={newInvoice.currency_type} 
                          onValueChange={(value: 'crypto' | 'fiat') => setNewInvoice({...newInvoice, currency_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="crypto">Криптовалюта</SelectItem>
                            <SelectItem value="fiat">Фиатная валюта</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Валюта</Label>
                        {newInvoice.currency_type === 'crypto' ? (
                          <Select value={newInvoice.asset} onValueChange={(value) => setNewInvoice({...newInvoice, asset: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.crypto.length > 0 ? currencies.crypto.map(currency => (
                                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                              )) : ['USDT', 'TON', 'BTC', 'ETH', 'LTC', 'BNB', 'TRX', 'USDC'].map(currency => (
                                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Select value={newInvoice.fiat} onValueChange={(value) => setNewInvoice({...newInvoice, fiat: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {currencies.fiat.length > 0 ? currencies.fiat.map(currency => (
                                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                              )) : ['USD', 'EUR', 'RUB'].map(currency => (
                                <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Сумма</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="100.00"
                        value={newInvoice.amount}
                        onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Описание</Label>
                      <Textarea
                        placeholder="Описание для инвойса..."
                        value={newInvoice.description}
                        onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Срок действия (секунды)</Label>
                      <Input
                        type="number"
                        placeholder="3600 (1 час)"
                        value={newInvoice.expiresIn}
                        onChange={(e) => setNewInvoice({...newInvoice, expiresIn: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="comments"
                        checked={newInvoice.allowComments}
                        onCheckedChange={(checked) => setNewInvoice({...newInvoice, allowComments: checked})}
                      />
                      <Label htmlFor="comments">Разрешить комментарии</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="anonymous"
                        checked={newInvoice.allowAnonymous}
                        onCheckedChange={(checked) => setNewInvoice({...newInvoice, allowAnonymous: checked})}
                      />
                      <Label htmlFor="anonymous">Анонимная оплата</Label>
                    </div>
                    <Button onClick={handleCreateInvoice} className="w-full bg-crypto-blue hover:bg-crypto-navy" disabled={loading}>
                      {loading ? 'Создание...' : 'Создать инвойс'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {invoices.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <div key={invoice.invoice_id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-semibold text-crypto-navy">#{invoice.invoice_id}</span>
                                <Badge className={getStatusColor(invoice.status)}>
                                  {getStatusText(invoice.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{invoice.description}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(invoice.bot_invoice_url)}
                                >
                                  <Icon name="Copy" size={14} className="mr-1" />
                                  Bot URL
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(invoice.web_app_invoice_url)}
                                >
                                  <Icon name="Copy" size={14} className="mr-1" />
                                  Web URL
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-crypto-navy">
                              {invoice.amount} {invoice.asset || invoice.fiat}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Создан: {formatDate(invoice.created_at)}
                            </p>
                            {invoice.paid_at && (
                              <p className="text-xs text-crypto-green">
                                Оплачен: {formatDate(invoice.paid_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Icon name="Receipt" size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-crypto-navy mb-2">Нет инвойсов</h3>
                    <p className="text-muted-foreground">Создайте первый инвойс для отображения здесь</p>
                  </div>
                )}
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
                    <DialogDescription>Отправка средств пользователю Telegram</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>ID пользователя Telegram</Label>
                      <Input
                        type="number"
                        placeholder="123456789"
                        value={newTransfer.userId}
                        onChange={(e) => setNewTransfer({...newTransfer, userId: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Сумма</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="50.00"
                          value={newTransfer.amount}
                          onChange={(e) => setNewTransfer({...newTransfer, amount: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Валюта</Label>
                        <Select value={newTransfer.currency} onValueChange={(value) => setNewTransfer({...newTransfer, currency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.crypto.length > 0 ? currencies.crypto.map(currency => (
                              <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                            )) : ['USDT', 'TON', 'BTC', 'ETH'].map(currency => (
                              <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Комментарий</Label>
                      <Textarea
                        placeholder="Комментарий к переводу..."
                        value={newTransfer.comment}
                        onChange={(e) => setNewTransfer({...newTransfer, comment: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="disable-notif"
                        checked={newTransfer.disableNotification}
                        onCheckedChange={(checked) => setNewTransfer({...newTransfer, disableNotification: checked})}
                      />
                      <Label htmlFor="disable-notif">Отключить уведомления</Label>
                    </div>
                    <Button onClick={handleCreateTransfer} className="w-full bg-crypto-blue hover:bg-crypto-navy" disabled={loading}>
                      {loading ? 'Отправка...' : 'Отправить перевод'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {transfers.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {transfers.map((transfer) => (
                      <div key={transfer.transfer_id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-crypto-navy">#{transfer.transfer_id}</span>
                              <Badge className={getStatusColor(transfer.status)}>
                                {getStatusText(transfer.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Пользователь: {transfer.user_id}
                            </p>
                            {transfer.comment && (
                              <p className="text-sm text-muted-foreground">
                                Комментарий: {transfer.comment}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-crypto-navy">
                              {transfer.amount} {transfer.asset}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transfer.completed_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Icon name="ArrowRightLeft" size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-crypto-navy mb-2">Переводы не найдены</h3>
                    <p className="text-muted-foreground">Создайте первый перевод для отображения истории</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checks Tab */}
          <TabsContent value="checks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-crypto-navy">Чеки</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-crypto-blue hover:bg-crypto-navy">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать чек
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Создать чек</DialogTitle>
                    <DialogDescription>Создание чека для отправки средств</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Сумма</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="100.00"
                          value={newCheck.amount}
                          onChange={(e) => setNewCheck({...newCheck, amount: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Валюта</Label>
                        <Select value={newCheck.currency} onValueChange={(value) => setNewCheck({...newCheck, currency: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.crypto.length > 0 ? currencies.crypto.map(currency => (
                              <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                            )) : ['USDT', 'TON', 'BTC', 'ETH'].map(currency => (
                              <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Привязать к пользователю (ID)</Label>
                      <Input
                        type="number"
                        placeholder="123456789 (необязательно)"
                        value={newCheck.pinToUserId}
                        onChange={(e) => setNewCheck({...newCheck, pinToUserId: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Привязать к username</Label>
                      <Input
                        placeholder="@username (необязательно)"
                        value={newCheck.pinToUsername}
                        onChange={(e) => setNewCheck({...newCheck, pinToUsername: e.target.value})}
                      />
                    </div>
                    <Button onClick={handleCreateCheck} className="w-full bg-crypto-blue hover:bg-crypto-navy" disabled={loading}>
                      {loading ? 'Создание...' : 'Создать чек'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {checks.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {checks.map((check) => (
                      <div key={check.check_id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-semibold text-crypto-navy">#{check.check_id}</span>
                              <Badge className={getStatusColor(check.status)}>
                                {getStatusText(check.status)}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(check.bot_check_url)}
                            >
                              <Icon name="Copy" size={14} className="mr-1" />
                              Скопировать ссылку
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-crypto-navy">
                              {check.amount} {check.asset}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Создан: {formatDate(check.created_at)}
                            </p>
                            {check.activated_at && (
                              <p className="text-xs text-crypto-green">
                                Активирован: {formatDate(check.activated_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <Icon name="CheckCircle" size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-crypto-navy mb-2">Чеки не созданы</h3>
                    <p className="text-muted-foreground">Создавайте чеки для быстрой отправки средств</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exchange Rates Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-crypto-navy">Курсы валют</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="DollarSign" size={20} />
                    <span>Курсы криптовалют</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {exchangeRates.filter(rate => rate.is_crypto).map((rate) => (
                      <div key={`${rate.source}-${rate.target}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-crypto-blue rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {rate.source.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{rate.source}</p>
                            <p className="text-xs text-muted-foreground">to {rate.target}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-crypto-navy">{parseFloat(rate.rate).toLocaleString()}</p>
                          <div className="flex items-center space-x-1">
                            {rate.is_valid ? (
                              <Icon name="CheckCircle" size={12} className="text-crypto-green" />
                            ) : (
                              <Icon name="AlertCircle" size={12} className="text-crypto-orange" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {rate.is_valid ? 'Актуальный' : 'Устарел'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-500">
                        Нет данных о курсах валют
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Globe" size={20} />
                    <span>Поддерживаемые валюты</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Криптовалюты</h4>
                      <div className="flex flex-wrap gap-2">
                        {currencies.crypto.length > 0 ? currencies.crypto.map((currency) => (
                          <Badge key={currency} variant="outline">
                            {currency}
                          </Badge>
                        )) : ['USDT', 'TON', 'BTC', 'ETH', 'LTC', 'BNB', 'TRX', 'USDC'].map((currency) => (
                          <Badge key={currency} variant="outline">
                            {currency}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Фиатные валюты</h4>
                      <div className="flex flex-wrap gap-2">
                        {currencies.fiat.length > 0 ? currencies.fiat.map((currency) => (
                          <Badge key={currency} variant="secondary">
                            {currency}
                          </Badge>
                        )) : ['USD', 'EUR', 'RUB', 'CNY', 'GBP'].map((currency) => (
                          <Badge key={currency} variant="secondary">
                            {currency}
                          </Badge>
                        ))}
                      </div>
                    </div>
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