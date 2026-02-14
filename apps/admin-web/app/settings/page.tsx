"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { apiClient } from "../../lib/api-client";

interface CompanySettings {
  id: string;
  code: string;
  name: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  currency: string;
  invoiceFooter?: string | null;
}

const initialState: CompanySettings = {
  id: "",
  code: "",
  name: "",
  address: "",
  city: "",
  phone: "",
  email: "",
  logoUrl: "",
  currency: "DZD",
  invoiceFooter: ""
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(initialState);
  const [status, setStatus] = useState("Loading...");
  const [logoPreview, setLogoPreview] = useState("");
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    apiClient<CompanySettings>("/api/settings/company")
      .then((payload) => {
        if (!mounted) {
          return;
        }

        setSettings(payload);
        setLogoPreview(payload.logoUrl ?? "");
        setStatus("");
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        setStatus(error instanceof Error ? error.message : "Failed to load settings");
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      name: String(form.get("name") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      city: String(form.get("city") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      logoUrl: String(form.get("logoUrl") ?? "").trim(),
      currency: String(form.get("currency") ?? "").trim().toUpperCase(),
      invoiceFooter: String(form.get("invoiceFooter") ?? "").trim()
    };

    try {
      const updated = await apiClient<CompanySettings>("/api/settings/company", {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      setSettings(updated);
      setLogoPreview(updated.logoUrl ?? "");
      setStatus("Company profile updated");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to update settings");
    }
  }

  function onLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === "string" ? reader.result : "";
      if (!value) {
        return;
      }

      setLogoPreview(value);
      if (logoInputRef.current) {
        logoInputRef.current.value = value;
      }
      setStatus("Logo loaded from file. Save settings to apply it to invoices.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="panel">
      <h2 className="page-title">Settings</h2>
      <p className="page-subtitle">Configure alimentation name, address, logo and invoice branding.</p>

      <form onSubmit={save} className="form-grid form-grid-2" style={{ marginTop: 12 }}>
        <input defaultValue={settings.name} name="name" placeholder="Alimentation Name" required />
        <input defaultValue={settings.code} disabled name="code" placeholder="Organization Code" />
        <input defaultValue={settings.address ?? ""} name="address" placeholder="Address" />
        <input defaultValue={settings.city ?? ""} name="city" placeholder="City" />
        <input defaultValue={settings.phone ?? ""} name="phone" placeholder="Phone" />
        <input defaultValue={settings.email ?? ""} name="email" placeholder="Email" type="email" />
        <input
          ref={logoInputRef}
          defaultValue={settings.logoUrl ?? ""}
          name="logoUrl"
          placeholder="Logo URL or base64 data URL"
          onChange={(event) => setLogoPreview(event.target.value)}
        />
        <input type="file" accept="image/*" onChange={onLogoFileChange} />
        <input defaultValue={settings.currency} name="currency" placeholder="Currency (e.g. DZD)" maxLength={3} />
        <textarea
          className="form-span-2"
          defaultValue={settings.invoiceFooter ?? ""}
          name="invoiceFooter"
          placeholder="Invoice footer message"
          rows={3}
        />

        <button className="primary-btn form-span-2" type="submit">
          Save Settings
        </button>
      </form>

      {logoPreview ? (
        <div style={{ marginTop: 12 }}>
          <h3>Logo Preview</h3>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoPreview}
            alt="Organization logo"
            style={{ maxHeight: 90, border: "1px solid var(--line)", borderRadius: 10, padding: 6 }}
          />
        </div>
      ) : null}

      {status ? <p style={{ marginTop: 12 }}>{status}</p> : null}
    </section>
  );
}
