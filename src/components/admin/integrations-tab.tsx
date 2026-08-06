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
  SeoSettings, BrandingSettings, Automation, StoreSettings, DEFAULT_STORE, deepMergeStore, saveSiteSetting,
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

export function IntegrationsTab() {
  const qc = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["site_settings", "integrations"],
    queryFn: async (): Promise<IntegrationRow[]> => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "integrations").maybeSingle();
      const saved = (data?.value as { items?: IntegrationRow[] } | null)?.items;
      if (!saved || saved.length === 0) return DEFAULT_INTEGRATIONS;
      return DEFAULT_INTEGRATIONS.map((d) => {
        const found = saved.find((s) => s.id === d.id);
        return found ? { ...d, ...found } : d;
      });
    },
  });

  const toggle = async (id: string) => {
    const next = rows.map((r) => (r.id === id ? { ...r, connected: !r.connected } : r));
    try {
      await saveSiteSetting("integrations", { items: next });
      qc.invalidateQueries({ queryKey: ["site_settings", "integrations"] });
      toast.success("Integration toggled");
    } catch (err: any) {
      toast.error(err.message || "Failed to update integration");
    }
  };

  if (isLoading) return <p className="text-cream/50 text-sm">Loading integrations…</p>;

  return (
    <div className="space-y-6">
      <Panel title="Integrations & API Gateways" subtitle="Connect payment processors, shipping partners, and marketing pixels.">
        <div className="border border-cream/10 divide-y divide-cream/10">
          {rows.map((row) => (
            <div key={row.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-cream/[0.02]">
              <div>
                <h3 className="font-serif text-cream text-base">{row.name}</h3>
                <p className="text-cream/50 text-xs">{row.description}</p>
              </div>
              <Toggle label={row.connected ? "Connected" : "Disconnected"} checked={row.connected} onChange={() => toggle(row.id)} />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
