// CryptoPay API Client
export interface CryptoPayConfig {
  apiToken: string;
  isTestnet?: boolean;
}

export interface CryptoPayResponse<T = any> {
  ok: boolean;
  result?: T;
  error?: string;
}

export interface Invoice {
  invoice_id: number;
  hash: string;
  currency_type: string;
  asset?: string;
  fiat?: string;
  amount: string;
  paid_asset?: string;
  paid_amount?: string;
  paid_fiat_rate?: string;
  accepted_assets?: string;
  fee_asset?: string;
  fee_amount?: number;
  bot_invoice_url: string;
  mini_app_invoice_url: string;
  web_app_invoice_url: string;
  description?: string;
  status: 'active' | 'paid' | 'expired';
  swap_to?: string;
  is_swapped?: boolean;
  swapped_uid?: string;
  swapped_to?: string;
  swapped_rate?: string;
  swapped_output?: string;
  swapped_usd_amount?: string;
  swapped_usd_rate?: string;
  created_at: string;
  paid_usd_rate?: string;
  allow_comments: boolean;
  allow_anonymous: boolean;
  expiration_date?: string;
  paid_at?: string;
  paid_anonymously?: boolean;
  comment?: string;
  hidden_message?: string;
  payload?: string;
  paid_btn_name?: string;
  paid_btn_url?: string;
}

export interface Transfer {
  transfer_id: number;
  spend_id: string;
  user_id: string;
  asset: string;
  amount: string;
  status: 'completed';
  completed_at: string;
  comment?: string;
}

export interface Check {
  check_id: number;
  hash: string;
  asset: string;
  amount: string;
  bot_check_url: string;
  status: 'active' | 'activated';
  created_at: string;
  activated_at?: string;
}

export interface Balance {
  currency_code: string;
  available: string;
  onhold: string;
}

export interface ExchangeRate {
  is_valid: boolean;
  is_crypto: boolean;
  is_fiat: boolean;
  source: string;
  target: string;
  rate: string;
}

export interface AppStats {
  volume: number;
  conversion: number;
  unique_users_count: number;
  created_invoice_count: number;
  paid_invoice_count: number;
  start_at: string;
  end_at: string;
}

export interface AppInfo {
  app_id: number;
  name: string;
  payment_processing_bot_username: string;
}

export interface CreateInvoiceParams {
  currency_type?: 'crypto' | 'fiat';
  asset?: string;
  fiat?: string;
  accepted_assets?: string;
  amount: string;
  swap_to?: string;
  description?: string;
  hidden_message?: string;
  paid_btn_name?: 'viewItem' | 'openChannel' | 'openBot' | 'callback';
  paid_btn_url?: string;
  payload?: string;
  allow_comments?: boolean;
  allow_anonymous?: boolean;
  expires_in?: number;
}

export interface CreateCheckParams {
  asset: string;
  amount: string;
  pin_to_user_id?: number;
  pin_to_username?: string;
}

export interface TransferParams {
  user_id: number;
  asset: string;
  amount: string;
  spend_id: string;
  comment?: string;
  disable_send_notification?: boolean;
}

export interface GetInvoicesParams {
  asset?: string;
  fiat?: string;
  invoice_ids?: string;
  status?: 'active' | 'paid';
  offset?: number;
  count?: number;
}

export interface GetTransfersParams {
  asset?: string;
  transfer_ids?: string;
  spend_id?: string;
  offset?: number;
  count?: number;
}

export interface GetChecksParams {
  asset?: string;
  check_ids?: string;
  status?: 'active' | 'activated';
  offset?: number;
  count?: number;
}

export interface GetStatsParams {
  start_at?: string;
  end_at?: string;
}

class CryptoPayApi {
  private config: CryptoPayConfig;
  private baseUrl: string;

  constructor(config: CryptoPayConfig) {
    this.config = config;
    this.baseUrl = config.isTestnet 
      ? 'https://testnet-pay.crypt.bot/api'
      : 'https://pay.crypt.bot/api';
  }

  private async request<T>(
    method: string, 
    params?: Record<string, any>
  ): Promise<CryptoPayResponse<T>> {
    const url = `${this.baseUrl}/${method}`;
    
    const headers: Record<string, string> = {
      'Crypto-Pay-API-Token': this.config.apiToken,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method: 'POST',
      headers,
    };

    if (params) {
      options.body = JSON.stringify(params);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return data as CryptoPayResponse<T>;
    } catch (error) {
      console.error('CryptoPay API Error:', error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get app info
  async getMe(): Promise<CryptoPayResponse<AppInfo>> {
    return this.request<AppInfo>('getMe');
  }

  // Invoice methods
  async createInvoice(params: CreateInvoiceParams): Promise<CryptoPayResponse<Invoice>> {
    return this.request<Invoice>('createInvoice', params);
  }

  async deleteInvoice(invoiceId: number): Promise<CryptoPayResponse<boolean>> {
    return this.request<boolean>('deleteInvoice', { invoice_id: invoiceId });
  }

  async getInvoices(params?: GetInvoicesParams): Promise<CryptoPayResponse<Invoice[]>> {
    return this.request<Invoice[]>('getInvoices', params);
  }

  // Check methods
  async createCheck(params: CreateCheckParams): Promise<CryptoPayResponse<Check>> {
    return this.request<Check>('createCheck', params);
  }

  async deleteCheck(checkId: number): Promise<CryptoPayResponse<boolean>> {
    return this.request<boolean>('deleteCheck', { check_id: checkId });
  }

  async getChecks(params?: GetChecksParams): Promise<CryptoPayResponse<Check[]>> {
    return this.request<Check[]>('getChecks', params);
  }

  // Transfer methods
  async transfer(params: TransferParams): Promise<CryptoPayResponse<Transfer>> {
    return this.request<Transfer>('transfer', params);
  }

  async getTransfers(params?: GetTransfersParams): Promise<CryptoPayResponse<Transfer[]>> {
    return this.request<Transfer[]>('getTransfers', params);
  }

  // Balance and rates
  async getBalance(): Promise<CryptoPayResponse<Balance[]>> {
    return this.request<Balance[]>('getBalance');
  }

  async getExchangeRates(): Promise<CryptoPayResponse<ExchangeRate[]>> {
    return this.request<ExchangeRate[]>('getExchangeRates');
  }

  async getCurrencies(): Promise<CryptoPayResponse<{fiat: string[], crypto: string[]}>> {
    return this.request<{fiat: string[], crypto: string[]}>('getCurrencies');
  }

  // Stats
  async getStats(params?: GetStatsParams): Promise<CryptoPayResponse<AppStats>> {
    return this.request<AppStats>('getStats', params);
  }
}

// Storage utilities
export class CryptoPayStorage {
  private static readonly TOKEN_KEY = 'cryptopay_token';
  private static readonly TESTNET_KEY = 'cryptopay_testnet';

  static saveToken(token: string, isTestnet: boolean = false): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.TESTNET_KEY, isTestnet.toString());
  }

  static getToken(): { token: string | null; isTestnet: boolean } {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const isTestnet = localStorage.getItem(this.TESTNET_KEY) === 'true';
    return { token, isTestnet };
  }

  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TESTNET_KEY);
  }

  static hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}

// Create API instance
export const createCryptoPayApi = (config: CryptoPayConfig) => {
  return new CryptoPayApi(config);
};

// Generate unique spend_id for transfers
export const generateSpendId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

export default CryptoPayApi;