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
  SeoSettings, BrandingSettings, Automation, StoreSettings, DEFAULT_STORE, deepMergeStore, saveSiteSetting,
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

export function SeoTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<SeoSettings | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site_settings", "seo"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("key", "seo").maybeSingle();
      return data;
    },
  });

  const defaults: SeoSettings = {
    titleSuffix: " · Mystique Blends",
    defaultTitle: "Mystique Blends — Luxury Perfume Atelier",
    defaultDescription: "Curated luxury extraits de parfum, artisanal fragrance boxes, and bespoke scent creation.",
    ogImageUrl: "",
    googleSiteVerification: "",
    indexingEnabled: true,
  };

  const current: SeoSettings = { ...defaults, ...((data?.value as any) ?? {}) };
  const view = draft ?? current;

  async function save() {
    if (!draft) return;
    try {
      await saveSiteSetting("seo", draft);
      qc.invalidateQueries({ queryKey: ["admin", "site_settings", "seo"] });
      setDraft(null);
      await logAudit("seo_update");
      toast.success("SEO settings saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save SEO settings");
    }
  }

  if (isLoading) return <p className="text-cream/50 text-sm">Loading SEO settings…</p>;

  return (
    <div className="space-y-6">
      <Panel title="Search Engine Optimization" subtitle="Manage default page titles, OpenGraph images, and search engine indexing.">
        <div className="space-y-4">
          <Field label="Default Title">
            <Text value={view.defaultTitle} onChange={(v) => setDraft({ ...view, defaultTitle: v })} />
          </Field>
          <Field label="Title Suffix">
            <Text value={view.titleSuffix} onChange={(v) => setDraft({ ...view, titleSuffix: v })} />
          </Field>
          <Field label="Default Meta Description">
            <textarea
              value={view.defaultDescription}
              onChange={(e) => setDraft({ ...view, defaultDescription: e.target.value })}
              rows={3}
              className="w-full bg-transparent border border-cream/15 text-cream p-3 text-xs font-mono focus:border-gold outline-none"
            />
          </Field>
          <Field label="Social Sharing OG Image URL">
            <ImageUpload value={view.ogImageUrl} onChange={(url) => setDraft({ ...view, ogImageUrl: url })} />
          </Field>
        </div>

        <div className="flex gap-3 pt-4 border-t border-cream/10">
          <button onClick={save} disabled={!draft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] font-bold disabled:opacity-40">
            Save SEO Configuration
          </button>
        </div>
      </Panel>
    </div>
  );
}
