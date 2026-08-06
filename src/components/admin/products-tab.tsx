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

export function ProductsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const saveProduct = async (prod: any) => {
    const patch = {
      name: prod.name,
      slug: prod.slug || slugify(prod.name),
      subtitle: prod.subtitle,
      description: prod.description,
      fragrance_family: prod.fragrance_family,
      price_inr: Number(prod.price_inr) || 0,
      compare_at_price_inr: prod.compare_at_price_inr ? Number(prod.compare_at_price_inr) : null,
      stock: Number(prod.stock) || 0,
      image_url: prod.image_url,
      sku: prod.sku,
      is_published: prod.is_published,
      updated_at: new Date().toISOString(),
    };

    if (prod.id) {
      const { error } = await supabase.from("products").update(patch).eq("id", prod.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert([patch]);
      if (error) { toast.error(error.message); return; }
      toast.success("Product created");
    }
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    setEditing(null);
  };

  const removeProduct = async (id: string) => {
    if (!confirm("Delete this product from catalog?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
  };

  const filtered = products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <Panel title="Product Catalog Management" subtitle="Create, edit, and organize luxury perfumes, pricing, stock, and fragrance notes.">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <p className="text-cream/60 text-xs">{products.length} catalog items</p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-1.5 text-xs text-cream w-48"
            />
            <button
              onClick={() => setEditing({ ...EMPTY_PRODUCT })}
              className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold hover:opacity-90 flex items-center gap-1"
            >
              + Add Product
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading product catalog…</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {filtered.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-cream/[0.02]">
                <div className="flex items-center gap-3">
                  {p.image_url && <img src={p.image_url} alt="" className="w-12 h-12 object-cover border border-cream/10" />}
                  <div>
                    <h3 className="font-serif text-cream text-base">{p.name}</h3>
                    <p className="text-cream/40 text-xs font-mono">{formatINR(p.price_inr)} · Stock: {p.stock} · SKU: {p.sku || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setEditing(p)} className="p-1.5 text-cream/60 hover:text-gold">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeProduct(p.id)} className="p-1.5 text-cream/60 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="mt-6 border border-gold/30 bg-cream/[0.02] p-5 space-y-4">
            <h3 className="font-serif text-gold text-lg">{editing.id ? "Edit Product" : "New Catalog Product"}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Product Name">
                <Text value={editing.name} onChange={(v) => setEditing({ ...editing, name: v, slug: editing.id ? editing.slug : slugify(v) })} />
              </Field>
              <Field label="Slug">
                <Text value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
              </Field>
              <Field label="Price INR">
                <Text type="number" value={String(editing.price_inr)} onChange={(v) => setEditing({ ...editing, price_inr: Number(v) || 0 })} />
              </Field>
              <Field label="Stock Quantity">
                <Text type="number" value={String(editing.stock)} onChange={(v) => setEditing({ ...editing, stock: Number(v) || 0 })} />
              </Field>
            </div>
            <Field label="Product Image URL">
              <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} />
            </Field>
            <Field label="Description">
              <textarea
                value={editing.description || ""}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                rows={4}
                className="w-full bg-transparent border border-cream/15 text-cream p-3 text-xs font-mono focus:border-gold outline-none"
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <button onClick={() => saveProduct(editing)} className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase tracking-[0.24em] font-bold">
                Save Product
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
