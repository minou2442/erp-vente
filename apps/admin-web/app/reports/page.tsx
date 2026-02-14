"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";
import { formatMoney } from "../../lib/utils";

interface ReportPayload {
  salesRevenue: number;
  purchaseSpend: number;
  grossMargin: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    total: number;
  }>;
  supplierDebt: Array<{
    id: string;
    name: string;
    debtBalance: number;
  }>;
}

const fallback: ReportPayload = {
  salesRevenue: 0,
  purchaseSpend: 0,
  grossMargin: 0,
  averageOrderValue: 0,
  topProducts: [],
  supplierDebt: []
};

export default function ReportsPage() {
  const [data, setData] = useState<ReportPayload>(fallback);
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    let active = true;
    apiClient<ReportPayload>("/api/reports/dashboard")
      .then((payload) => {
        if (!active) {
          return;
        }

        setData(payload);
        setStatus("");
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setStatus(error instanceof Error ? error.message : "Failed to load report");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="panel">
      <h2 className="page-title">Reports</h2>

      <div className="grid-cards" style={{ marginBottom: 14 }}>
        <article className="card">
          <h3>Sales Revenue</h3>
          <strong>{formatMoney(data.salesRevenue)}</strong>
        </article>
        <article className="card">
          <h3>Purchase Spend</h3>
          <strong>{formatMoney(data.purchaseSpend)}</strong>
        </article>
        <article className="card">
          <h3>Gross Margin</h3>
          <strong>{formatMoney(data.grossMargin)}</strong>
        </article>
        <article className="card">
          <h3>Average Order</h3>
          <strong>{formatMoney(data.averageOrderValue)}</strong>
        </article>
      </div>

      <h3>Top Products</h3>
      <table className="data-table" style={{ marginBottom: 14 }}>
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.topProducts.map((row) => (
            <tr key={row.productId}>
              <td>{row.productName}</td>
              <td>{row.sku}</td>
              <td>{row.quantity}</td>
              <td>{formatMoney(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Supplier Debt</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Debt Balance</th>
          </tr>
        </thead>
        <tbody>
          {data.supplierDebt.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{formatMoney(row.debtBalance)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {status ? <p>{status}</p> : null}
    </section>
  );
}
