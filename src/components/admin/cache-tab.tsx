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

export function CacheTab() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [stats, setStats] = useState<{ queries: number; localKeys: number; sessionKeys: number; caches: number; sw: number }>({
    queries: 0, localKeys: 0, sessionKeys: 0, caches: 0, sw: 0,
  });

  const refreshStats = async () => {
    let caches = 0;
    try { if ("caches" in window) caches = (await window.caches.keys()).length; } catch {}
    let sw = 0;
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        sw = regs.length;
      }
    } catch {}

    setStats({
      queries: qc.getQueryCache().getAll().length,
      localKeys: typeof localStorage !== "undefined" ? localStorage.length : 0,
      sessionKeys: typeof sessionStorage !== "undefined" ? sessionStorage.length : 0,
      caches,
      sw,
    });
  };

  useEffect(() => { refreshStats(); }, []);

  const purgeQueryCache = () => {
    setBusy("query");
    qc.clear();
    toast.success("React Query cache cleared");
    setBusy(null);
    refreshStats();
  };

  const purgeLocalStorage = () => {
    if (!confirm("Clear all localStorage keys? (Theme and local session preferences will reset)")) return;
    setBusy("local");
    localStorage.clear();
    toast.success("localStorage purged");
    setBusy(null);
    refreshStats();
  };

  const purgeCaches = async () => {
    setBusy("caches");
    if ("caches" in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((k) => window.caches.delete(k)));
      toast.success(`Purged ${keys.length} CacheStorage instances`);
    }
    setBusy(null);
    refreshStats();
  };

  const unregisterSW = async () => {
    setBusy("sw");
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      toast.success(`Unregistered ${regs.length} service workers`);
    }
    setBusy(null);
    refreshStats();
  };

  return (
    <div className="space-y-6">
      <Panel title="Cache & Storage Purge" subtitle="Flush browser caches, React Query state, service workers, and local storage.">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-cream/10 p-4 space-y-2">
            <h3 className="font-serif text-cream text-base">React Query In-Memory Cache</h3>
            <p className="text-cream/50 text-xs font-mono">{stats.queries} queries cached in memory</p>
            <button onClick={purgeQueryCache} disabled={busy === "query"} className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold">
              Clear Query Cache
            </button>
          </div>
          <div className="border border-cream/10 p-4 space-y-2">
            <div className="border border-cream/10 p-4 space-y-2">
              <h3 className="font-serif text-cream text-base">Browser CacheStorage API</h3>
              <p className="text-cream/50 text-xs font-mono">{stats.caches} cache storage instances</p>
              <button onClick={purgeCaches} disabled={busy === "caches"} className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold">
                Purge CacheStorage
              </button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
