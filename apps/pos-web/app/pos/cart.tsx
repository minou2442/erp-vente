export interface CartItem {
  productId: string;
  name: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
}

export function computeCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}
