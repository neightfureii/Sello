export type Role = 'admin' | 'manager' | 'cashier';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  price: string;
  stockQty: number;
  reorderLevel: number;
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