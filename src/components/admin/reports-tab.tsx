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

export function ReportsTab() {
  const [days, setDays] = useState(30);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["reports", "orders", days],
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total_inr, status, user_id")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as any[]) ?? [];
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.total_inr || 0 : 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      <Panel title="Sales & Performance Analytics" subtitle="Revenue trends, order volumes, and average transaction metrics.">
        <div className="flex gap-2 mb-6">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] border ${days === d ? "border-gold text-gold" : "border-cream/15 text-cream/60"}`}
            >
              Last {d} Days
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Calculating analytics…</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-cream/10 p-5 space-y-1 bg-cream/[0.01]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Gross Revenue</p>
              <h3 className="font-serif text-2xl text-gold">{formatINR(totalRevenue)}</h3>
            </div>
            <div className="border border-cream/10 p-5 space-y-1 bg-cream/[0.01]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Total Orders</p>
              <h3 className="font-serif text-2xl text-cream">{totalOrders}</h3>
            </div>
            <div className="border border-cream/10 p-5 space-y-1 bg-cream/[0.01]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Average Order Value</p>
              <h3 className="font-serif text-2xl text-cream">{formatINR(avgOrderValue)}</h3>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
