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
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.01em' }}>
          TREXBYTE
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--fg-muted)', fontSize: '0.95rem' }}>Multi-tenant ERP management platform</p>
      </div>

      <div className="auth-tabs" style={{ marginBottom: '28px' }}>
        <button 
          className={mode === "login" ? "primary-btn" : "ghost-btn"} 
          onClick={() => setMode("login")} 
          type="button"
          style={{ flex: 1 }}
        >
          Sign In
        </button>
        <button
          className={mode === "registerOrg" ? "primary-btn" : "ghost-btn"}
          onClick={() => setMode("registerOrg")}
          type="button"
          style={{ flex: 1 }}
        >
          Register
        </button>
      </div>

      {mode === "login" ? (
        <form className="auth-form" onSubmit={login}>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Email</span>
            <input name="email" type="email" placeholder="your@email.com" required />
          </label>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Password</span>
            <input name="password" type="password" placeholder="••••••••" required />
          </label>
          <button className="primary-btn" type="submit" style={{ width: '100%', marginTop: '8px' }}>
            Sign In
          </button>
        </form>
      ) : (
        <form className="auth-form" onSubmit={registerOrganization}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--fg)' }}>Organization Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Organization Name</span>
              <input name="organizationName" placeholder="Your Store Name" required />
            </label>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Unique Code</span>
              <input name="organizationCode" placeholder="my-store" required />
            </label>
          </div>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Address</span>
            <input name="address" placeholder="Street address" />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>City</span>
              <input name="city" placeholder="City" />
            </label>
            <label style={{ display: 'grid', gap: '6px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Phone</span>
              <input name="phone" placeholder="+1 (555) 000-0000" />
            </label>
          </div>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Organization Email</span>
            <input name="organizationEmail" type="email" placeholder="org@example.com" />
          </label>
          
          <h3 style={{ margin: '20px 0 16px', fontSize: '1.1rem', fontWeight: '600', color: 'var(--fg)' }}>Admin Account</h3>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Full Name</span>
            <input name="adminFullName" placeholder="John Doe" required />
          </label>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Admin Email</span>
            <input name="adminEmail" type="email" placeholder="admin@example.com" required />
          </label>
          <label style={{ display: 'grid', gap: '6px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--fg)' }}>Password</span>
            <input name="adminPassword" type="password" placeholder="••••••••" required />
          </label>
          <button className="primary-btn" type="submit" style={{ width: '100%', marginTop: '12px' }}>
            Create Organization
          </button>
        </form>
      )}

      {status ? <p className="auth-status" style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: 'var(--error)', fontWeight: '500', fontSize: '0.9rem' }}>{status}</p> : null}
    </section>
  );
}
