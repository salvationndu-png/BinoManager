// Global window.SuperAdmin injected by the Blade shell
declare global {
  interface Window {
    SuperAdmin: {
      csrf: string;
      admin: { id: number; name: string; email: string; lastLogin?: string; lastLoginIp?: string };
      logoutUrl: string;
      loginUrl: string;
      isAuthenticated: boolean;
    };
  }
}

export type SAPage =
  | 'dashboard' | 'tenants' | 'tenant-detail'
  | 'plans' | 'gateway' | 'email' | 'audit' | 'settings' | 'profile' | 'feedback';

export interface Tenant {
  id: number; name: string; slug: string; email: string; phone?: string;
  plan?: { id: number; name: string; price_kobo: number };
  status: 'active'|'trialing'|'grace'|'suspended'|'cancelled';
  trial_ends_at?: string; grace_ends_at?: string;
  users_count?: number; created_at: string;
  settings?: { business_name?: string; logo_path?: string };
  admin_notes?: string;
}

export interface Plan {
  id: number; name: string; slug: string;
  billing_cycle: 'monthly' | 'annual';
  price_kobo: number; max_users: number; max_products: number;
  features: string[]; is_active: boolean; is_popular: boolean; sort_order: number;
  subscribers_count?: number;
}

export interface PaymentGateway {
  id: number; name: string; slug: string; is_active: boolean;
  currency: string; config?: Record<string, any>;
  has_keys: boolean; masked_public_key?: string; masked_secret_key?: string;
}

export interface AuditEntry {
  id: number; action: string; description: string;
  super_admin?: { name: string };
  tenant?: { id: number; name: string };
  ip_address?: string; created_at: string;
  context?: Record<string, any>;
}
