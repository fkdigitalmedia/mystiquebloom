import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FaqItem = { q: string; a: string };
export type InstagramItem = { image: string; href?: string; caption?: string };
export type TestimonialItem = { quote: string; name: string; role?: string; rating?: number };
export type FamilyItem = { name: string; note?: string; href?: string };
export type OccasionItem = { label: string; href?: string };

export type HomepageSettings = {
  announcements?: string[];
  hero?: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    primaryCtaLabel?: string;
    primaryCtaHref?: string;
    secondaryCtaLabel?: string;
    secondaryCtaHref?: string;
  };
  brandStory?: {
    eyebrow?: string;
    title?: string;
    body?: string;
  };
  newsletter?: {
    title?: string;
    body?: string;
    cta?: string;
  };
  faq?: {
    eyebrow?: string;
    title?: string;
    items?: FaqItem[];
  };
  instagram?: {
    eyebrow?: string;
    title?: string;
    handle?: string;
    items?: InstagramItem[];
  };
  testimonials?: {
    eyebrow?: string;
    title?: string;
    items?: TestimonialItem[];
  };
  families?: {
    eyebrow?: string;
    title?: string;
    occasionsLabel?: string;
    items?: FamilyItem[];
    occasions?: OccasionItem[];
  };
  footerTagline?: string;
};

export function useHomepageSettings() {
  return useQuery({
    queryKey: ["site_settings", "homepage"],
    queryFn: async (): Promise<HomepageSettings> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "homepage")
        .maybeSingle();
      if (error) throw error;
      return (data?.value as HomepageSettings) ?? {};
    },
    staleTime: 60_000,
  });
}

export type LoyaltyTier = { name: string; minPoints: number; perk?: string };
export type LoyaltySettings = {
  earnPerRupee?: number; // spend N rupees per 1 point (default 100)
  redeemCapPct?: number; // % of subtotal max redeemable (default 20)
  pointValue?: number; // ₹ per point (default 1)
  tiers?: LoyaltyTier[];
};

export const DEFAULT_LOYALTY: Required<Omit<LoyaltySettings, "tiers">> & { tiers: LoyaltyTier[] } = {
  earnPerRupee: 100,
  redeemCapPct: 20,
  pointValue: 1,
  tiers: [
    { name: "Ivory", minPoints: 0, perk: "Welcome tier" },
    { name: "Gold", minPoints: 200, perk: "Priority shipping" },
    { name: "Noir", minPoints: 500, perk: "Exclusive launches" },
  ],
};

export function useLoyaltySettings() {
  return useQuery({
    queryKey: ["site_settings", "loyalty"],
    queryFn: async (): Promise<Required<LoyaltySettings>> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "loyalty")
        .maybeSingle();
      if (error) throw error;
      const v = (data?.value as LoyaltySettings) ?? {};
      return {
        earnPerRupee: v.earnPerRupee ?? DEFAULT_LOYALTY.earnPerRupee,
        redeemCapPct: v.redeemCapPct ?? DEFAULT_LOYALTY.redeemCapPct,
        pointValue: v.pointValue ?? DEFAULT_LOYALTY.pointValue,
        tiers: (v.tiers && v.tiers.length ? v.tiers : DEFAULT_LOYALTY.tiers)
          .slice()
          .sort((a, b) => a.minPoints - b.minPoints),
      };
    },
    staleTime: 60_000,
  });
}

export function currentTier(points: number, tiers: LoyaltyTier[]) {
  let match = tiers[0];
  for (const t of tiers) if (points >= t.minPoints) match = t;
  return match;
}

export type LoyaltyPageStep = { n: string; t: string; d: string };
export type LoyaltyPageCta = { label: string; href: string };
export type LoyaltyPageSettings = {
  hero?: {
    eyebrow?: string;
    title?: string;
    titleHighlight?: string;
    subtitle?: string;
    primaryCta?: LoyaltyPageCta;
    secondaryCta?: LoyaltyPageCta;
  };
  ritual?: { eyebrow?: string; title?: string; steps?: LoyaltyPageStep[] };
  tiersSection?: { eyebrow?: string; title?: string };
  cta?: {
    eyebrow?: string;
    title?: string;
    body?: string;
    primary?: LoyaltyPageCta;
    secondary?: LoyaltyPageCta;
  };
};

export const DEFAULT_LOYALTY_PAGE: Required<LoyaltyPageSettings> = {
  hero: {
    eyebrow: "Members Only",
    title: "The Mystique",
    titleHighlight: "Circle",
    subtitle:
      "A quiet privilege for our most discerning patrons. Earn with every acquisition, ascend through three atelier tiers, and unlock rituals reserved for the few.",
    primaryCta: { label: "Join the Circle", href: "/auth" },
    secondaryCta: { label: "Discover Fragrances", href: "/shop" },
  },
  ritual: {
    eyebrow: "The Ritual",
    title: "How the Circle works",
    steps: [
      { n: "01", t: "Acquire", d: "Earn 1 point for every ₹{earnPerRupee} spent across the collection." },
      { n: "02", t: "Ascend", d: "Progress through Ivory, Gold and Noir. Each tier unlocks its own atelier privileges." },
      { n: "03", t: "Redeem", d: "Apply points at checkout — 1 pt = ₹{pointValue}. Redeem up to {redeemCapPct}% of your order." },
    ],
  },
  tiersSection: { eyebrow: "Three Ascensions", title: "Tiers of the Circle" },
  cta: {
    eyebrow: "An Invitation",
    title: "Begin your ascent through the Circle.",
    body: "Every fragrance is a step. Every step, a privilege earned.",
    primary: { label: "Shop the Collection", href: "/shop" },
    secondary: { label: "View Account", href: "/account" },
  },
};

