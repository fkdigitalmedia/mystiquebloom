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

export function GiftsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data: gifts = [], isLoading } = useQuery({
    queryKey: ["admin", "gifts"],
    queryFn: async () => {
      const { data } = await supabase.from("gift_boxes").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const save = async (g: any) => {
    const patch = {
      name: g.name,
      slug: g.slug || slugify(g.name),
      description: g.description,
      box_type: g.box_type || "discovery_trio",
      price_inr: Number(g.price_inr) || 0,
      image_url: g.image_url,
      is_published: g.is_published,
    };

    if (g.id) {
      const { error } = await supabase.from("gift_boxes").update(patch).eq("id", g.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Gift set updated");
    } else {
      const { error } = await supabase.from("gift_boxes").insert([patch]);
      if (error) { toast.error(error.message); return; }
      toast.success("Gift set created");
    }
    qc.invalidateQueries({ queryKey: ["admin", "gifts"] });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <Panel title="Luxury Gift Sets & Boxes" subtitle="Curate discovery trios, bespoke perfume gift boxes, and seasonal bundles.">
        <div className="flex justify-between items-center mb-4">
          <p className="text-cream/60 text-xs">{gifts.length} gift sets</p>
          <button
            onClick={() => setEditing({ name: "", slug: "", description: "", price_inr: 2999, box_type: "discovery_trio", image_url: "", is_published: true })}
            className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold hover:opacity-90"
          >
            + Create Gift Set
          </button>
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading gift box catalog…</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {gifts.map((g) => (
              <div key={g.id} className="p-4 flex items-center justify-between gap-4 hover:bg-cream/[0.02]">
                <div className="flex items-center gap-4">
                  {g.image_url && <img src={g.image_url} alt="" className="w-12 h-12 object-cover border border-cream/10" />}
                  <div>
                    <h3 className="font-serif text-cream text-base">{g.name}</h3>
                    <p className="text-cream/50 text-xs font-mono">{formatINR(g.price_inr)} · Type: {g.box_type}</p>
                  </div>
                </div>
                <button onClick={() => setEditing(g)} className="p-1.5 text-cream/60 hover:text-gold">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="mt-6 border border-gold/30 bg-cream/[0.02] p-5 space-y-4">
            <h3 className="font-serif text-gold text-lg">{editing.id ? "Edit Gift Set" : "Create Gift Set"}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Box Title">
                <Text value={editing.name} onChange={(v) => setEditing({ ...editing, name: v, slug: editing.id ? editing.slug : slugify(v) })} />
              </Field>
              <Field label="Price INR">
                <Text type="number" value={String(editing.price_inr)} onChange={(v) => setEditing({ ...editing, price_inr: Number(v) || 0 })} />
              </Field>
            </div>
            <Field label="Box Image URL">
              <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} />
            </Field>

            <div className="flex gap-3 pt-2">
              <button onClick={() => save(editing)} className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase tracking-[0.24em] font-bold">
                Save Gift Set
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
