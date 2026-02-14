"use client";

import { useI18n } from "../../hooks/use-i18n";

interface ModulePlaceholderProps {
  title: string;
  description: string;
}

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  const { dictionary } = useI18n();

  return (
    <section className="panel">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="pill">{dictionary.common.comingSoon}</div>
    </section>
  );
}
