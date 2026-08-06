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

export function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Omit<Coupon, "times_used" | "id"> & { id?: string }) | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing || !editing.code.trim()) return;
    const patch: any = {
      code: editing.code.trim().toUpperCase(),
      description: editing.description,
      discount_type: editing.discount_type,
      discount_value: Number(editing.discount_value) || 0,
      min_order_amount: Number(editing.min_order_amount) || 0,
      usage_limit: editing.usage_limit ? Number(editing.usage_limit) : null,
      active: editing.active,
      expires_at: editing.expires_at || null,
    };
    if (editing.id) {
      const { error } = await supabase.from("coupons").update(patch).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Coupon updated");
    } else {
      const { error } = await supabase.from("coupons").insert([patch]);
      if (error) { toast.error(error.message); return; }
      toast.success("Coupon created");
    }
    await logAudit(editing.id ? "coupon_update" : "coupon_create", "coupons", editing.id, { code: patch.code });
    setEditing(null);
    load();
  }

  const toggle = async (c: Coupon) => {
    await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete coupon code?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    load();
  };

  if (loading) return <p className="text-cream/50 text-sm">Loading coupons…</p>;

  return (
    <div className="space-y-6">
      <Panel title="Promo & Discount Codes" subtitle="Manage promotional vouchers, percentage discounts, and minimum cart amounts.">
        <div className="flex justify-between items-center mb-4">
          <p className="text-cream/60 text-xs">{coupons.length} active coupons</p>
          <button
            onClick={() => setEditing({ ...EMPTY_COUPON })}
            className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold hover:opacity-90"
          >
            + Create Coupon
          </button>
        </div>

        <div className="border border-cream/10 divide-y divide-cream/10">
          {coupons.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-cream/[0.02]">
              <div>
                <h3 className="font-mono text-gold text-base font-bold tracking-wider">{c.code}</h3>
                <p className="text-cream/60 text-xs mt-0.5">
                  {c.discount_type === "percent" ? `${c.discount_value}% OFF` : `${formatINR(c.discount_value)} OFF`} · Min order: {formatINR(c.min_order_amount)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Toggle label={c.active ? "Active" : "Disabled"} checked={c.active} onChange={() => toggle(c)} />
                <button onClick={() => setEditing(c)} className="p-1.5 text-cream/60 hover:text-gold">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => remove(c.id)} className="p-1.5 text-cream/60 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <div className="mt-6 border border-gold/30 bg-cream/[0.02] p-5 space-y-4">
            <h3 className="font-serif text-gold text-lg">{editing.id ? "Edit Coupon" : "Create Coupon"}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Coupon Code">
                <Text value={editing.code} onChange={(v) => setEditing({ ...editing, code: v.toUpperCase() })} />
              </Field>
              <Field label="Discount Type">
                <select
                  value={editing.discount_type}
                  onChange={(e) => setEditing({ ...editing, discount_type: e.target.value as any })}
                  className="w-full bg-obsidian border border-cream/15 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
                >
                  <option value="percent">Percentage OFF (%)</option>
                  <option value="fixed">Fixed Flat OFF (₹)</option>
                </select>
              </Field>
              <Field label="Discount Value">
                <Text type="number" value={String(editing.discount_value)} onChange={(v) => setEditing({ ...editing, discount_value: Number(v) || 0 })} />
              </Field>
              <Field label="Minimum Order INR">
                <Text type="number" value={String(editing.min_order_amount)} onChange={(v) => setEditing({ ...editing, min_order_amount: Number(v) || 0 })} />
              </Field>
            </div>
            <Toggle label="Enable Coupon Immediately" checked={editing.active} onChange={(v) => setEditing({ ...editing, active: v })} />

            <div className="flex gap-3 pt-2">
              <button onClick={save} className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase tracking-[0.24em] font-bold">
                Save Coupon
              </button>
              <button onClick={() => setEditing(null)} className="border border-cream/20 px-4 py-2 text-[10px] uppercase tracking-[0.24em]">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
