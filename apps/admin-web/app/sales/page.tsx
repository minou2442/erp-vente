"use client";

import { FormEvent, useEffect, useState } from "react";
import CameraScanner from "../../components/barcode-scanner/camera-scanner";
import UsbScanner from "../../components/barcode-scanner/usb-scanner";
import { apiClient } from "../../lib/api-client";
import { getToken } from "../../lib/auth";

interface ProductOption {
  id: string;
  nameAr: string;
  sku: string;
  barcode: string;
  salePrice: number;
}

interface InvoiceInfo {
  id: string;
  number: string;
}

interface SalesRow {
  id: string;
  reference: string;
  total: number;
  paidAmount: number;
  paymentMethod: string;
  createdAt: string;
  cashier: { fullName: string };
  invoice?: InvoiceInfo | null;
}

interface CartLine {
  productId: string;
  sku: string;
  nameAr: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
}

export default function SalesPage() {
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [status, setStatus] = useState("Loading...");

  async function load() {
    try {
      const [sales, productRows] = await Promise.all([
        apiClient<SalesRow[]>("/api/sales"),
        apiClient<ProductOption[]>("/api/products")
      ]);

      setRows(sales);
      setProducts(
        productRows.map((row) => ({
          id: row.id,
          nameAr: row.nameAr,
          sku: row.sku,
          barcode: row.barcode,
          salePrice: row.salePrice
        }))
      );
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load sales");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function addProductToCart(product: ProductOption, quantity = 1) {
    setCart((previous) => {
      const existing = previous.find((line) => line.productId === product.id);
      if (existing) {
        return previous.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + quantity } : line
        );
      }

      return [
        ...previous,
        {
          productId: product.id,
          sku: product.sku,
          nameAr: product.nameAr,
          barcode: product.barcode,
          quantity,
          unitPrice: product.salePrice
        }
      ];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((previous) => previous.filter((line) => line.productId !== productId));
      return;
    }

    setCart((previous) =>
      previous.map((line) => (line.productId === productId ? { ...line, quantity } : line))
    );
  }

  function removeLine(productId: string) {
    setCart((previous) => previous.filter((line) => line.productId !== productId));
  }

  async function onScan(code: string) {
    const local = products.find((product) => product.barcode === code);
    if (local) {
      addProductToCart(local, 1);
      setStatus(`Scanned: ${code}`);
      return;
    }

    try {
      const remote = await apiClient<ProductOption>(`/api/products/barcode/${encodeURIComponent(code)}`);
      addProductToCart(remote, 1);
      setStatus(`Scanned: ${code}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `Unknown barcode/QR: ${code}`);
    }
  }

  function addFromSelect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const productId = String(form.get("productId") ?? "");
    const quantity = Number(form.get("quantity") ?? 1);
    const product = products.find((entry) => entry.id === productId);

    if (!product) {
      setStatus("Please select a valid product");
      return;
    }

    addProductToCart(product, Number.isFinite(quantity) && quantity > 0 ? quantity : 1);
    event.currentTarget.reset();
    setStatus("");
  }

  async function createSale() {
    if (cart.length === 0) {
      setStatus("Add at least one scanned/manual item before creating the sale");
      return;
    }

    try {
      await apiClient("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          paymentMethod,
          items: cart.map((line) => ({
            productId: line.productId,
            quantity: line.quantity
          }))
        })
      });
      setCart([]);
      await load();
      setStatus("Sale created");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to create sale");
    }
  }

  async function openPdf(invoiceId: string, invoiceNumber: string) {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/invoices/${invoiceId}/pdf`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to open PDF (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `Failed to open ${invoiceNumber}`);
    }
  }

  const cartTotal = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);

  return (
    <section className="page-section">
      <div className="section-header">
        <h2 className="page-title">Sales & Point of Sale</h2>
      </div>

      <div className="panel">
        <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--fg)' }}>Scan Barcode / QR</h3>
        <div className="form-grid form-grid-2">
          <CameraScanner onDetected={(value) => void onScan(value)} buttonLabel="Scan with Camera" />
          <UsbScanner onDetected={(value) => void onScan(value)} />
        </div>
      </div>

      <div className="panel">
        <form onSubmit={addFromSelect} className="form-grid form-grid-4" style={{ gap: '12px' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Product</span>
            <select name="productId" required defaultValue="">
              <option value="" disabled>
                Select product
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.sku} - {product.nameAr}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Quantity</span>
            <input name="quantity" type="number" placeholder="1" min={1} defaultValue={1} required />
          </label>
          <div></div>
          <button className="primary-btn" type="submit">
            Add Line
          </button>
        </form>
      </div>

      {cart.length > 0 && (
        <div className="panel">
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--fg)' }}>Cart ({cart.length} items)</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Barcode</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((line) => (
                  <tr key={line.productId}>
                    <td><strong>{line.sku}</strong><br/><span style={{ fontSize: '0.85rem', color: 'var(--fg-muted)' }}>{line.nameAr}</span></td>
                    <td style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{line.barcode}</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(event) => updateQuantity(line.productId, Number(event.target.value))}
                        style={{ width: 70, padding: '8px', borderRadius: '8px', border: '1px solid var(--line)' }}
                      />
                    </td>
                    <td>${line.unitPrice.toFixed(2)}</td>
                    <td><strong>${(line.quantity * line.unitPrice).toFixed(2)}</strong></td>
                    <td>
                      <button className="ghost-btn" type="button" style={{ padding: '8px 12px', fontSize: '0.9rem' }} onClick={() => removeLine(line.productId)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px' }}>
            <label style={{ display: 'grid', gap: '6px', flex: 1 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Payment Method</span>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} style={{ padding: '10px 12px', border: '1.5px solid var(--line)', borderRadius: '10px', background: 'var(--bg-soft)', color: 'var(--fg)' }}>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="TRANSFER">Transfer</option>
                <option value="MIXED">Mixed</option>
              </select>
            </label>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 8px', color: 'var(--fg-muted)', fontSize: '0.9rem' }}>Cart Total</p>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</div>
            </div>
            <button className="primary-btn" type="button" style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }} onClick={() => void createSale()}>
              Create Sale
            </button>
          </div>
        </div>
      )}

      {status && (
        <div style={{ padding: '12px 16px', background: status.includes('created') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', color: status.includes('created') ? 'var(--success)' : 'var(--error)', fontWeight: '500', fontSize: '0.9rem' }}>
          {status}
        </div>
      )}

      {rows.length > 0 && (
        <div className="panel">
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--fg)' }}>Recent Sales</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Cashier</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const invoice = row.invoice;
                  return (
                    <tr key={row.id}>
                      <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                      <td><strong>{row.reference}</strong></td>
                      <td>{row.cashier.fullName}</td>
                      <td><span style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500', color: 'var(--primary)' }}>{row.paymentMethod}</span></td>
                      <td>${row.total.toFixed(2)}</td>
                      <td style={{ color: row.paidAmount >= row.total ? 'var(--success)' : 'var(--warning)' }}>${row.paidAmount.toFixed(2)}</td>
                      <td>
                        {invoice ? (
                          <button className="ghost-btn" type="button" style={{ padding: '8px 12px', fontSize: '0.9rem' }} onClick={() => void openPdf(invoice.id, invoice.number)}>
                            View PDF
                          </button>
                        ) : (
                          <span style={{ color: 'var(--fg-muted)', fontSize: '0.9rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
