export const Payment_Method = {
  cash: "cash",
  card: "card",
  bank_transfer: "bank_transfer",
} as const;

export type PaymentMethodType = typeof Payment_Method[keyof typeof Payment_Method];

export const PAYMENT_METHOD_DETAILS = [
  { value: Payment_Method.cash, label: "Cash" },
  { value: Payment_Method.card, label: "Card" },
  { value: Payment_Method.bank_transfer, label: "Bank Transfer" },
] as const;

export const Shop_Type = {
  meat: "meat",
  electronics: "electronics",
  retail: "retail",
} as const;

export type ShopType = typeof Shop_Type[keyof typeof Shop_Type];

export const SHOP_TYPE_DETAILS = [
  { value: Shop_Type.meat, label: "Meat" },
  { value: Shop_Type.electronics, label: "Electronics" },
  { value: Shop_Type.retail, label: "Retail" },
] as const;