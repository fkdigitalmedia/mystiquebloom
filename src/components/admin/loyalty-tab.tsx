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

export function LoyaltyTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site_settings", "loyalty"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("key", "loyalty").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const defaults = {
    earnPerRupee: 100,
    redeemCapPct: 20,
    bronzePoints: 0,
    silverPoints: 1000,
    goldPoints: 5000,
  };

  const current = { ...defaults, ...((data?.value as any) ?? {}) };
  const view = draft ?? current;

  async function save() {
    if (!draft) return;
    await supabase.from("site_settings").upsert({ key: "loyalty", value: draft as never });
    qc.invalidateQueries({ queryKey: ["admin", "site_settings", "loyalty"] });
    setDraft(null);
    await logAudit("loyalty_update");
    toast.success("Loyalty settings saved");
  }

  if (isLoading) return <p className="text-cream/50 text-sm">Loading loyalty configuration…</p>;

  return (
    <div className="space-y-6">
      <Panel title="Mystique Circle Rewards" subtitle="Configure points earning rate, tier unlocks, and cart redemption rules.">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Earn 1 Point For Every (₹ Spent)">
            <Text type="number" value={String(view.earnPerRupee)} onChange={(v) => setDraft({ ...view, earnPerRupee: Number(v) || 100 })} />
          </Field>
          <Field label="Maximum Cart Redemption Cap (%)">
            <Text type="number" value={String(view.redeemCapPct)} onChange={(v) => setDraft({ ...view, redeemCapPct: Number(v) || 20 })} />
          </Field>
          <Field label="Silver Tier Unlock Points">
            <Text type="number" value={String(view.silverPoints)} onChange={(v) => setDraft({ ...view, silverPoints: Number(v) || 1000 })} />
          </Field>
          <Field label="Gold Tier Unlock Points">
            <Text type="number" value={String(view.goldPoints)} onChange={(v) => setDraft({ ...view, goldPoints: Number(v) || 5000 })} />
          </Field>
        </div>

        <div className="flex gap-3 pt-4 border-t border-cream/10">
          <button onClick={save} disabled={!draft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] font-bold disabled:opacity-40">
            Save Rewards Configuration
          </button>
        </div>
      </Panel>
    </div>
  );
}
