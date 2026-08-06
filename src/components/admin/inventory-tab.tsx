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

export function InventoryTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, sku, stock, price_inr, image_url").order("stock", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStock = async (id: string, newStock: number) => {
    const { error } = await supabase.from("products").update({ stock: Math.max(0, newStock) }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
    toast.success("Stock level updated");
  };

  const filtered = items.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || (i.sku && i.sku.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <Panel title="Inventory & Stock Control" subtitle="Monitor catalog stock counts, SKU identifiers, and reorder alerts.">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <p className="text-cream/60 text-xs">{items.length} trackable products</p>
          <input
            type="text"
            placeholder="Filter by product or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-1.5 text-xs text-cream w-64"
          />
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading inventory status…</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-cream/[0.02]">
                <div className="flex items-center gap-3">
                  {item.image_url && <img src={item.image_url} alt="" className="w-10 h-10 object-cover border border-cream/10" />}
                  <div>
                    <h3 className="font-serif text-cream text-base">{item.name}</h3>
                    <p className="text-cream/40 text-xs font-mono">SKU: {item.sku || "N/A"} · {formatINR(item.price_inr)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 border ${item.stock < 5 ? "border-rose-500/40 text-rose-400 bg-rose-500/10" : "border-cream/20 text-cream"}`}>
                    {item.stock} in stock
                  </span>
                  <button onClick={() => updateStock(item.id, item.stock + 10)} className="px-2.5 py-1 text-[10px] uppercase tracking-wider border border-gold/40 text-gold hover:bg-gold/10">
                    +10
                  </button>
                  <button onClick={() => updateStock(item.id, item.stock - 1)} className="px-2.5 py-1 text-[10px] uppercase tracking-wider border border-cream/20 text-cream/60 hover:text-cream">
                    -1
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
