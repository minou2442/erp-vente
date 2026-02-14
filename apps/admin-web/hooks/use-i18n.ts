"use client";

import { useAppContext } from "../components/layout/app-providers";

export function useI18n() {
  const context = useAppContext();
  return {
    locale: context.locale,
    dictionary: context.dictionary,
    isRtl: context.isRtl,
    setLocale: context.setLocale
  };
}