export function useLoyaltyPageSettings() {
  return useQuery({
    queryKey: ["site_settings", "loyalty_page"],
    queryFn: async (): Promise<Required<LoyaltyPageSettings>> => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "loyalty_page")
        .maybeSingle();
      const v = (data?.value as LoyaltyPageSettings) ?? {};
      return {
        hero: { ...DEFAULT_LOYALTY_PAGE.hero, ...(v.hero ?? {}) },
        ritual: {
          ...DEFAULT_LOYALTY_PAGE.ritual,
          ...(v.ritual ?? {}),
          steps: v.ritual?.steps && v.ritual.steps.length ? v.ritual.steps : DEFAULT_LOYALTY_PAGE.ritual.steps,
        },
        tiersSection: { ...DEFAULT_LOYALTY_PAGE.tiersSection, ...(v.tiersSection ?? {}) },
        cta: { ...DEFAULT_LOYALTY_PAGE.cta, ...(v.cta ?? {}) },
      };
    },
    staleTime: 60_000,
  });
}

export type NavItem = { label: string; href: string };
export type NavigationSettings = { primary?: NavItem[] };

export const DEFAULT_NAV: NavItem[] = [
  { label: "Shop All", href: "/shop" },
  { label: "Oud", href: "/shop/oud-reserve" },
  { label: "Attars", href: "/shop/rare-attars" },
  { label: "Gift Box", href: "/gift-builder" },
  { label: "Journal", href: "/blog" },
  { label: "The Circle", href: "/loyalty" },
];

export function useNavigationSettings() {
  return useQuery({
    queryKey: ["site_settings", "navigation"],
    queryFn: async (): Promise<NavItem[]> => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "navigation")
        .maybeSingle();
      const v = (data?.value as NavigationSettings) ?? {};
      return v.primary && v.primary.length ? v.primary : DEFAULT_NAV;
    },
    staleTime: 60_000,
  });
}

export type ShippingZone = { id: string; name: string; regions: string; rate: number; freeAbove: number; etaDays: string };
export type ShippingSettings = {
  freeShippingThreshold?: number;
  expressRate?: number;
  zones?: ShippingZone[];
};

export const DEFAULT_SHIPPING: Required<ShippingSettings> = {
  freeShippingThreshold: 8500,
  expressRate: 250,
  zones: [],
};

export function useShippingSettings() {
  return useQuery({
    queryKey: ["site_settings", "shipping"],
    queryFn: async (): Promise<Required<ShippingSettings>> => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "shipping")
        .maybeSingle();
      const v = (data?.value as any) ?? {};
      return {
        freeShippingThreshold: Number(v.freeShippingThreshold ?? v.freeNThreshold ?? DEFAULT_SHIPPING.freeShippingThreshold),
        expressRate: Number(v.expressRate ?? DEFAULT_SHIPPING.expressRate),
        zones: Array.isArray(v.zones) ? (v.zones as ShippingZone[]) : [],
      };
    },
    staleTime: 60_000,
  });
}

/** Well-known Indian metro PIN prefixes → derive city so a pincode change alone flips the zone. */
const METRO_PIN_PREFIX: Record<string, string> = {
  "110": "delhi", "111": "delhi", "112": "delhi", "113": "delhi", "114": "delhi",
  "201": "delhi", "122": "delhi", // NCR
  "400": "mumbai", "401": "mumbai", "402": "mumbai", "410": "mumbai", "421": "mumbai",
  "560": "bangalore", "561": "bangalore", "562": "bangalore",
  "600": "chennai", "601": "chennai", "602": "chennai", "603": "chennai",
  "700": "kolkata", "711": "kolkata", "712": "kolkata",
  "500": "hyderabad", "501": "hyderabad", "502": "hyderabad",
  "380": "ahmedabad", "382": "ahmedabad",
  "411": "pune", "412": "pune",
};

/** Match a shipping zone. Prefers pincode-derived city so changing the pincode reliably switches zones. */
export function resolveShippingZone(
  zones: ShippingZone[] | undefined,
  addr: { city?: string; state?: string; country?: string; pincode?: string }
): ShippingZone | null {
  if (!zones || zones.length === 0) return null;
  const pin = String(addr.pincode ?? "").replace(/\D/g, "");
  const derivedCity = pin.length >= 3 ? METRO_PIN_PREFIX[pin.slice(0, 3)] : undefined;
  const hay = [derivedCity, addr.city, addr.state, addr.country]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase().trim());

  // If we have a pincode but no metro match, ignore stale city/state entirely
  // and go straight to the fallback zone.
  const pincodeSaysNonMetro = pin.length >= 6 && !derivedCity;

  if (!pincodeSaysNonMetro && hay.length) {
    for (const z of zones) {
      const tokens = String(z.regions || "")
        .split(/[,;\n]+/)
        .map((t) => t.toLowerCase().trim())
        .filter(Boolean);
      // Explicit pincode-prefix tokens (e.g. "400", "110")
      if (pin && tokens.some((t) => /^\d{3,6}$/.test(t) && pin.startsWith(t))) return z;
      if (tokens.some((t) => hay.some((h) => h === t || h.includes(t) || t.includes(h)))) return z;
    }
  }

  const fallback = zones.find((z) => /rest|worldwide|international|all|other/i.test(z.regions + " " + z.name));
  return fallback ?? null;
}



