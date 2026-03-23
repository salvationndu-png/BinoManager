export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  barcode?: string;
}

export interface Sale {
  id: string;
  date: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  customer: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'inactive';
  avatar: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  creditLimit: number;
  outstandingBalance: number;
  status: 'active' | 'blocked';
}

export type Page = 
  | 'dashboard' 
  | 'products' 
  | 'sales' 
  | 'reports' 
  | 'analytics' 
  | 'customers'
  | 'users' 
  | 'team' 
  | 'billing' 
  | 'profile'
  | 'settings';
