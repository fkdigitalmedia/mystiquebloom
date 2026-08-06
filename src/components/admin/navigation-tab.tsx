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

export function NavigationTab() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "navigation"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_navigation").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <Panel title="Navigation Menus" subtitle="Manage storefront header and footer menu links.">
        <div className="border border-cream/10 divide-y divide-cream/10">
          {isLoading ? (
            <p className="text-cream/50 text-xs py-8 text-center">Loading menu links…</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base text-cream">{item.label}</h3>
                  <p className="text-xs text-cream/40 font-mono">{item.url}</p>
                </div>
                <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-cream/10 text-cream/60">
                  {item.location}
                </span>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
