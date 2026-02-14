"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getStoredUser, type AuthUser } from "../../lib/auth";
import { useAppContext } from "./app-providers";

export function Topbar() {
  const { locale, setLocale, theme, toggleTheme, dictionary } = useAppContext();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{user?.organization?.name ?? dictionary.appName}</h1>
        <p>{user ? `${user.fullName} (${user.role})` : "Enterprise Resource Planning"}</p>
      </div>
      <div className="topbar-actions">
        <label className="select-wrap">
          <span>{dictionary.common.language}</span>
          <select value={locale} onChange={(event) => setLocale(event.target.value as "ar" | "fr" | "en")}>
            <option value="ar">Arabic</option>
            <option value="fr">Francais</option>
            <option value="en">English</option>
          </select>
        </label>
        <button className="ghost-btn" onClick={toggleTheme} type="button">
          {theme === "light" ? dictionary.common.darkMode : dictionary.common.lightMode}
        </button>
        <button
          className="ghost-btn"
          onClick={() => {
            clearAuthSession();
            router.replace("/login");
          }}
          type="button"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
