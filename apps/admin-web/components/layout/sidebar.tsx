"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "./app-providers";

const navItems = [
  { key: "dashboard", href: "/dashboard" },
  { key: "products", href: "/products" },
  { key: "categories", href: "/categories" },
  { key: "stock", href: "/stock" },
  { key: "suppliers", href: "/suppliers" },
  { key: "purchases", href: "/purchases" },
  { key: "sales", href: "/sales" },
  { key: "invoices", href: "/invoices" },
  { key: "reports", href: "/reports" },
  { key: "settings", href: "/settings" }
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { dictionary } = useAppContext();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">TREXBYTE</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const label = dictionary.nav[item.key];
          return (
            <Link key={item.href} href={item.href} className={active ? "nav-link active" : "nav-link"}>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
