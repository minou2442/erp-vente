"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthGate } from "./auth-gate";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/login";

  return (
    <AuthGate>
      {isAuthRoute ? (
        <main className="auth-root">{children}</main>
      ) : (
        <div className="layout-root">
          <Sidebar />
          <div className="layout-main">
            <Topbar />
            <main className="page-content">{children}</main>
          </div>
        </div>
      )}
    </AuthGate>
  );
}
