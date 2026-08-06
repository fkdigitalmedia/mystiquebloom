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

export function OrdersTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin", "orders", filter],
    queryFn: async () => {
      let q = supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    toast.success("Order status updated");
  };

  return (
    <div className="space-y-6">
      <Panel title="Customer Orders" subtitle="Track orders, update fulfillment status, and inspect payments.">
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 text-[10px] uppercase tracking-[0.28em] border ${filter === st ? "border-gold text-gold" : "border-cream/15 text-cream/60"}`}
            >
              {st}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading orders…</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {orders.map((o) => (
              <div key={o.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-cream/[0.02]">
                <div>
                  <h3 className="font-mono text-cream text-base font-bold">#{o.order_number || o.id.slice(0, 8)}</h3>
                  <p className="text-cream/50 text-xs font-mono">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-serif text-gold text-base">{formatINR(o.total_inr)}</p>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                    className="bg-obsidian border border-cream/15 text-cream px-3 py-1.5 text-xs focus:border-gold outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
