export type Role = "ADMIN" | "MANAGER" | "CASHIER" | "STOREKEEPER";
export type Locale = "ar" | "fr" | "en";

export interface ProductSummary {
  id: string;
  sku: string;
  barcode: string;
  nameAr: string;
  stockQty: number;
  salePrice: number;
}

export interface SaleCreateInput {
  paymentMethod: "CASH" | "CARD" | "TRANSFER" | "MIXED";
  paidAmount?: number;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}
