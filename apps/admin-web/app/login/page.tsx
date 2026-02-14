"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api-client";
import { setAuthSession, type AuthUser } from "../../lib/auth";

interface AuthResponse {
  token: string;
  user: AuthUser;
}

function applyPreferredLocale(user: AuthUser) {
  const locale = user.preferredLanguage === "AR" ? "ar" : user.preferredLanguage === "FR" ? "fr" : "en";
  window.localStorage.setItem("trexbyte.admin.locale", locale);
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "registerOrg">("login");
  const [status, setStatus] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const result = await apiClient<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? "")
        })
      });

      setAuthSession(result.token, result.user);
      applyPreferredLocale(result.user);
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setStatus(message);
    }
  }

  async function registerOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const result = await apiClient<AuthResponse>("/api/auth/register-organization", {
        method: "POST",
        body: JSON.stringify({
          organizationName: String(formData.get("organizationName") ?? ""),
          organizationCode: String(formData.get("organizationCode") ?? ""),
          address: String(formData.get("address") ?? ""),
          city: String(formData.get("city") ?? ""),
          phone: String(formData.get("phone") ?? ""),
          email: String(formData.get("organizationEmail") ?? ""),
          logoUrl: String(formData.get("logoUrl") ?? ""),
          adminFullName: String(formData.get("adminFullName") ?? ""),
          adminEmail: String(formData.get("adminEmail") ?? ""),
          adminPassword: String(formData.get("adminPassword") ?? "")
        })
      });

      setAuthSession(result.token, result.user);
      applyPreferredLocale(result.user);
      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Organization registration failed";
      setStatus(message);
    }
  }

  return (
    <section className="auth-card">
      <h1>TREXBYTE ERP</h1>
      <p>Multi-tenant alimentation management platform</p>

      <div className="auth-tabs">
        <button className={mode === "login" ? "primary-btn" : "ghost-btn"} onClick={() => setMode("login")} type="button">
          Login
        </button>
        <button
          className={mode === "registerOrg" ? "primary-btn" : "ghost-btn"}
          onClick={() => setMode("registerOrg")}
          type="button"
        >
          Register Alimentation
        </button>
      </div>

      {mode === "login" ? (
        <form className="auth-form" onSubmit={login}>
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button className="primary-btn" type="submit">
            Sign In
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={registerOrganization}>
          <input name="organizationName" placeholder="Alimentation Name" required />
          <input name="organizationCode" placeholder="Unique Code (e.g. my-store)" required />
          <input name="address" placeholder="Address" />
          <input name="city" placeholder="City" />
          <input name="phone" placeholder="Phone" />
          <input name="organizationEmail" type="email" placeholder="Organization Email" />
          <input name="logoUrl" placeholder="Logo URL or base64 data URL" />
          <input name="adminFullName" placeholder="Admin Full Name" required />
          <input name="adminEmail" type="email" placeholder="Admin Email" required />
          <input name="adminPassword" type="password" placeholder="Admin Password" required />
          <button className="primary-btn" type="submit">
            Create Organization
          </button>
        </form>
      )}

      {status ? <p className="auth-status">{status}</p> : null}
    </section>
  );
}
