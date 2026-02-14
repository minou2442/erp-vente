import type { CartItem } from "./cart";

export interface ReceiptPayload {
  id: string;
  createdAt: string;
  items: CartItem[];
  total: number;
}
