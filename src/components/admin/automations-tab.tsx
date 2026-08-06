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

export function AutomationsTab() {
  const [rules, setRules] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Automation | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("value").eq("key", "automations").maybeSingle();
    setRules(((data?.value as any)?.rules ?? []) as Automation[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(next: Automation[]) {
    try {
      await saveSiteSetting("automations", { rules: next });
      setRules(next);
      await logAudit("automations_update");
      toast.success("Automations saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save automations");
    }
  }

  const toggle = (id: string) => {
    const next = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    save(next);
  };

  const remove = (id: string) => {
    const next = rules.filter((r) => r.id !== id);
    save(next);
  };

  const saveRule = () => {
    if (!editing || !editing.name.trim()) return;
    const exists = rules.find((r) => r.id === editing.id);
    const next = exists ? rules.map((r) => (r.id === editing.id ? editing : r)) : [...rules, editing];
    save(next);
    setEditing(null);
  };

  if (loading) return <p className="text-cream/50 text-sm">Loading automations…</p>;

  return (
    <div className="space-y-6">
      <Panel title="Automations & Triggers" subtitle="Configure automated customer engagement workflows across email, SMS, and WhatsApp.">
        <div className="flex justify-between items-center mb-4">
          <p className="text-cream/60 text-xs">{rules.length} active automation rules</p>
          <button
            onClick={() => setEditing({ id: `rule_${Date.now()}`, name: "New Workflow", trigger: "abandoned_cart", delay_hours: 2, channel: "email", enabled: true })}
            className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold hover:opacity-90"
          >
            + Create Rule
          </button>
        </div>

        <div className="border border-cream/10 divide-y divide-cream/10">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-cream/[0.02]">
              <div>
                <h3 className="font-serif text-cream text-base">{rule.name}</h3>
                <p className="text-cream/50 text-xs font-mono">
                  Trigger: <span className="text-gold">{rule.trigger}</span> · Delay: {rule.delay_hours}h · Channel: {rule.channel}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Toggle label={rule.enabled ? "Active" : "Paused"} checked={rule.enabled} onChange={() => toggle(rule.id)} />
                <button onClick={() => setEditing(rule)} className="p-1.5 text-cream/60 hover:text-gold">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => remove(rule.id)} className="p-1.5 text-cream/60 hover:text-rose-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <div className="mt-6 border border-gold/30 bg-cream/[0.02] p-5 space-y-4">
            <h3 className="font-serif text-gold text-lg">{rules.find((r) => r.id === editing.id) ? "Edit Automation Rule" : "Create Automation Rule"}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Rule Name">
                <Text value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              </Field>
              <Field label="Trigger Event">
                <select
                  value={editing.trigger}
                  onChange={(e) => setEditing({ ...editing, trigger: e.target.value as any })}
                  className="w-full bg-obsidian border border-cream/15 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
                >
                  <option value="abandoned_cart">Cart Abandoned</option>
                  <option value="order_delivered">Order Delivered</option>
                  <option value="user_signup">New Customer Signup</option>
                </select>
              </Field>
              <Field label="Delay (Hours)">
                <Text type="number" value={String(editing.delay_hours)} onChange={(v) => setEditing({ ...editing, delay_hours: Number(v) || 0 })} />
              </Field>
              <Field label="Channel">
                <select
                  value={editing.channel}
                  onChange={(e) => setEditing({ ...editing, channel: e.target.value as any })}
                  className="w-full bg-obsidian border border-cream/15 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </Field>
            </div>
            <Toggle label="Enable Automation Rule" checked={editing.enabled} onChange={(v) => setEditing({ ...editing, enabled: v })} />

            <div className="flex gap-3 pt-2">
              <button onClick={saveRule} className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase tracking-[0.24em] font-bold">
                Save Rule
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
