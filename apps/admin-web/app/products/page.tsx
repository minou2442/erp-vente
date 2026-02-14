"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../lib/api-client";
import { getToken } from "../../lib/auth";
import { useI18n } from "../../hooks/use-i18n";

interface ProductRow {
  id: string;
  sku: string;
  barcode: string;
  nameAr: string;
  nameFr: string;
  stockQty: number;
  salePrice: number;
}

export default function ProductsPage() {
  const { dictionary } = useI18n();
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let mounted = true;
    apiClient<ProductRow[]>("/api/products")
      .then((payload) => {
        if (mounted) {
          setRows(payload);
        }
      })
      .catch((error) => {
        if (mounted) {
          setStatus(error instanceof Error ? error.message : "Failed to load products");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((row) => `${row.nameAr} ${row.nameFr} ${row.sku} ${row.barcode}`.toLowerCase().includes(search.toLowerCase())),
    [rows, search]
  );

  async function getLabelBlob(productId: string, copies = 1) {
    const token = getToken();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/products/${productId}/label-pdf?copies=${copies}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to generate label PDF (${response.status})`);
    }

    return response.blob();
  }

  async function viewLabelPdf(productId: string) {
    try {
      const blob = await getLabelBlob(productId, 1);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 8000);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to open product label");
    }
  }

  async function printLabelPdf(productId: string) {
    try {
      const blob = await getLabelBlob(productId, 1);
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
      setStatus(error instanceof Error ? error.message : "Failed to print product label");
    }
  }

  return (
    <section>
      <h2 className="page-title">{dictionary.products.title}</h2>
      <div className="inline-actions">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={dictionary.common.search} />
        <Link href="/products/create" className="primary-btn">
          {dictionary.products.create}
        </Link>
      </div>

      <article className="panel">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Code-barres</th>
                <th>Nom FR / AR</th>
                <th>Stock</th>
                <th>Prix Vente</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>{dictionary.common.loading}</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td>{row.sku}</td>
                    <td>{row.barcode}</td>
                    <td>
                      {row.nameFr} / {row.nameAr}
                    </td>
                    <td>{row.stockQty}</td>
                    <td>{row.salePrice.toFixed(2)}</td>
                    <td>
                      <div className="inline-actions" style={{ margin: 0 }}>
                        <Link href={`/products/${row.id}`} className="ghost-btn">
                          Voir
                        </Link>
                        <button className="ghost-btn" type="button" onClick={() => void viewLabelPdf(row.id)}>
                          Etiquette PDF
                        </button>
                        <button className="primary-btn" type="button" onClick={() => void printLabelPdf(row.id)}>
                          Imprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
      {status ? <p>{status}</p> : null}
    </section>
  );
}
