import { useState, useEffect, Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { uploadToBlob } from "@/lib/blob-upload";
import { ImageUpload, GalleryUpload } from "@/components/image-upload";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Gift,
  Ticket,
  Star,
  Award,
  FileText,
  Menu as MenuIcon,
  MessageSquare,
  Home,
  ChevronLeft,
  Users,
  Shield,
  ScrollText,
  Warehouse,
  Truck,
  Receipt,
  Megaphone,
  Search as SearchIcon,
  Mail,
  Image as ImageIcon,
  Palette,
  Copy,
  Trash2,
  Settings,
  Zap,
  Plug,
  Database,
  Download,
  BarChart3,
  RotateCcw,
  ShoppingCart,
  Eraser,
  Check,
  X,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const EMPTY_PRODUCT = {
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  fragrance_family: "",
  notes_top_str: "",
  notes_heart_str: "",
  notes_base_str: "",
  price_inr: 0,
  compare_at_price_inr: null as number | null,
  volume_ml: 50,
  sku: "",
  stock: 0,
  image_url: "",
  gallery_str: "",
  collection_id: null as string | null,
  is_bestseller: false,
  is_new: false,
  is_published: true,
};

export function ProductsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const { data: products } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: collections } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("*").order("name");
      return data ?? [];
    },
  });

  const filtered = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const saveProduct = async (p: any) => {
    const patch = {
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      fragrance_family: p.fragrance_family,
      notes_top: p.notes_top_str ? p.notes_top_str.split(",").map((s: string) => s.trim()) : [],
      notes_heart: p.notes_heart_str ? p.notes_heart_str.split(",").map((s: string) => s.trim()) : [],
      notes_base: p.notes_base_str ? p.notes_base_str.split(",").map((s: string) => s.trim()) : [],
      price_inr: Number(p.price_inr) || 0,
      compare_at_price_inr: p.compare_at_price_inr ? Number(p.compare_at_price_inr) : null,
      volume_ml: Number(p.volume_ml) || 50,
      sku: p.sku,
      stock: Number(p.stock) || 0,
      image_url: p.image_url,
      gallery: p.gallery_str ? p.gallery_str.split(",").map((s: string) => s.trim()) : [],
      collection_id: p.collection_id || null,
      is_bestseller: p.is_bestseller,
      is_new: p.is_new,
      is_published: p.is_published,
      updated_at: new Date().toISOString(),
    };

    if (p.id) {
      const { error } = await supabase.from("products").update(patch).eq("id", p.id);
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
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Product deleted");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="w-4 h-4 text-cream/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border border-cream/20 pl-9 pr-4 py-2 text-sm text-cream focus:border-gold outline-none"
          />
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_PRODUCT })}
          className="bg-gold text-obsidian px-5 py-2.5 text-[11px] uppercase tracking-[0.24em] font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="border border-cream/10 divide-y divide-cream/10">
        {filtered?.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between hover:bg-cream/[0.02] flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <img src={p.image_url || "/placeholder.svg"} alt={p.name} className="w-12 h-12 object-cover border border-cream/10" />
              <div>
                <h3 className="font-serif text-lg text-cream">{p.name}</h3>
                <p className="text-xs text-cream/40 font-mono">{formatINR(p.price_inr)} · Stock: {p.stock}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${p.is_published ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cream/10 text-cream/40"}`}>
                {p.is_published ? "Published" : "Draft"}
              </span>
              <button onClick={() => setEditing({ ...p, notes_top_str: p.notes_top?.join(", "), notes_heart_str: p.notes_heart?.join(", "), notes_base_str: p.notes_base?.join(", "), gallery_str: p.gallery?.join(", ") })} className="p-2 text-cream/60 hover:text-gold">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => removeProduct(p.id)} className="p-2 text-cream/60 hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian border border-cream/20 p-6 max-w-3xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl text-cream">{editing.id ? "Edit Product" : "New Product"}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Name</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                  className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Slug</label>
                <input
                  type="text"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={editing.price_inr}
                  onChange={(e) => setEditing({ ...editing, price_inr: e.target.value })}
                  className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Stock</label>
                <input
                  type="number"
                  value={editing.stock}
                  onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                  className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-cream/10">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs uppercase tracking-wider text-cream/60 hover:text-cream">
                Cancel
              </button>
              <button onClick={() => saveProduct(editing)} className="bg-gold text-obsidian px-6 py-2 text-xs uppercase tracking-wider font-bold">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CollectionsTab() {
  const qc = useQueryClient();
  const { data: collections } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Organize products into curated fragrance collections.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {collections?.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-cream">{c.name}</h3>
              <p className="text-xs text-cream/40 font-mono">/{c.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlogTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Manage fragrance journal articles and blog posts.</p>
    </div>
  );
}

export function OrdersTab() {
  const { data: orders } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Track customer orders, fulfillment status, and payments.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {orders?.map((o) => (
          <div key={o.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-mono text-sm text-cream font-bold">#{o.order_number || o.id.slice(0, 8)}</h3>
              <p className="text-xs text-cream/40">{new Date(o.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-serif text-gold">{formatINR(o.total_inr)}</p>
              <span className="text-[10px] uppercase tracking-wider text-cream/60">{o.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GiftsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Custom gift box builder configurations.</p>
    </div>
  );
}

export function CouponsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Discount codes and promo offers.</p>
    </div>
  );
}

export function ReviewsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Moderate customer product reviews and ratings.</p>
    </div>
  );
}

export function LoyaltyTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Loyalty points and reward tiers.</p>
    </div>
  );
}

export function HomepageTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Homepage hero banners, announcements, and featured sections.</p>
    </div>
  );
}
