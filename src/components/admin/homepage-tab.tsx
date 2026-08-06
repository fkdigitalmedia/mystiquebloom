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

export function HomepageTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site_settings", "homepage"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("key", "homepage").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const value = draft ?? (data?.value as any) ?? {};

  async function save() {
    if (!draft) return;
    try {
      await saveSiteSetting("homepage", draft);
      qc.invalidateQueries({ queryKey: ["admin", "site_settings", "homepage"] });
      setDraft(null);
      await logAudit("homepage_update");
      toast.success("Homepage content saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save homepage settings");
    }
  }

  if (isLoading) return <p className="text-cream/50 text-sm">Loading homepage settings…</p>;

  return (
    <div className="space-y-6">
      <Panel title="Homepage Banner & Hero Controls" subtitle="Customize the main carousel hero banners, announcement bar, and featured collection spotlights.">
        <Field label="Announcement Bar Text">
          <Text value={value.announcementText || ""} onChange={(v) => setDraft({ ...value, announcementText: v })} />
        </Field>
        <Field label="Hero Title">
          <Text value={value.heroTitle || ""} onChange={(v) => setDraft({ ...value, heroTitle: v })} />
        </Field>
        <Field label="Hero Subtitle">
          <Text value={value.heroSubtitle || ""} onChange={(v) => setDraft({ ...value, heroSubtitle: v })} />
        </Field>
        <Field label="Hero Background Image URL">
          <ImageUpload value={value.heroImageUrl || ""} onChange={(url) => setDraft({ ...value, heroImageUrl: url })} />
        </Field>

        <div className="flex gap-3 pt-4 border-t border-cream/10">
          <button onClick={save} disabled={!draft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] font-bold disabled:opacity-40">
            Save Homepage Layout
          </button>
        </div>
      </Panel>
    </div>
  );
}
