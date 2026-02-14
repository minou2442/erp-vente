"use client";

import type { CartItem } from "../app/pos/cart";

interface CartSidebarProps {
  items: CartItem[];
  total: number;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  disabled: boolean;
}

export default function CartSidebar({ items, total, onRemove, onCheckout, disabled }: CartSidebarProps) {
  return (
    <aside className="pos-panel">
      <h2>Cart</h2>
      <div className="cart-list">
        {items.length === 0 ? (
          <p>No items in cart.</p>
        ) : (
          items.map((item) => (
            <article className="cart-item" key={item.productId}>
              <strong>{item.name}</strong>
              <span>
                {item.quantity} x {item.unitPrice} = {item.quantity * item.unitPrice}
              </span>
              <button className="btn-danger" onClick={() => onRemove(item.productId)} type="button">
                Remove
              </button>
            </article>
          ))
        )}
      </div>
      <h3>Total: {total.toFixed(2)}</h3>
      <button className="btn-primary" disabled={disabled} onClick={onCheckout} type="button">
        Checkout
      </button>
    </aside>
  );
}
