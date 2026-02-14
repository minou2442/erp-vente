"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { hasAuthSession } from "../../lib/auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const hasSession = hasAuthSession();
    const isAuthRoute = pathname === "/login";

    if (!hasSession && !isAuthRoute) {
      router.replace("/login");
      setCanRender(false);
      return;
    }

    if (hasSession && isAuthRoute) {
      router.replace("/dashboard");
      setCanRender(false);
      return;
    }

    setCanRender(true);
  }, [pathname, router]);

  if (!canRender) {
    return <main className="page-content"><section className="panel">Loading...</section></main>;
  }

  return <>{children}</>;
}
