"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiClient } from "../../../lib/api-client";
import { getToken } from "../../../lib/auth";

interface ProductDetail {
  id: string;
  sku: string;
  barcode: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  stockQty: number;
  minStockQty: number;
  salePrice: number;
  purchasePrice: number;
}

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [status, setStatus] = useState("");
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    let mounted = true;
    apiClient<ProductDetail>(`/api/products/${params.id}`)
      .then((payload) => {
        if (mounted) {
          setProduct(payload);
        }
      })
      .catch((error) => {
        if (mounted) {
          setStatus(error instanceof Error ? error.message : "Failed to load product");
        }
      });

    return () => {
      mounted = false;
    };
  }, [params.id]);

  async function getLabelBlob() {
    const token = getToken();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/products/${params.id}/label-pdf?copies=${copies}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to generate label PDF (${response.status})`);
    }

    return response.blob();
  }

  async function viewLabelPdf() {
    try {
      const blob = await getLabelBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 8000);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to open label PDF");
    }
  }

  async function printLabelPdf() {
    try {
      const blob = await getLabelBlob();
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
      setStatus(error instanceof Error ? error.message : "Failed to print label PDF");
    }
  }

  return (
    <section className="panel">
      <h2>Details Produit / المنتج</h2>
      {!product ? (
        <p>Chargement / جاري التحميل...</p>
      ) : (
        <>
          <p>SKU: {product.sku}</p>
          <p>Code-barres: {product.barcode}</p>
          <p>Nom (FR / AR): {product.nameFr} / {product.nameAr}</p>
          <p>Stock: {product.stockQty}</p>
          <p>Prix Vente: {product.salePrice.toFixed(2)}</p>

          <div className="form-grid form-grid-3" style={{ marginTop: 10, alignItems: "center" }}>
            <input
              type="number"
              min={1}
              max={60}
              value={copies}
              onChange={(event) => setCopies(Math.max(1, Math.min(60, Number(event.target.value) || 1)))}
            />
            <button className="ghost-btn" type="button" onClick={() => void viewLabelPdf()}>
              Etiquette PDF
            </button>
            <button className="primary-btn" type="button" onClick={() => void printLabelPdf()}>
              Imprimer Etiquettes
            </button>
          </div>
        </>
      )}
      <div className="inline-actions" style={{ marginTop: 12 }}>
        <Link className="primary-btn" href={`/products/${params.id}/edit`}>
          Modifier Produit
        </Link>
      </div>
      {status ? <p>{status}</p> : null}
    </section>
  );
}
