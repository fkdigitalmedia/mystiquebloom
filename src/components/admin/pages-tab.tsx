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

export function PagesTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin", "pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").order("title");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = async (p: any) => {
    const patch = {
      title: p.title,
      slug: p.slug || slugify(p.title),
      content: p.content,
      is_published: p.is_published,
      updated_at: new Date().toISOString(),
    };

    if (p.id) {
      const { error } = await supabase.from("pages").update(patch).eq("id", p.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Page updated");
    } else {
      const { error } = await supabase.from("pages").insert([patch]);
      if (error) { toast.error(error.message); return; }
      toast.success("Page created");
    }
    qc.invalidateQueries({ queryKey: ["admin", "pages"] });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <Panel title="Static Pages & Policies" subtitle="Manage terms, privacy policy, contact, and about page contents.">
        <div className="flex justify-between items-center mb-4">
          <p className="text-cream/60 text-xs">{pages.length} pages created</p>
          <button
            onClick={() => setEditing({ title: "", slug: "", content: "", is_published: true })}
            className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold hover:opacity-90"
          >
            + Create Page
          </button>
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading pages…</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {pages.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-cream/[0.02]">
                <div>
                  <h3 className="font-serif text-cream text-base">{p.title}</h3>
                  <p className="text-cream/50 text-xs font-mono">/{p.slug}</p>
                </div>
                <button onClick={() => setEditing(p)} className="p-1.5 text-cream/60 hover:text-gold">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="mt-6 border border-gold/30 bg-cream/[0.02] p-5 space-y-4">
            <h3 className="font-serif text-gold text-lg">{editing.id ? "Edit Page" : "Create Page"}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Page Title">
                <Text value={editing.title} onChange={(v) => setEditing({ ...editing, title: v, slug: editing.id ? editing.slug : slugify(v) })} />
              </Field>
              <Field label="Slug">
                <Text value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
              </Field>
            </div>
            <Field label="Page Content (HTML / Markdown)">
              <textarea
                value={editing.content || ""}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                rows={8}
                className="w-full bg-transparent border border-cream/15 text-cream p-3 text-xs font-mono focus:border-gold outline-none"
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <button onClick={() => save(editing)} className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase tracking-[0.24em] font-bold">
                Save Page
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
