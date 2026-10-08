export const Payment_Method = {
  cash: "cash",
  card: "card",
  bank_transfer: "bank_transfer",
} as const;

export type PaymentMethodType =
  (typeof Payment_Method)[keyof typeof Payment_Method];

export const PAYMENT_METHOD_DETAILS = [
  { value: Payment_Method.cash, label: "Cash" },
  { value: Payment_Method.card, label: "Card" },
  { value: Payment_Method.bank_transfer, label: "Bank Transfer" },
] as const;

export const Shop_Type = {
  meat: "meat",
  retail: "retail",
  food: "food",
  books: "books",
  pet_supplies: "pet_supplies",
  office_supplies: "office_supplies",
  grocery: "grocery",
  hardware: "hardware",
} as const;

export type ShopType = (typeof Shop_Type)[keyof typeof Shop_Type];

export const SHOP_TYPE_DETAILS = [
  { value: Shop_Type.meat, label: "Meat" },
  { value: Shop_Type.retail, label: "Retail" },
  { value: Shop_Type.food, label: "Food" },
  { value: Shop_Type.books, label: "Books" },
  { value: Shop_Type.pet_supplies, label: "Pet Supplies" },
  { value: Shop_Type.office_supplies, label: "Office Supplies" },
  { value: Shop_Type.grocery, label: "Grocery" },
  { value: Shop_Type.hardware, label: "Hardware" },
] as const;
