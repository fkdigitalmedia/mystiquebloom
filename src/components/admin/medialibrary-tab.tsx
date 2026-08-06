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

export function MediaLibraryTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("product-images").list("", { limit: 100 });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = files.filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <Panel title="Media Asset Library" subtitle="Browse, search, and upload high-resolution product imagery and storefront graphics.">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <p className="text-cream/60 text-xs">{files.length} media items uploaded</p>
          <input
            type="text"
            placeholder="Search media files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-1.5 text-xs text-cream w-64"
          />
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading media library…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtered.map((f) => {
              const url = supabase.storage.from("product-images").getPublicUrl(f.name).data.publicUrl;
              return (
                <div key={f.id || f.name} className="border border-cream/10 p-2 space-y-2 group relative">
                  <img src={url} alt="" className="w-full h-24 object-cover border border-cream/5" />
                  <p className="text-[10px] text-cream/60 truncate font-mono">{f.name}</p>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}
