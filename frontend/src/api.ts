export type Role = 'admin' | 'manager' | 'cashier';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
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
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  displayUnit: string;
  discount: number;
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