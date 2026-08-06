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

export function AuditLogsTab() {
  const [actionFilter, setActionFilter] = useState("all");
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["admin", "audit-logs", actionFilter],
    queryFn: async () => {
      let q = supabase
        .from("audit_logs" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (actionFilter !== "all") q = q.eq("action", actionFilter);
      const { data } = await q;
      return (data as any[]) ?? [];
    },
  });

  const actions = Array.from(new Set(logs.map((l) => l.action))).filter(Boolean);

  return (
    <div className="space-y-6">
      <Panel title="Security & Audit Logs" subtitle="Append-only record of administrative actions, role updates, and system changes.">
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setActionFilter("all")}
            className={`px-3 py-1 text-[10px] uppercase tracking-[0.28em] border ${actionFilter === "all" ? "border-gold text-gold" : "border-cream/15 text-cream/60"}`}
          >
            All Actions ({logs.length})
          </button>
          {actions.map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1 text-[10px] uppercase tracking-[0.28em] border ${actionFilter === act ? "border-gold text-gold" : "border-cream/15 text-cream/60"}`}
            >
              {act}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading audit history…</p>
        ) : logs.length === 0 ? (
          <p className="text-cream/50 text-xs py-8 text-center">No audit log entries recorded yet.</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10 font-mono text-xs overflow-x-auto">
            {logs.map((entry) => (
              <div key={entry.id} className="p-3 flex items-center justify-between gap-4 hover:bg-cream/[0.02] min-w-[700px]">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-gold/10 text-gold border border-gold/20 font-bold">
                    {entry.action}
                  </span>
                  <span className="text-cream/80">{entry.actor_email || entry.actor_id || "System"}</span>
                </div>
                <div className="text-cream/50 text-[11px]">
                  {entry.entity && <span>[{entry.entity}{entry.entity_id ? `:${entry.entity_id}` : ""}]</span>}
                </div>
                <span className="text-cream/40 text-[10px]">{new Date(entry.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
