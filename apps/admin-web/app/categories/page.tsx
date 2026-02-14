"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";

interface CategoryRow {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  parentId?: string | null;
}

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [status, setStatus] = useState("Loading...");

  async function load() {
    try {
      const data = await apiClient<CategoryRow[]>("/api/categories");
      setRows(data);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to load categories");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      await apiClient("/api/categories", {
        method: "POST",
        body: JSON.stringify({
          nameAr: String(form.get("nameAr") ?? ""),
          nameFr: String(form.get("nameFr") ?? ""),
          nameEn: String(form.get("nameEn") ?? "")
        })
      });
      event.currentTarget.reset();
      await load();
      setStatus("Category created");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to create category");
    }
  }

  return (
    <section className="panel">
      <h2 className="page-title">Categories</h2>

      <form onSubmit={create} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 14 }}>
        <input name="nameAr" placeholder="Name AR" required />
        <input name="nameFr" placeholder="Name FR" required />
        <input name="nameEn" placeholder="Name EN" required />
        <button className="primary-btn" type="submit">
          Add
        </button>
      </form>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name AR</th>
            <th>Name FR</th>
            <th>Name EN</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.nameAr}</td>
              <td>{row.nameFr}</td>
              <td>{row.nameEn}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {status ? <p>{status}</p> : null}
    </section>
  );
}
