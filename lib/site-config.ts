/** Shared by server and browser: the text the admin can edit on the home page, and template edits. */
export const HOME_KEYS = ["heroTitle", "heroSubtitle", "heroPrimary", "heroSecondary", "heroTrust", "ctaTitle", "ctaSubtitle"] as const;
export type HomeKey = (typeof HOME_KEYS)[number];

export const HOME_DEFAULTS: Record<HomeKey, string> = {
  heroTitle: "Create something they\u2019ll never forget.",
  heroSubtitle: "Turn your memories, wishes, photos and feelings into a beautiful personal website made just for someone special.",
  heroPrimary: "Explore Templates",
  heroSecondary: "How It Works",
  heroTrust: "Personalized \u2022 Shareable \u2022 Made with memories",
  ctaTitle: "Your story. Their moment. One unforgettable experience.",
  ctaSubtitle: "Choose a template and start creating something uniquely yours.",
};

export const HOME_LABELS: Record<HomeKey, { label: string; max: number; long?: boolean }> = {
  heroTitle: { label: "Hero headline", max: 120 },
  heroSubtitle: { label: "Hero text", max: 240, long: true },
  heroPrimary: { label: "Hero main button", max: 30 },
  heroSecondary: { label: "Hero second button", max: 30 },
  heroTrust: { label: "Line under the buttons", max: 80 },
  ctaTitle: { label: "Bottom section headline", max: 120 },
  ctaSubtitle: { label: "Bottom section text", max: 200, long: true },
};

export interface TemplateOverride {
  name?: string;
  description?: string;
  category?: string;
  hidden?: boolean;
  deleted?: boolean;
  /** Tokens needed to generate a website with this template. 0 = free. */
  price?: number;
}

export interface CategoryRow {
  id: string;
  label: string;
  sort: number;
  hidden: boolean;
}

export const PRICING_DEFAULTS = { defaultPrice: 99, minTopup: 99, maxTopup: 9999 };
export type PublicPricing = typeof PRICING_DEFAULTS;

export interface PaymentMethod {
  label: string;
  title: string;
  number: string;
  note: string;
}

export interface PublicConfig {
  home: Partial<Record<HomeKey, string>>;
  templates: Record<string, TemplateOverride>;
  categories: CategoryRow[];
  pricing: PublicPricing;
}
