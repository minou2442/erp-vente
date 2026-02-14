"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";

interface SupplierRow {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  debtBalance: number;
}

export default function SuppliersPage() {
  const [rows, setRows] = useState<SupplierRow[]>([]);
  const [status, setStatus] = useState("Loading...");

  async function load() {
    try {
      const data = await apiClient<SupplierRow[]>("/api/suppliers");
      setRows(data);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load suppliers");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      await apiClient("/api/suppliers", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          email: String(form.get("email") ?? ""),
          address: String(form.get("address") ?? "")
        })
      });
      event.currentTarget.reset();
      await load();
      setStatus("Supplier created");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to create supplier");
    }
  }

  return (
    <section className="panel">
      <h2 className="page-title">Suppliers</h2>

      <form onSubmit={create} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr auto", gap: 8, marginBottom: 14 }}>
        <input name="name" placeholder="Name" required />
        <input name="phone" placeholder="Phone" />
        <input name="email" placeholder="Email" type="email" />
        <input name="address" placeholder="Address" />
        <button className="primary-btn" type="submit">
          Add
        </button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Debt Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.name}</td>
              <td>{row.phone ?? "-"}</td>
              <td>{row.email ?? "-"}</td>
              <td>{row.address ?? "-"}</td>
              <td>{row.debtBalance.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {status ? <p>{status}</p> : null}
    </section>
  );
}
