"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BarcodeInput from "../../components/barcode-input";
import CartSidebar from "../../components/cart-sidebar";
import PaymentModal from "../../components/payment-modal";
import ProductGrid from "../../components/product-grid";
import ReceiptPrint from "../../components/receipt-print";
import { clearPosSession, getPosToken, getPosUser } from "../../lib/auth";
import { posApi } from "../../lib/pos-api";
import { queuePendingSale } from "../../lib/offline-sync";
import type { CartItem } from "./cart";
import { computeCartTotal } from "./cart";
import type { PaymentMethod } from "./payment";
import type { ReceiptPayload } from "./receipt";

interface ProductItem {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  barcode: string;
  stockQty: number;
  salePrice: number;
}

interface CreatedSale {
  id: string;
  createdAt: string;
}

export default function PosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<ReceiptPayload | null>(null);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    if (!getPosToken()) {
      router.replace("/login");
      return;
    }

    let active = true;
    posApi<ProductItem[]>("/api/products")
      .then((rows) => {
        if (!active) {
          return;
        }

        setProducts(rows);
        setStatus("");
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setStatus(error instanceof Error ? error.message : "Failed to load products");
      });

    return () => {
      active = false;
    };
  }, [router]);

  function addByProduct(product: ProductItem) {
    setCart((previous) => {
      const existing = previous.find((line) => line.productId === product.id);
      if (existing) {
        return previous.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }

      return [
        ...previous,
        {
          productId: product.id,
          name: product.nameAr,
          barcode: product.barcode,
          quantity: 1,
          unitPrice: product.salePrice
        }
      ];
    });
  }

  function addByProductId(productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    addByProduct(product);
  }

  async function onScan(barcode: string) {
    const local = products.find((item) => item.barcode === barcode);
    if (local) {
      addByProduct(local);
      return;
    }

    try {
      const product = await posApi<ProductItem>(`/api/products/barcode/${encodeURIComponent(barcode)}`);
      addByProduct(product);
      setStatus(`Scanned: ${barcode}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `No product for barcode ${barcode}`);
    }
  }

  function removeFromCart(productId: string) {
    setCart((previous) => previous.filter((line) => line.productId !== productId));
  }

  const total = useMemo(() => computeCartTotal(cart), [cart]);

  async function submitSale(paymentMethod: PaymentMethod, paidAmount: number) {
    const payload = {
      paymentMethod,
      paidAmount,
      items: cart.map((line) => ({ productId: line.productId, quantity: line.quantity }))
    };

    try {
      const result = await posApi<CreatedSale>("/api/sales", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setLastReceipt({
        id: result.id,
        createdAt: result.createdAt,
        items: cart,
        total
      });
      setCart([]);
      setPaymentOpen(false);
      setStatus("Sale completed");
    } catch {
      queuePendingSale({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        payload
      });
      setLastReceipt({
        id: "OFFLINE-PENDING",
        createdAt: new Date().toISOString(),
        items: cart,
        total
      });
      setCart([]);
      setPaymentOpen(false);
      setStatus("Network issue. Sale queued offline.");
    }
  }

  const user = getPosUser();

  return (
    <div className="pos-layout">
      <div className="pos-header">
        <h1>{user?.organization?.name ? `${user.organization.name} POS` : "TREXBYTE POS"}</h1>
        <button
          type="button"
          onClick={() => {
            clearPosSession();
            router.replace("/login");
          }}
        >
          Logout
        </button>
      </div>

      <div className="pos-grid">
        <section>
          <div className="pos-panel" style={{ marginBottom: 12 }}>
            <BarcodeInput onScan={(code) => void onScan(code)} />
          </div>
          <ProductGrid
            products={products.map((item) => ({
              id: item.id,
              name: item.nameAr,
              barcode: item.barcode,
              stockQty: item.stockQty,
              salePrice: item.salePrice
            }))}
            onAdd={addByProductId}
          />
          <ReceiptPrint receipt={lastReceipt} />
        </section>
        <CartSidebar
          items={cart}
          total={total}
          onRemove={removeFromCart}
          onCheckout={() => setPaymentOpen(true)}
          disabled={cart.length === 0}
        />
      </div>

      <PaymentModal
        open={paymentOpen}
        total={total}
        onClose={() => setPaymentOpen(false)}
        onConfirm={({ paymentMethod, paidAmount }) => {
          void submitSale(paymentMethod, paidAmount);
        }}
      />

      {status ? <p className="status-line">{status}</p> : null}
    </div>
  );
}
