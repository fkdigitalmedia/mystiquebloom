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

export function MessagesTab() {
  const qc = useQueryClient();
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const markRead = async (id: string, is_read: boolean) => {
    const { error } = await supabase.from("contact_submissions").update({ is_read }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "messages"] });
  };

  return (
    <div className="space-y-6">
      <Panel title="Contact Form Inquiries" subtitle="Review customer inquiries, bespoke perfume requests, and support messages.">
        <div className="border border-cream/10 divide-y divide-cream/10">
          {isLoading ? (
            <p className="text-cream/50 text-xs py-8 text-center">Loading contact submissions…</p>
          ) : messages.length === 0 ? (
            <p className="text-cream/50 text-xs py-8 text-center">No contact inquiries received yet.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`p-4 space-y-2 ${msg.is_read ? "opacity-60" : "bg-gold/[0.02]"}`}>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h3 className="font-serif text-base text-cream">{msg.name} ({msg.email})</h3>
                    <p className="text-xs text-cream/40">{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => markRead(msg.id, !msg.is_read)}
                    className={`px-3 py-1 text-[10px] uppercase tracking-wider border ${msg.is_read ? "border-cream/20 text-cream/40" : "border-gold text-gold font-bold"}`}
                  >
                    {msg.is_read ? "Mark Unread" : "Mark Read"}
                  </button>
                </div>
                <p className="text-sm text-cream/80 bg-cream/[0.02] p-3 border border-cream/5 rounded">{msg.message}</p>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
