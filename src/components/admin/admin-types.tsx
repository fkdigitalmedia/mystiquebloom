import { useState, useEffect, Fragment } from "react";
import { supabase } from "@/integrations/supabase/client";

export async function logAudit(action: string, entity?: string, entity_id?: string, details?: any) {
  const { data: userRes } = await supabase.auth.getUser();
  const u = userRes.user;
  await supabase.from("audit_logs" as any).insert({
    actor_id: u?.id ?? null,
    actor_email: u?.email ?? null,
    action,
    entity: entity ?? null,
    entity_id: entity_id ?? null,
    details: details ?? null,
  });
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="border border-cream/10 bg-obsidian p-6 space-y-4">
      <div>
        <h2 className="font-serif text-xl text-gold">{title}</h2>
        {subtitle && <p className="text-cream/50 text-xs mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-wider text-cream/60 block">{label}</label>
      {children}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer border-b border-cream/5">
      <span className="text-sm text-cream">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-gold h-4 w-4" />
    </label>
  );
}

export function Text({ value, onChange, type = "text" }: { value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-2 text-sm text-cream"
    />
  );
}

export const EMPTY_PRODUCT = {
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  fragrance_family: "",
  notes_top_str: "",
  notes_heart_str: "",
  notes_base_str: "",
  price_inr: 0,
  compare_at_price_inr: null as number | null,
  volume_ml: 50,
  sku: "",
  stock: 0,
  image_url: "",
  gallery_str: "",
  collection_id: null as string | null,
  is_bestseller: false,
  is_new: false,
  is_published: true,
};

export type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount: number;
  usage_limit: number | null;
  times_used: number;
  active: boolean;
  expires_at: string | null;
};

export const EMPTY_COUPON: Omit<Coupon, "id" | "times_used"> = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: 10,
  min_order_amount: 0,
  usage_limit: null,
  active: true,
  expires_at: null,
};

export type EmailTemplate = {
  id: string;
  key: string;
  name: string;
  subject: string;
  body: string;
  enabled: boolean;
};

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: "welcome", key: "welcome", name: "Welcome", enabled: true,
    subject: "Welcome to Mystique Blends",
    body: "Dear {{name}},\n\nWelcome to the atelier. Your fragrance journey begins with our curated collection.\n\n— Mystique Blends" },
  { id: "order_placed", key: "order_placed", name: "Order placed", enabled: true,
    subject: "Order confirmed · #{{order_id}}",
    body: "Thank you {{name}}.\n\nWe have received your order #{{order_id}} for {{total}}.\n\nOur atelier will prepare your fragrances with care." },
  { id: "order_shipped", key: "order_shipped", name: "Order shipped", enabled: true,
    subject: "Your order is on its way · #{{order_id}}",
    body: "{{name}}, your order #{{order_id}} has been dispatched. Tracking: {{tracking}}." },
  { id: "order_delivered", key: "order_delivered", name: "Order delivered", enabled: true,
    subject: "Delivered · #{{order_id}}",
    body: "{{name}}, your order #{{order_id}} has been delivered. We would love to hear your thoughts." },
  { id: "order_cancelled", key: "order_cancelled", name: "Order cancelled", enabled: true,
    subject: "Order cancelled · #{{order_id}}",
    body: "{{name}}, your order #{{order_id}} has been cancelled. Any charge will be refunded per our policy." },
  { id: "password_reset", key: "password_reset", name: "Password reset", enabled: true,
    subject: "Reset your Mystique Blends password",
    body: "Click below to reset your password.\n\n{{reset_link}}" },
  { id: "abandoned_cart", key: "abandoned_cart", name: "Abandoned cart", enabled: false,
    subject: "Still thinking it over?",
    body: "{{name}}, your selections are waiting. Return anytime — the atelier keeps your cart safe." },
  { id: "review_request", key: "review_request", name: "Review request", enabled: true,
    subject: "How was your Mystique moment?",
    body: "{{name}}, share your thoughts on {{product}} — your voice guides our craft." },
];

export type SeoSettings = {
  titleSuffix: string;
  defaultTitle: string;
  defaultDescription: string;
  ogImageUrl: string;
  googleSiteVerification: string;
  indexingEnabled: boolean;
};

export type BrandingSettings = {
  brandName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColorHex: string;
  accentColorHex: string;
};

