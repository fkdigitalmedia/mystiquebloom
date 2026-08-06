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

export function EmailTemplatesTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<EmailTemplate | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "site_settings", "email_templates"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("key", "email_templates").maybeSingle();
      return data;
    },
  });

  const templates: EmailTemplate[] = ((data?.value as any)?.templates as EmailTemplate[]) ?? DEFAULT_EMAIL_TEMPLATES;

  async function saveTemplate(updated: EmailTemplate) {
    const next = templates.map((t) => (t.id === updated.id ? updated : t));
    await supabase.from("site_settings").upsert({ key: "email_templates", value: { templates: next } as never });
    qc.invalidateQueries({ queryKey: ["admin", "site_settings", "email_templates"] });
    setEditing(null);
    await logAudit("email_template_update", "email_templates", updated.id);
    toast.success("Email template saved");
  }

  if (isLoading) return <p className="text-cream/50 text-sm">Loading email templates…</p>;

  return (
    <div className="space-y-6">
      <Panel title="Email & Notification Templates" subtitle="Customize transactional emails sent for order updates, account actions, and shipping notices.">
        <div className="border border-cream/10 divide-y divide-cream/10">
          {templates.map((tpl) => (
            <div key={tpl.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-cream/[0.02]">
              <div>
                <h3 className="font-serif text-cream text-base">{tpl.name}</h3>
                <p className="text-cream/50 text-xs font-mono">Subject: {tpl.subject}</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setEditing(tpl)} className="p-1.5 text-cream/60 hover:text-gold flex items-center gap-1 text-xs">
                  <Edit className="w-4 h-4" /> Edit Template
                </button>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <div className="mt-6 border border-gold/30 bg-cream/[0.02] p-5 space-y-4">
            <h3 className="font-serif text-gold text-lg">Edit Email Template: {editing.name}</h3>
            <Field label="Subject Line">
              <Text value={editing.subject} onChange={(v) => setEditing({ ...editing, subject: v })} />
            </Field>
            <Field label="Body Content (Supports {{name}}, {{order_id}}, {{total}} placeholders)">
              <textarea
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                rows={6}
                className="w-full bg-transparent border border-cream/15 text-cream p-3 text-xs font-mono focus:border-gold outline-none"
              />
            </Field>
            <Toggle label="Enable Email Dispatch" checked={editing.enabled} onChange={(v) => setEditing({ ...editing, enabled: v })} />

            <div className="flex gap-3 pt-2">
              <button onClick={() => saveTemplate(editing)} className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase tracking-[0.24em] font-bold">
                Save Template
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
