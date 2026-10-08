export type Role = "admin" | "manager" | "cashier";
export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
];

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
  id: string;
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
  shop: Shop;
  userId: string;
  user: User;
  stockReference: string;
  paymentSource: string;
  dateAcquired: string;
  status: string;
  stocks: Stock[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Stock {
  id: string;
  stockRecordId: string;
  productId: number;
  product: Product;
  shopId: string;
  unitCost: number;
  quantityReceived: number;
  mfd?: string | null;
  exp?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaleRecord {
  id: string;
  shopId: string;
  shop: Shop;
  billNo: string;
  totalAmount: number;
  discount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  saleItems: SaleItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  saleRecord: SaleRecord;
  stockId: string;
  stock: Stock;
  quantity: number;
  unitPriceSold: number;
  createdAt: string;
  updatedAt: string;
}

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(
  /\/+$/,
  "",
);
const apiBaseUrl =
  configuredApiUrl && import.meta.env.PROD
    ? `${configuredApiUrl.replace(/\/api$/, "")}/api`
    : "/api";

export function apiUrl(path: string): string {
  if (import.meta.env.PROD && !configuredApiUrl) {
    throw new Error("VITE_API_URL must be set to the deployed backend URL.");
  }

  return `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(apiUrl(path), {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((data as { error?: string }).error || "Request failed");
  return data as T;
}
