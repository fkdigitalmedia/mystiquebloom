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

export function CollectionsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = async (col: any) => {
    const patch = {
      name: col.name,
      slug: col.slug || slugify(col.name),
      description: col.description,
      image_url: col.image_url,
      hero_banner_url: col.hero_banner_url,
      is_featured: col.is_featured,
    };

    if (col.id) {
      const { error } = await supabase.from("collections").update(patch).eq("id", col.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Collection updated");
    } else {
      const { error } = await supabase.from("collections").insert([patch]);
      if (error) { toast.error(error.message); return; }
      toast.success("Collection created");
    }
    qc.invalidateQueries({ queryKey: ["admin", "collections"] });
    setEditing(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Collection deleted");
    qc.invalidateQueries({ queryKey: ["admin", "collections"] });
  };

  return (
    <div className="space-y-6">
      <Panel title="Fragrance Collections" subtitle="Group perfumes into luxury olfactory ranges (Oud, Floral, Citrus, Niche).">
        <div className="flex justify-between items-center mb-4">
          <p className="text-cream/60 text-xs">{collections.length} active collections</p>
          <button
            onClick={() => setEditing({ name: "", slug: "", description: "", image_url: "", hero_banner_url: "", is_featured: false })}
            className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold hover:opacity-90"
          >
            + Create Collection
          </button>
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading collections…</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {collections.map((col) => (
              <div key={col.id} className="p-4 flex items-center justify-between gap-4 hover:bg-cream/[0.02]">
                <div className="flex items-center gap-4">
                  {col.image_url && (
                    <img src={col.image_url} alt="" className="w-12 h-12 object-cover border border-cream/10" />
                  )}
                  <div>
                    <h3 className="font-serif text-cream text-base">{col.name}</h3>
                    <p className="text-cream/50 text-xs font-mono">/{col.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {col.is_featured && (
                    <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-gold/10 text-gold border border-gold/20 font-bold">
                      Featured
                    </span>
                  )}
                  <button onClick={() => setEditing(col)} className="p-1.5 text-cream/60 hover:text-gold">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(col.id)} className="p-1.5 text-cream/60 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="mt-6 border border-gold/30 bg-cream/[0.02] p-5 space-y-4">
            <h3 className="font-serif text-gold text-lg">{editing.id ? "Edit Collection" : "Create Collection"}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Collection Name">
                <Text value={editing.name} onChange={(v) => setEditing({ ...editing, name: v, slug: editing.id ? editing.slug : slugify(v) })} />
              </Field>
              <Field label="Slug">
                <Text value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
              </Field>
            </div>
            <Field label="Description">
              <Text value={editing.description || ""} onChange={(v) => setEditing({ ...editing, description: v })} />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Card Image URL">
                <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} />
              </Field>
              <Field label="Hero Banner Image URL">
                <ImageUpload value={editing.hero_banner_url} onChange={(url) => setEditing({ ...editing, hero_banner_url: url })} />
              </Field>
            </div>
            <Toggle label="Spotlight on Homepage" checked={editing.is_featured} onChange={(v) => setEditing({ ...editing, is_featured: v })} />

            <div className="flex gap-3 pt-2">
              <button onClick={() => save(editing)} className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase tracking-[0.24em] font-bold">
                Save Collection
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
