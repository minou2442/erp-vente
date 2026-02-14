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
    <section className="page-section">
      <div className="section-header">
        <h2 className="page-title">{dictionary.products.create}</h2>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--fg)' }}>Barcode / QR Scanner</h3>
        <div style={{ display: "grid", gap: 12, marginBottom: 24, padding: '16px', background: 'rgba(59, 130, 246, 0.03)', borderRadius: '12px', border: '1px solid var(--line)' }}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Barcode / QR Data</span>
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

        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--fg)' }}>Product Details</h3>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14, maxWidth: '100%' }}>
          <div className="form-grid-3">
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Name (Arabic)</span>
              <input name="nameAr" placeholder="Arabic name" required />
            </label>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Name (French)</span>
              <input name="nameFr" placeholder="French name" />
            </label>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Name (English)</span>
              <input name="nameEn" placeholder="English name" />
            </label>
          </div>

          <div className="form-grid-4">
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Purchase Price</span>
              <input name="purchasePrice" placeholder="0.00" type="number" min="0" step="0.01" required />
            </label>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Sale Price</span>
              <input name="salePrice" placeholder="0.00" type="number" min="0" step="0.01" required />
            </label>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Stock</span>
              <input name="stockQty" placeholder="0" type="number" min="0" step="1" required />
            </label>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Min Stock</span>
              <input name="minStockQty" placeholder="0" type="number" min="0" step="1" required />
            </label>
          </div>

          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Category</span>
            {categories.length > 0 ? (
              <select name="categoryId" required defaultValue="" style={{ padding: '12px 14px', border: '1.5px solid var(--line)', borderRadius: '12px', background: 'var(--bg-soft)', color: 'var(--fg)', fontSize: '0.95rem', transition: 'all 0.3s ease', cursor: 'pointer' }}>
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
          </label>

          <button className="primary-btn" type="submit" style={{ marginTop: '8px' }}>
            {dictionary.common.save}
          </button>
        </form>
        {status ? <p style={{ color: status.includes('created') ? 'var(--success)' : 'var(--error)', marginTop: '16px', fontWeight: '500' }}>{status}</p> : null}
      </div>
    </section>
  );
}
