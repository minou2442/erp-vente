import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "../components/layout/app-providers";
import { AppShell } from "../components/layout/app-shell";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "TREXBYTE ERP Admin",
  description: "Admin dashboard for TREXBYTE ERP"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
