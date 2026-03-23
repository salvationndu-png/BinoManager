export interface BinoUser {
  name: string;
  email: string;
  isAdmin: boolean;
  avatar?: string;
}

export interface BinoTenant {
  name: string;
  slug: string;
  plan: string;
  planSlug: string;
  status: string;
  logoUrl?: string;
  trialDaysLeft?: number;
  trialEndsAt?: string | null;
}

declare global {
  interface Window {
    BinoManager: {
      user: BinoUser;
      tenant: BinoTenant;
      csrf: string;
      tenantSlug: string;
      isLocal: boolean;
      logoutUrl: string;
      planFeatures: string[];
      settings: {
        business_name: string;
        phone: string;
        address: string;
        receipt_footer: string;
        timezone: string;
        logo_path: string;
        primary_color: string;
        secondary_color: string;
      };
    };
  }
}

export type Page =
  | 'dashboard' | 'inventory' | 'sales'
  | 'analytics' | 'reports' | 'financials' | 'customers'
  | 'team' | 'billing' | 'settings' | 'profile' | 'support';

export interface Product {
  id: number;
  name: string;
  quantity: number;
  price?: number;
  cost_price?: number;
  barcode?: string | null;
  latestStock?: { price: number; cost_price?: number };
}

export interface StockEntry {
  id: number;
  product_id: number;
  product?: { id: number; name: string };
  quantity: number;
  price: number;
  cost_price?: number;
  date?: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  business_name?: string;
  credit_limit: number;
  outstanding_balance: number;
  status?: string;
}
