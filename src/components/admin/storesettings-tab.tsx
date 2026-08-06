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
    try {
      await saveSiteSetting("store", draft);
      setCurrent(draft);
      setDraft(null);
      await logAudit("store_settings_update");
      toast.success("Store settings saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save store settings");
    }
  }

  const s = view.store ?? DEFAULT_STORE.store;

  return (
    <div className="space-y-6">
      <Panel title="Global Store Identity & Legal Compliance" subtitle="Configure legal entity details, support contact info, GSTIN, and business hours.">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Store Display Name">
            <Text value={s.name ?? ""} onChange={(v) => upd("store", { name: v })} />
          </Field>
          <Field label="Legal Business Name">
            <Text value={s.legalName ?? ""} onChange={(v) => upd("store", { legalName: v })} />
          </Field>
          <Field label="Support Email">
            <Text value={s.supportEmail ?? ""} onChange={(v) => upd("store", { supportEmail: v })} />
          </Field>
          <Field label="Support Phone">
            <Text value={s.supportPhone ?? ""} onChange={(v) => upd("store", { supportPhone: v })} />
          </Field>
        </div>

        <div className="flex gap-3 pt-4 border-t border-cream/10">
          <button onClick={save} disabled={!draft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] font-bold disabled:opacity-40">
            Save Store Settings
          </button>
        </div>
      </Panel>
    </div>
  );
}
