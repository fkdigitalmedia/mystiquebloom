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

export function ReviewsTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin", "reviews", filter],
    queryFn: async () => {
      let q = supabase.from("product_reviews").select("*, products(name, slug)").order("created_at", { ascending: false });
      if (filter === "pending") q = q.eq("approved", false);
      if (filter === "approved") q = q.eq("approved", true);
      const { data } = await q;
      return data ?? [];
    },
  });

  const setApproved = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("product_reviews").update({ approved }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    toast.success(approved ? "Review approved" : "Review unapproved");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    toast.success("Review deleted");
  };

  return (
    <div className="space-y-6">
      <Panel title="Product Reviews & Testimonials" subtitle="Moderate customer ratings, fragrance impressions, and feedback.">
        <div className="flex gap-2 mb-4">
          {(["pending", "approved", "all"] as const).map((st) => (
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
          <p className="text-cream/50 text-xs py-8 text-center">Loading customer reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-cream/50 text-xs py-8 text-center">No reviews found in this filter.</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 space-y-2 hover:bg-cream/[0.02]">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-serif text-cream text-base">{r.author_name} ({r.rating}★)</h3>
                    <p className="text-cream/50 text-xs font-mono">Product: {r.products?.name ?? "General"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setApproved(r.id, !r.approved)}
                      className={`px-3 py-1 text-[10px] uppercase tracking-wider border ${r.approved ? "border-emerald-500/30 text-emerald-400" : "border-gold text-gold font-bold"}`}
                    >
                      {r.approved ? "Approved" : "Approve"}
                    </button>
                    <button onClick={() => remove(r.id)} className="p-1.5 text-cream/60 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-cream/80 italic bg-cream/[0.01] p-3 border border-cream/5">"{r.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
