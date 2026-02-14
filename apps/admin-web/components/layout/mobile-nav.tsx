"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppContext } from "./app-providers";

interface NavItemWithBadge {
  key: string;
  href: string;
  badge?: number | string;
}

const navItems: NavItemWithBadge[] = [
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

export function MobileNav({ badges = {} }: { badges?: Record<string, number | string> }) {
  const pathname = usePathname();
  const { dictionary } = useAppContext();

  return (
    <div className="mobile-nav-container">
      <div className="mobile-nav-grid">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const label = dictionary.nav[item.key as keyof typeof dictionary.nav];
          const badge = badges[item.key];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${active ? "active" : ""}`}
            >
              <div className="nav-item-content">
                <span className="nav-item-label">{label}</span>
                {badge && (
                  <span className="nav-item-badge">
                    {typeof badge === "number" && badge > 99 ? "99+" : badge}
                  </span>
                )}
              </div>
              {active && <div className="nav-item-indicator" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
