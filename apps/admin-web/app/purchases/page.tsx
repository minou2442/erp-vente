"use client";

import { FormEvent, useEffect, useState } from "react";
import CameraScanner from "../../components/barcode-scanner/camera-scanner";
import UsbScanner from "../../components/barcode-scanner/usb-scanner";
import { apiClient } from "../../lib/api-client";
import { getToken } from "../../lib/auth";

interface SupplierOption {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  nameAr: string;
  sku: string;
  barcode: string;
  purchasePrice: number;
}

interface InvoiceInfo {
  id: string;
  number: string;
}

interface PurchaseRow {
  id: string;
  reference: string;
  total: number;
  paidAmount: number;
  status: string;
  createdAt: string;
  supplier: { name: string };
  invoice?: InvoiceInfo | null;
}

interface PurchaseLine {
  productId: string;
  sku: string;
  nameAr: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
}

export default function PurchasesPage() {
  const [rows, setRows] = useState<PurchaseRow[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [lines, setLines] = useState<PurchaseLine[]>([]);
  const [status, setStatus] = useState("Loading...");

  async function load() {
    try {
      const [purchases, suppliersRows, productRows] = await Promise.all([
        apiClient<PurchaseRow[]>("/api/purchases"),
        apiClient<SupplierOption[]>("/api/suppliers"),
        apiClient<ProductOption[]>("/api/products")
      ]);
      setRows(purchases);
      setSuppliers(suppliersRows);
      setProducts(
        productRows.map((row) => ({
          id: row.id,
          nameAr: row.nameAr,
          sku: row.sku,
          barcode: row.barcode,
          purchasePrice: row.purchasePrice
        }))
      );
      if (!supplierId && suppliersRows.length > 0) {
        setSupplierId(suppliersRows[0].id);
      }
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load purchases");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addProductLine(product: ProductOption, quantity = 1) {
    setLines((previous) => {
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
          unitPrice: product.purchasePrice
        }
      ];
    });
  }

  function removeLine(productId: string) {
    setLines((previous) => previous.filter((line) => line.productId !== productId));
  }

  function updateLine(productId: string, patch: Partial<PurchaseLine>) {
    setLines((previous) =>
      previous.map((line) => {
        if (line.productId !== productId) {
          return line;
        }

        return {
          ...line,
          ...patch
        };
      })
    );
  }

  async function onScan(code: string) {
    const local = products.find((product) => product.barcode === code);
    if (local) {
      addProductLine(local, 1);
      setStatus(`Scanned: ${code}`);
      return;
    }

    try {
      const remote = await apiClient<ProductOption>(`/api/products/barcode/${encodeURIComponent(code)}`);
      addProductLine(remote, 1);
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
    const unitPrice = Number(form.get("unitPrice") ?? 0);

    const product = products.find((entry) => entry.id === productId);
    if (!product) {
      setStatus("Please select a valid product");
      return;
    }

    const normalizedQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    const normalizedUnitPrice = Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : product.purchasePrice;

    setLines((previous) => {
      const existing = previous.find((line) => line.productId === product.id);
      if (existing) {
        return previous.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + normalizedQty, unitPrice: normalizedUnitPrice }
            : line
        );
      }

      return [
        ...previous,
        {
          productId: product.id,
          sku: product.sku,
          nameAr: product.nameAr,
          barcode: product.barcode,
          quantity: normalizedQty,
          unitPrice: normalizedUnitPrice
        }
      ];
    });

    event.currentTarget.reset();
  }

  async function createPurchase() {
    if (!supplierId) {
      setStatus("Select a supplier first");
      return;
    }

    if (lines.length === 0) {
      setStatus("Add at least one scanned/manual line before creating the purchase");
      return;
    }

    try {
      await apiClient("/api/purchases", {
        method: "POST",
        body: JSON.stringify({
          supplierId,
          items: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice
          }))
        })
      });

      setLines([]);
      await load();
      setStatus("Purchase created");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to create purchase");
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

  const linesTotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);

  return (
    <section className="panel">
      <h2 className="page-title">Purchases</h2>

      <div className="sales-tools">
        <h3 style={{ margin: 0 }}>Scan Barcode / QR</h3>
        <div className="form-grid form-grid-2">
          <CameraScanner onDetected={(value) => void onScan(value)} buttonLabel="Scan with Camera (Barcode / QR)" />
          <UsbScanner onDetected={(value) => void onScan(value)} />
        </div>
      </div>

      <div className="form-grid form-grid-3" style={{ marginTop: 12 }}>
        <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}>
          <option value="">Select supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={addFromSelect} className="form-grid form-grid-4" style={{ marginTop: 12 }}>
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
        <input name="quantity" type="number" placeholder="Qty" min={1} defaultValue={1} required />
        <input name="unitPrice" type="number" step="0.01" min={0} placeholder="Unit price" />
        <button className="ghost-btn" type="submit">
          Add Line
        </button>
      </form>

      <div className="table-wrap" style={{ marginTop: 12 }}>
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
            {lines.map((line) => (
              <tr key={line.productId}>
                <td>
                  {line.sku} - {line.nameAr}
                </td>
                <td>{line.barcode}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(event) => updateLine(line.productId, { quantity: Number(event.target.value) || 1 })}
                    style={{ width: 84 }}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(event) => updateLine(line.productId, { unitPrice: Number(event.target.value) || 0 })}
                    style={{ width: 120 }}
                  />
                </td>
                <td>{(line.quantity * line.unitPrice).toFixed(2)}</td>
                <td>
                  <button className="ghost-btn" type="button" onClick={() => removeLine(line.productId)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="form-grid form-grid-3" style={{ marginTop: 12, alignItems: "center" }}>
        <strong>Purchase Total: {linesTotal.toFixed(2)}</strong>
        <button className="primary-btn" type="button" onClick={() => void createPurchase()}>
          Create Purchase
        </button>
      </div>

      <div className="table-wrap" style={{ marginTop: 14 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Reference</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Print</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const invoice = row.invoice;
              return (
                <tr key={row.id}>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                  <td>{row.reference}</td>
                  <td>{row.supplier.name}</td>
                  <td>{row.status}</td>
                  <td>{row.total.toFixed(2)}</td>
                  <td>{row.paidAmount.toFixed(2)}</td>
                  <td>
                    {invoice ? (
                      <button className="ghost-btn" type="button" onClick={() => void openPdf(invoice.id, invoice.number)}>
                        Print PDF
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {status ? <p>{status}</p> : null}
    </section>
  );
}
