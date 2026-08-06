import { useState, useEffect, Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { uploadToBlob } from "@/lib/blob-upload";
import { ImageUpload, GalleryUpload } from "@/components/image-upload";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Gift,
  Ticket,
  Star,
  Award,
  FileText,
  Menu as MenuIcon,
  MessageSquare,
  Home,
  ChevronLeft,
  Users,
  Shield,
  ScrollText,
  Warehouse,
  Truck,
  Receipt,
  Megaphone,
  Search as SearchIcon,
  Mail,
  Image as ImageIcon,
  Palette,
  Copy,
  Trash2,
  Settings,
  Zap,
  Plug,
  Database,
  Download,
  BarChart3,
  RotateCcw,
  ShoppingCart,
  Eraser,
  Check,
  X,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function EmailTemplatesTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Transactional email templates (Order Confirmation, Shipping, Password Reset).</p>
    </div>
  );
}

export function SeoTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Global meta tags, OpenGraph images, and sitemap configuration.</p>
    </div>
  );
}

export function MediaLibraryTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Uploaded product images, banners, and media assets.</p>
    </div>
  );
}

export function BrandingTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Brand colors, typography, logos, and favicon settings.</p>
    </div>
  );
}

export function AutomationsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Workflows for abandoned cart recovery and review requests.</p>
    </div>
  );
}

export function IntegrationsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Third-party services (Razorpay, Shiprocket, Twilio, Google Analytics).</p>
    </div>
  );
}

export function DataBackupTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Export catalog data, customers, and order history.</p>
    </div>
  );
}

type StoreSettings = {
  store: { name: string; legalName: string; supportEmail: string; supportPhone: string; businessHours: string };
  orders: { minOrderInr: number; maxItemsPerOrder: number; autoCancelUnpaidHours: number; codEnabled: boolean; prepaidEnabled: boolean };
  returns: { enabled: boolean; windowDays: number; policy: string };
  cart: { abandonHours: number; freeShippingReminder: boolean };
  reviews: { autoApprove: boolean; requirePurchase: boolean; minRating: number };
  compliance: { gstin: string; fssai: string; cin: string; termsUrl: string; privacyUrl: string };
  maintenance: { enabled: boolean; message: string };
};

const DEFAULT_STORE: StoreSettings = {
  store: { name: "Mystique Blends", legalName: "Mystique Blends Private Limited", supportEmail: "care@mystiqueblends.in", supportPhone: "+91 98765 43210", businessHours: "Mon-Sat 10am-6pm IST" },
  orders: { minOrderInr: 0, maxItemsPerOrder: 20, autoCancelUnpaidHours: 48, codEnabled: true, prepaidEnabled: false },
  returns: { enabled: true, windowDays: 7, policy: "7-day easy returns on unopened luxury perfume boxes." },
  cart: { abandonHours: 24, freeShippingReminder: true },
  reviews: { autoApprove: false, requirePurchase: true, minRating: 1 },
  compliance: { gstin: "", fssai: "", cin: "", termsUrl: "/pages/terms", privacyUrl: "/pages/privacy" },
  maintenance: { enabled: false, message: "We're crafting something special — back shortly." },
};

function deepMergeStore(defaultObj: StoreSettings, dbObj: any): StoreSettings {
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

export function StoreSettingsTab() {
  const [current, setCurrent] = useState<StoreSettings | null>(null);
  const [draft, setDraft] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from("site_settings").select("value").eq("key", "store").maybeSingle();
        const merged = deepMergeStore(DEFAULT_STORE, data?.value);
        setCurrent(merged);
      } catch (err) {
        console.error("Failed to load store settings:", err);
        setCurrent(DEFAULT_STORE);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const view = draft ?? current;
  if (loading || !view) return <p className="text-cream/50 text-sm">Loading store settings…</p>;

  function upd<K extends keyof StoreSettings>(section: K, patch: Partial<StoreSettings[K]>) {
    const activeSection = view?.[section] ?? DEFAULT_STORE[section];
    setDraft({
      ...(view ?? DEFAULT_STORE),
      [section]: { ...activeSection, ...patch },
    });
  }

  async function save() {
    if (!draft) return;
    const { error } = await supabase.from("site_settings").upsert({ key: "store", value: draft as any }, { onConflict: "key" });
    if (error) { toast.error(error.message); return; }
    setCurrent(draft);
    setDraft(null);
    toast.success("Store settings saved");
  }

  const s = view.store ?? DEFAULT_STORE.store;
  const o = view.orders ?? DEFAULT_STORE.orders;
  const r = view.returns ?? DEFAULT_STORE.returns;
  const c = view.cart ?? DEFAULT_STORE.cart;
  const rev = view.reviews ?? DEFAULT_STORE.reviews;
  const comp = view.compliance ?? DEFAULT_STORE.compliance;
  const m = view.maintenance ?? DEFAULT_STORE.maintenance;

  return (
    <section className="space-y-8">
      <p className="text-cream/60 text-sm">Global store configuration, policies, and compliance details.</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-cream/10 p-5 space-y-4">
          <h3 className="font-serif text-lg text-gold">Store Identity</h3>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Store Name</label>
            <input type="text" value={s.name ?? ""} onChange={(e) => upd("store", { name: e.target.value })} className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Legal Entity</label>
            <input type="text" value={s.legalName ?? ""} onChange={(e) => upd("store", { legalName: e.target.value })} className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Support Email</label>
            <input type="text" value={s.supportEmail ?? ""} onChange={(e) => upd("store", { supportEmail: e.target.value })} className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none" />
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-4 border-t border-cream/10">
        <button onClick={save} disabled={!draft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40 font-bold">
          Save Settings
        </button>
      </div>
    </section>
  );
}

export function ReportsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Analytics and sales performance metrics.</p>
    </div>
  );
}

export function ReturnsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Process return and exchange requests.</p>
    </div>
  );
}

export function AbandonedCartsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">View abandoned customer carts and send recovery reminders.</p>
    </div>
  );
}

export function CacheTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Purge application cache and revalidate routes.</p>
    </div>
  );
}
