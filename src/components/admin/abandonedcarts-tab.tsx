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

export function AbandonedCartsTab() {
  const [search, setSearch] = useState("");
  const [days, setDays] = useState(7);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "abandoned-carts", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data: items } = await supabase
        .from("cart_items")
        .select("id, user_id, product_id, quantity, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false });

      if (!items || items.length === 0) return [];
      const productIds = Array.from(new Set(items.map((i) => i.product_id)));
      const userIds = Array.from(new Set(items.map((i) => i.user_id)));

      const { data: products } = await supabase.from("products").select("id, name, slug, price_inr, image_url").in("id", productIds);
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, phone").in("id", userIds);

      const pMap = new Map((products ?? []).map((p) => [p.id, p]));
      const uMap = new Map((profiles ?? []).map((u) => [u.id, u]));

      return items.map((i) => ({ ...i, product: pMap.get(i.product_id), user: uMap.get(i.user_id) }));
    },
  });

  const filtered = (data ?? []).filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.product?.name.toLowerCase().includes(q) ||
      item.user?.full_name?.toLowerCase().includes(q) ||
      item.user?.email?.toLowerCase().includes(q) ||
      item.user?.phone?.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <Panel title="Abandoned Carts" subtitle="Track unpurchased cart items and engage customers to recover sales.">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex gap-2">
            {[1, 3, 7, 14, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] border ${days === d ? "border-gold text-gold" : "border-cream/15 text-cream/60"}`}
              >
                Last {d}d
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search customer / product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-1.5 text-xs text-cream w-64"
          />
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading abandoned carts…</p>
        ) : filtered.length === 0 ? (
          <p className="text-cream/50 text-xs py-8 text-center">No abandoned carts found for this period.</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10 overflow-x-auto">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4 text-xs min-w-[600px]">
                <div className="flex items-center gap-3">
                  {item.product?.image_url && (
                    <img src={item.product.image_url} alt="" className="w-10 h-10 object-cover border border-cream/10" />
                  )}
                  <div>
                    <p className="font-serif text-cream font-medium">{item.product?.name ?? "Unknown product"}</p>
                    <p className="text-cream/40 text-[10px]">Qty: {item.quantity} · {formatINR((item.product?.price_inr ?? 0) * item.quantity)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-cream font-medium">{item.user?.full_name ?? "Guest User"}</p>
                  <p className="text-cream/40 text-[10px]">{item.user?.email || item.user?.phone || "No contact info"}</p>
                </div>
                <div className="text-right">
                  <p className="text-cream/40 text-[10px]">{new Date(item.created_at).toLocaleString()}</p>
                  {item.user?.email && (
                    <a
                      href={`mailto:${item.user.email}?subject=Your%20Mystique%20Blends%20cart%20is%20waiting&body=Hi%20${encodeURIComponent(item.user.full_name || "")},%20we%20noticed%20you%20left%20${encodeURIComponent(item.product?.name || "an item")}%20in%20your%20cart.`}
                      className="inline-block mt-1 text-[9px] uppercase tracking-[0.24em] text-gold hover:underline"
                    >
                      Send Reminder
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
