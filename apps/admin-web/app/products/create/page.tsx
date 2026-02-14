"use client";

import { FormEvent, useEffect, useState } from "react";
import CameraScanner from "../../../components/barcode-scanner/camera-scanner";
import UsbScanner from "../../../components/barcode-scanner/usb-scanner";
import { apiClient } from "../../../lib/api-client";
import { useI18n } from "../../../hooks/use-i18n";

interface CategoryOption {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
}

export default function CreateProductPage() {
  const { dictionary } = useI18n();
  const [status, setStatus] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    let active = true;
    apiClient<CategoryOption[]>("/api/categories")
      .then((rows) => {
        if (active) {
          setCategories(rows);
        }
      })
      .catch(() => {
        // keep empty and allow manual fallback
      });

    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      await apiClient("/api/products", {
        method: "POST",
        body: JSON.stringify({
          barcode: barcode || undefined,
          nameAr: String(formData.get("nameAr") ?? ""),
          nameFr: String(formData.get("nameFr") ?? ""),
          nameEn: String(formData.get("nameEn") ?? ""),
          purchasePrice: Number(formData.get("purchasePrice") ?? 0),
          salePrice: Number(formData.get("salePrice") ?? 0),
          stockQty: Number(formData.get("stockQty") ?? 0),
          minStockQty: Number(formData.get("minStockQty") ?? 0),
          categoryId: String(formData.get("categoryId") ?? "")
        })
      });
      setStatus("Product created.");
      setBarcode("");
      event.currentTarget.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create product";
      setStatus(message);
    }
  }

  return (
    <section className="panel">
      <h2 className="page-title">{dictionary.products.create}</h2>

      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <label>
          Barcode / QR Data
          <input value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="Auto-generated if empty" />
        </label>
        <CameraScanner
          onDetected={(value) => {
            setBarcode(value);
            setStatus(`Scanner value captured: ${value}`);
          }}
          buttonLabel="Scan Barcode / QR with Camera"
        />
        <UsbScanner
          onDetected={(value) => {
            setBarcode(value);
            setStatus(`USB scanner value captured: ${value}`);
          }}
        />
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 640 }}>
        <input name="nameAr" placeholder="Name (AR)" required />
        <input name="nameFr" placeholder="Name (FR)" />
        <input name="nameEn" placeholder="Name (EN)" />
        <input name="purchasePrice" placeholder="Purchase Price" type="number" min="0" step="0.01" required />
        <input name="salePrice" placeholder="Sale Price" type="number" min="0" step="0.01" required />
        <input name="stockQty" placeholder="Stock Qty" type="number" min="0" step="1" required />
        <input name="minStockQty" placeholder="Min Stock Qty" type="number" min="0" step="1" required />

        {categories.length > 0 ? (
          <select name="categoryId" required defaultValue="">
            <option disabled value="">
              Select category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameAr} / {category.nameFr}
              </option>
            ))}
          </select>
        ) : (
          <input name="categoryId" placeholder="Category UUID" required />
        )}

        <button className="primary-btn" type="submit">
          {dictionary.common.save}
        </button>
      </form>
      {status ? <p>{status}</p> : null}
    </section>
  );
}
