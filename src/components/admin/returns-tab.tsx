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

export function ReturnsTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<ReturnStatus | "all">("all");
  const [selected, setSelected] = useState<any | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "returns"],
    queryFn: async () => {
      const { data, error } = await supabase.from("return_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = async (id: string, status: ReturnStatus) => {
    const { error } = await supabase.from("return_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "returns"] });
    toast.success("Return request updated");
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <Panel title="Returns & Exchange Requests" subtitle="Inspect customer return requests, reasons, and process refunds.">
        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "requested", "approved", "rejected", "picked_up", "refunded"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st as any)}
              className={`px-3 py-1 text-[10px] uppercase tracking-[0.28em] border ${filter === st ? "border-gold text-gold" : "border-cream/15 text-cream/60"}`}
            >
              {st}
            </button>
          ))}
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading return requests…</p>
        ) : filtered.length === 0 ? (
          <p className="text-cream/50 text-xs py-8 text-center">No return requests found.</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {filtered.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-cream/[0.02]">
                <div>
                  <h3 className="font-mono text-cream text-base font-bold">Return #{r.id.slice(0, 8)}</h3>
                  <p className="text-cream/50 text-xs font-mono">Order: #{r.order_id} · Reason: {r.reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value as ReturnStatus)}
                    className="bg-obsidian border border-cream/15 text-cream px-3 py-1.5 text-xs focus:border-gold outline-none"
                  >
                    <option value="requested">Requested</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="refunded">Refunded</option>
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
