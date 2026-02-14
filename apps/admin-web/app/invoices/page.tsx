"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";
import { getToken } from "../../lib/auth";

interface InvoiceRow {
  id: string;
  number: string;
  type: string;
  issuedAt: string;
  sale?: { reference: string; total: number } | null;
  purchase?: { reference: string; total: number } | null;
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [status, setStatus] = useState("Loading...");

  async function load() {
    try {
      const data = await apiClient<InvoiceRow[]>("/api/invoices");
      setRows(data);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load invoices");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function getPdfBlob(invoiceId: string) {
    const token = getToken();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/invoices/${invoiceId}/pdf`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF (${response.status})`);
    }

    return response.blob();
  }

  async function openPdf(invoiceId: string, invoiceNumber: string) {
    try {
      const blob = await getPdfBlob(invoiceId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `Failed to open ${invoiceNumber}`);
    }
  }

  async function printPdf(invoiceId: string, invoiceNumber: string) {
    try {
      const blob = await getPdfBlob(invoiceId);
      const url = URL.createObjectURL(blob);
      const frame = document.createElement("iframe");
      frame.style.position = "fixed";
      frame.style.width = "0";
      frame.style.height = "0";
      frame.style.opacity = "0";
      frame.src = url;
      frame.onload = () => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        setTimeout(() => {
          URL.revokeObjectURL(url);
          frame.remove();
        }, 3000);
      };
      document.body.appendChild(frame);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : `Failed to print ${invoiceNumber}`);
    }
  }

  return (
    <section className="panel">
      <h2 className="page-title">Invoices</h2>
      <p className="page-subtitle">Generate and print modern branded PDFs from your settings profile.</p>

      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Number</th>
              <th>Type</th>
              <th>Reference</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const reference = row.sale?.reference ?? row.purchase?.reference ?? "-";
              const total = row.sale?.total ?? row.purchase?.total ?? 0;
              return (
                <tr key={row.id}>
                  <td>{new Date(row.issuedAt).toLocaleString()}</td>
                  <td>{row.number}</td>
                  <td>{row.type}</td>
                  <td>{reference}</td>
                  <td>{total.toFixed(2)}</td>
                  <td>
                    <div className="inline-actions">
                      <button className="ghost-btn" type="button" onClick={() => void openPdf(row.id, row.number)}>
                        View PDF
                      </button>
                      <button className="primary-btn" type="button" onClick={() => void printPdf(row.id, row.number)}>
                        Print
                      </button>
                    </div>
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
