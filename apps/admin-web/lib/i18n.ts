export type Locale = "ar" | "fr" | "en";
export type Theme = "light" | "dark";

export interface Dictionary {
  appName: string;
  nav: {
    dashboard: string;
    products: string;
    categories: string;
    stock: string;
    suppliers: string;
    purchases: string;
    sales: string;
    invoices: string;
    reports: string;
    settings: string;
  };
  common: {
    language: string;
    darkMode: string;
    lightMode: string;
    save: string;
    cancel: string;
    search: string;
    create: string;
    loading: string;
    comingSoon: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    cards: {
      revenue: string;
      margin: string;
      products: string;
      lowStock: string;
    };
  };
  products: {
    title: string;
    create: string;
  };
}

export const DEFAULT_LOCALE: Locale =
  (process.env.NEXT_PUBLIC_DEFAULT_LOCALE as Locale | undefined) ?? "ar";

export const dictionaries: Record<Locale, Dictionary> = {
  ar: {
    appName: "TREXBYTE ERP",
    nav: {
      dashboard: "لوحة التحكم",
      products: "المنتجات",
      categories: "التصنيفات",
      stock: "المخزون",
      suppliers: "الموردون",
      purchases: "المشتريات",
      sales: "المبيعات",
      invoices: "الفواتير",
      reports: "التقارير",
      settings: "الاعدادات"
    },
    common: {
      language: "اللغة",
      darkMode: "وضع داكن",
      lightMode: "وضع فاتح",
      save: "حفظ",
      cancel: "الغاء",
      search: "بحث",
      create: "انشاء",
      loading: "جار التحميل...",
      comingSoon: "سيتم اضافة هذا الجزء قريبا"
    },
    dashboard: {
      title: "مؤشرات الاداء",
      subtitle: "متابعة المبيعات والمخزون والربح في الزمن الحقيقي",
      cards: {
        revenue: "رقم الاعمال",
        margin: "الهامش",
        products: "عدد المنتجات",
        lowStock: "منتجات منخفضة"
      }
    },
    products: {
      title: "ادارة المنتجات",
      create: "اضافة منتج"
    }
  },
  fr: {
    appName: "TREXBYTE ERP",
    nav: {
      dashboard: "Tableau de bord",
      products: "Produits",
      categories: "Categories",
      stock: "Stock",
      suppliers: "Fournisseurs",
      purchases: "Achats",
      sales: "Ventes",
      invoices: "Factures",
      reports: "Rapports",
      settings: "Parametres"
    },
    common: {
      language: "Langue",
      darkMode: "Mode sombre",
      lightMode: "Mode clair",
      save: "Enregistrer",
      cancel: "Annuler",
      search: "Rechercher",
      create: "Creer",
      loading: "Chargement...",
      comingSoon: "Cette section sera disponible bientot"
    },
    dashboard: {
      title: "Indicateurs de performance",
      subtitle: "Suivi temps reel des ventes, du stock et des marges",
      cards: {
        revenue: "Chiffre d'affaires",
        margin: "Marge",
        products: "Produits",
        lowStock: "Stock critique"
      }
    },
    products: {
      title: "Gestion des produits",
      create: "Nouveau produit"
    }
  },
  en: {
    appName: "TREXBYTE ERP",
    nav: {
      dashboard: "Dashboard",
      products: "Products",
      categories: "Categories",
      stock: "Stock",
      suppliers: "Suppliers",
      purchases: "Purchases",
      sales: "Sales",
      invoices: "Invoices",
      reports: "Reports",
      settings: "Settings"
    },
    common: {
      language: "Language",
      darkMode: "Dark mode",
      lightMode: "Light mode",
      save: "Save",
      cancel: "Cancel",
      search: "Search",
      create: "Create",
      loading: "Loading...",
      comingSoon: "This section will be available soon"
    },
    dashboard: {
      title: "Performance overview",
      subtitle: "Track sales, stock and margin in real time",
      cards: {
        revenue: "Revenue",
        margin: "Margin",
        products: "Products",
        lowStock: "Low stock"
      }
    },
    products: {
      title: "Product management",
      create: "Create product"
    }
  }
};

export function isRtl(locale: Locale): boolean {
  return locale === "ar";
}
