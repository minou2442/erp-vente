export function cn(...classNames: Array<string | undefined | null | false>): string {
  return classNames.filter(Boolean).join(" ");
}

export function formatMoney(value: number, locale = "fr-DZ", currency = "DZD"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency
  }).format(value);
}
