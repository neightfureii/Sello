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