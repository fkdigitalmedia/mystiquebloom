import { useState, useEffect, Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { uploadToBlob } from "@/lib/blob-upload";
import { ImageUpload, GalleryUpload } from "@/components/image-upload";
import {
  logAudit, slugify, Panel, Field, Toggle, Text,
  EMPTY_PRODUCT, Coupon, EMPTY_COUPON, EmailTemplate, DEFAULT_EMAIL_TEMPLATES,
  SeoSettings, BrandingSettings, Automation, StoreSettings, DEFAULT_STORE, deepMergeStore,
  IntegrationRow, DEFAULT_INTEGRATIONS, OrderRow, ReturnStatus
} from "./admin-types";
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Gift, Ticket, Star, Award,
  FileText, Menu as MenuIcon, MessageSquare, Home, ChevronLeft, Users, Shield,
  ScrollText, Warehouse, Truck, Receipt, Megaphone, Search as SearchIcon, Mail,
  Image as ImageIcon, Palette, Copy, Trash2, Settings, Zap, Plug, Database,
  Download, BarChart3, RotateCcw, ShoppingCart, Eraser, Check, X, Plus, Edit,
  Eye, EyeOff, Filter, RefreshCw, ExternalLink, ChevronDown, ChevronUp, AlertTriangle, Send
} from "lucide-react";

export function BrandingTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<BrandingSettings | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site_settings", "branding"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("key", "branding").maybeSingle();
      return data;
    },
  });

  const defaults: BrandingSettings = {
    brandName: "Mystique Blends",
    tagline: "Luxury Perfume Atelier",
    logoUrl: "",
    faviconUrl: "",
    primaryColorHex: "#D4AF37",
    accentColorHex: "#0B0B0B",
  };

  const current: BrandingSettings = { ...defaults, ...((data?.value as any) ?? {}) };
  const view = draft ?? current;

  async function save() {
    if (!draft) return;
    await supabase.from("site_settings").upsert({ key: "branding", value: draft as never });
    qc.invalidateQueries({ queryKey: ["admin", "site_settings", "branding"] });
    setDraft(null);
    await logAudit("branding_update");
    toast.success("Branding settings saved");
  }

  if (isLoading) return <p className="text-cream/50 text-sm">Loading branding…</p>;

  return (
    <div className="space-y-6">
      <Panel title="Brand & Visual Identity" subtitle="Manage storefront logo, primary gold palette, typography, and brand assets.">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Brand Name">
            <Text value={view.brandName} onChange={(v) => setDraft({ ...view, brandName: v })} />
          </Field>
          <Field label="Tagline">
            <Text value={view.tagline} onChange={(v) => setDraft({ ...view, tagline: v })} />
          </Field>
          <Field label="Primary Accent Hex (Gold)">
            <Text value={view.primaryColorHex} onChange={(v) => setDraft({ ...view, primaryColorHex: v })} />
          </Field>
          <Field label="Background Hex (Obsidian)">
            <Text value={view.accentColorHex} onChange={(v) => setDraft({ ...view, accentColorHex: v })} />
          </Field>
        </div>

        <div className="space-y-4 pt-4 border-t border-cream/10">
          <Field label="Primary Logo Image">
            <ImageUpload value={view.logoUrl} onChange={(url) => setDraft({ ...view, logoUrl: url })} />
          </Field>
          <Field label="Favicon Image">
            <ImageUpload value={view.faviconUrl} onChange={(url) => setDraft({ ...view, faviconUrl: url })} />
          </Field>
        </div>

        <div className="flex gap-3 pt-4 border-t border-cream/10">
          <button onClick={save} disabled={!draft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] font-bold disabled:opacity-40">
            Save Brand Identity
          </button>
          {draft && (
            <button onClick={() => setDraft(null)} className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em]">
              Discard
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}
