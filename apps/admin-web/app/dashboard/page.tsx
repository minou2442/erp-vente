"use client";

import { useEffect, useMemo, useState } from "react";
import Analytics from "./analytics";
import { apiClient } from "../../lib/api-client";
import { useI18n } from "../../hooks/use-i18n";
import { formatMoney } from "../../lib/utils";

interface DashboardPayload {
  salesRevenue: number;
  grossMargin: number;
  productCount: number;
  lowStockCount: number;
  salesByDay: Array<{ day: string; total: number }>;
}

const fallbackData: DashboardPayload = {
  salesRevenue: 0,
  grossMargin: 0,
  productCount: 0,
  lowStockCount: 0,
  salesByDay: [
    { day: "2026-02-10", total: 15_000 },
    { day: "2026-02-11", total: 22_000 },
    { day: "2026-02-12", total: 19_000 },
    { day: "2026-02-13", total: 25_000 }
  ]
};

export default function DashboardPage() {
  const { dictionary } = useI18n();
  const [data, setData] = useState<DashboardPayload>(fallbackData);

  useEffect(() => {
    let mounted = true;
    apiClient<DashboardPayload>("/api/reports/dashboard")
      .then((payload) => {
        if (mounted) {
          setData(payload);
        }
      })
      .catch(() => {
        // keep fallback values until backend auth/session is wired
      });

    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      { label: dictionary.dashboard.cards.revenue, value: formatMoney(data.salesRevenue) },
      { label: dictionary.dashboard.cards.margin, value: formatMoney(data.grossMargin) },
      { label: dictionary.dashboard.cards.products, value: data.productCount.toString() },
      { label: dictionary.dashboard.cards.lowStock, value: data.lowStockCount.toString() }
    ],
    [data, dictionary]
  );

  return (
    <section>
      <h2 className="page-title">{dictionary.dashboard.title}</h2>
      <p className="page-subtitle">{dictionary.dashboard.subtitle}</p>

      <div className="grid-cards">
        {cards.map((card) => (
          <article key={card.label} className="card">
            <h3>{card.label}</h3>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <Analytics points={data.salesByDay} />
    </section>
  );
}