export type Automation = {
  id: string;
  name: string;
  trigger: "abandoned_cart" | "order_delivered" | "user_signup";
  delay_hours: number;
  channel: "email" | "sms" | "whatsapp";
  enabled: boolean;
};

export type StoreSettings = {
  store: { name: string; legalName: string; supportEmail: string; supportPhone: string; businessHours: string };
  orders: { minOrderInr: number; maxItemsPerOrder: number; autoCancelUnpaidHours: number; codEnabled: boolean; prepaidEnabled: boolean };
  returns: { enabled: boolean; windowDays: number; policy: string };
  cart: { abandonHours: number; freeShippingReminder: boolean };
  reviews: { autoApprove: boolean; requirePurchase: boolean; minRating: number };
  compliance: { gstin: string; fssai: string; cin: string; termsUrl: string; privacyUrl: string };
  maintenance: { enabled: boolean; message: string };
};

export const DEFAULT_STORE: StoreSettings = {
  store: { name: "Mystique Blends", legalName: "Mystique Blends Private Limited", supportEmail: "care@mystiqueblends.in", supportPhone: "+91 98765 43210", businessHours: "Mon-Sat 10am-6pm IST" },
  orders: { minOrderInr: 0, maxItemsPerOrder: 20, autoCancelUnpaidHours: 48, codEnabled: true, prepaidEnabled: false },
  returns: { enabled: true, windowDays: 7, policy: "7-day easy returns on unopened luxury perfume boxes." },
  cart: { abandonHours: 24, freeShippingReminder: true },
  reviews: { autoApprove: false, requirePurchase: true, minRating: 1 },
  compliance: { gstin: "", fssai: "", cin: "", termsUrl: "/pages/terms", privacyUrl: "/pages/privacy" },
  maintenance: { enabled: false, message: "We're crafting something special — back shortly." },
};

export function deepMergeStore(defaultObj: StoreSettings, dbObj: any): StoreSettings {
  if (!dbObj || typeof dbObj !== "object") return defaultObj;
  return {
    store: { ...defaultObj.store, ...(dbObj.store || {}) },
    orders: { ...defaultObj.orders, ...(dbObj.orders || {}) },
    returns: { ...defaultObj.returns, ...(dbObj.returns || {}) },
    cart: { ...defaultObj.cart, ...(dbObj.cart || {}) },
    reviews: { ...defaultObj.reviews, ...(dbObj.reviews || {}) },
    compliance: { ...defaultObj.compliance, ...(dbObj.compliance || {}) },
    maintenance: { ...defaultObj.maintenance, ...(dbObj.maintenance || {}) },
  };
}

export type IntegrationRow = {
  id: string;
  name: string;
  category: "payments" | "shipping" | "analytics" | "messaging";
  description: string;
  connected: boolean;
  fields: { key: string; label: string; secret?: boolean }[];
};

export const DEFAULT_INTEGRATIONS: IntegrationRow[] = [
  { id: "razorpay", name: "Razorpay", category: "payments", description: "Accept UPI, cards, netbanking & wallets.", connected: true, fields: [{ key: "key_id", label: "Key ID" }, { key: "key_secret", label: "Key Secret", secret: true }] },
  { id: "shiprocket", name: "Shiprocket", category: "shipping", description: "Automate courier assignment, AWB & tracking.", connected: false, fields: [{ key: "api_user", label: "API User" }, { key: "api_pass", label: "API Password", secret: true }] },
  { id: "meta_pixel", name: "Meta Pixel", category: "analytics", description: "Track PageView, AddToCart, Purchase events.", connected: false, fields: [{ key: "pixel_id", label: "Pixel ID" }] },
  { id: "ga4", name: "Google Analytics 4", category: "analytics", description: "E-commerce web analytics.", connected: false, fields: [{ key: "measurement_id", label: "Measurement ID (G-XXX)" }] },
  { id: "interakt", name: "Interakt WhatsApp", category: "messaging", description: "WhatsApp Business API marketing broadcasts.", connected: false, fields: [{ key: "api_key", label: "API Key", secret: true }] },
];

export type OrderRow = { id: string; created_at: string; total_inr: number; status: string; user_id: string };

export type ReturnStatus = "requested" | "approved" | "rejected" | "picked_up" | "refunded" | "cancelled";
