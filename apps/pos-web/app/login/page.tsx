"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { posApi } from "../../lib/pos-api";
import { setPosSession, type PosUser } from "../../lib/auth";

interface AuthResponse {
  token: string;
  user: PosUser;
}

export default function PosLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
      const result = await posApi<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          password: String(form.get("password") ?? "")
        })
      });

      setPosSession(result.token, result.user);
      router.push("/pos");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed");
    }
  }

  return (
    <main className="pos-layout" style={{ display: "grid", placeItems: "center" }}>
      <section className="pos-panel" style={{ width: "min(440px, 96vw)", display: "grid", gap: 10 }}>
        <h1>TREXBYTE POS Login</h1>
        <form onSubmit={login} style={{ display: "grid", gap: 10 }}>
          <input name="email" type="email" placeholder="Cashier Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button className="btn-primary" type="submit">
            Sign In
          </button>
        </form>
        {status ? <p>{status}</p> : null}
      </section>
    </main>
  );
}
