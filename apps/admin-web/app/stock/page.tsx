"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";

interface ProductLowStock {
  id: string;
  nameAr: string;
  sku: string;
  stockQty: number;
  minStockQty: number;
}

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  reason?: string | null;
  createdAt: string;
  product: { id: string; nameAr: string; sku: string };
  user?: { id: string; fullName: string } | null;
}

interface ProductOption {
  id: string;
  nameAr: string;
  sku: string;
}

export default function StockPage() {
  const [lowStock, setLowStock] = useState<ProductLowStock[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [status, setStatus] = useState("Loading...");

  async function load() {
    try {
      const [low, moves, allProducts] = await Promise.all([
        apiClient<ProductLowStock[]>("/api/stock/low"),
        apiClient<StockMovement[]>("/api/stock/movements"),
        apiClient<ProductOption[]>("/api/products")
      ]);
      setLowStock(low);
      setMovements(moves);
      setProducts(allProducts.map((row) => ({ id: row.id, nameAr: row.nameAr, sku: row.sku })));
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load stock data");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function adjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      await apiClient("/api/stock/adjust", {
        method: "POST",
        body: JSON.stringify({
          productId: String(form.get("productId") ?? ""),
          delta: Number(form.get("delta") ?? 0),
          reason: String(form.get("reason") ?? "Manual adjustment")
        })
      });
      event.currentTarget.reset();
      await load();
      setStatus("Stock adjusted");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to adjust stock");
    }
  }

  return (
    <section className="panel">
      <h2 className="page-title">Stock</h2>

      <form onSubmit={adjust} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr auto", gap: 8, marginBottom: 14 }}>
        <select name="productId" required defaultValue="">
          <option value="" disabled>
            Select Product
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.sku} - {product.nameAr}
            </option>
          ))}
        </select>
        <input name="delta" type="number" placeholder="Delta (+/-)" required />
        <input name="reason" placeholder="Reason" required />
        <button className="primary-btn" type="submit">
          Adjust
        </button>
      </form>

      <h3>Low Stock Products</h3>
      <table className="data-table" style={{ marginBottom: 14 }}>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Name</th>
            <th>Stock</th>
            <th>Min</th>
          </tr>
        </thead>
        <tbody>
          {lowStock.map((item) => (
            <tr key={item.id}>
              <td>{item.sku}</td>
              <td>{item.nameAr}</td>
              <td>{item.stockQty}</td>
              <td>{item.minStockQty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Recent Movements</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Product</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Reason</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.createdAt).toLocaleString()}</td>
              <td>{item.product.nameAr}</td>
              <td>{item.type}</td>
              <td>{item.quantity}</td>
              <td>{item.reason}</td>
              <td>{item.user?.fullName ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {status ? <p>{status}</p> : null}
    </section>
  );
}
