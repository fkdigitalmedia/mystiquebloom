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

export function DataBackupTab() {
  const [busy, setBusy] = useState<string | null>(null);

  const download = (filename: string, content: string, mime = "text/csv") => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toCsv = (rows: Record<string, unknown>[]) => {
    if (rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const lines = [headers.join(",")];
    for (const r of rows) {
      lines.push(
        headers
          .map((h) => {
            const v = r[h];
            if (v === null || v === undefined) return '""';
            const s = typeof v === "object" ? JSON.stringify(v) : String(v);
            return `"${s.replace(/"/g, '""')}"`;
          })
          .join(",")
      );
    }
    return lines.join("\n");
  };

  const exportTable = async (table: string) => {
    setBusy(table);
    try {
      const { data, error } = await supabase.from(table as any).select("*");
      if (error) throw error;
      const csv = toCsv((data as any[]) ?? []);
      download(`${table}_${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv");
      toast.success(`Exported ${table} (${(data as any[])?.length ?? 0} rows)`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <Panel title="Data & Database Snapshots" subtitle="Export catalog, orders, and customer records as CSV / JSON backups.">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { table: "products", label: "Catalog Products" },
            { table: "orders", label: "Order History" },
            { table: "profiles", label: "Customer Profiles" },
            { table: "product_reviews", label: "Product Reviews" },
            { table: "gift_boxes", label: "Gift Box Sets" },
            { table: "coupons", label: "Discount Coupons" },
          ].map((item) => (
            <div key={item.table} className="border border-cream/10 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-cream text-base">{item.label}</h3>
                <p className="text-cream/40 text-xs font-mono">{item.table}.csv</p>
              </div>
              <button
                onClick={() => exportTable(item.table)}
                disabled={busy === item.table}
                className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> {busy === item.table ? "Exporting…" : "Download CSV"}
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
