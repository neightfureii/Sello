export type Role = 'admin' | 'manager' | 'cashier';

export interface Shop {
  id: string;
  name: string;
  location: string;
  type: string;
  imageUrl?: string;
  imageCldPubId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  shopId: string;
  shop: Shop;
  imageUrl: string;
  imageCldPubId: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  shopId: string;
  shop: Shop;
  noOfProducts?: number;
}

export interface Product {
  id: number;
  name: string;
  unitPrice: number;
  unit: string;
  minStockAllowed: number;
  imageUrl?: string;
  categoryId: string;
  category?: Category;
  shopId: string;
  shop: Shop;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  displayUnit: string;
  discount: number;
}

export interface StockCartItem {
  id: string;
  product: Product;
  quantity: number;
  displayUnit: string;
  discount: number;
  unitCost: number;
}

export interface StockRecord {
  id: string;
  shopId: string;
  stockReference: string;
  paymentSource: string;
  dateAcquired: string;
  status: string;
  stockEntries: Stock[];
}

export interface Stock {
  id: string;
  stockRecordId: string;
  productId: number;
  shopId: string;
  unitCost: number;
  quantityReceived: number;
  mfd?: string | null;
  exp?: string | null;
}

export async function api<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Request failed');
  return data as T;
}