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

export function RolesTab() {
  const qc = useQueryClient();
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateRole = async (user_id: string, role: string) => {
    const { error } = await supabase.from("user_roles").upsert({ user_id, role });
    if (error) { toast.error(error.message); return; }
    await logAudit("role_update", "user_roles", user_id, { new_role: role });
    toast.success("Role updated");
    qc.invalidateQueries({ queryKey: ["admin", "roles"] });
  };

  return (
    <div className="space-y-6">
      <Panel title="Team Permissions & Roles" subtitle="Assign staff, manager, and administrative roles to platform team members.">
        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading team roles…</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {roles.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-4 hover:bg-cream/[0.02]">
                <div>
                  <p className="text-sm font-mono text-cream">{r.user_id}</p>
                  <p className="text-xs text-gold uppercase tracking-wider font-bold mt-0.5">{r.role}</p>
                </div>
                <select
                  value={r.role}
                  onChange={(e) => updateRole(r.user_id, e.target.value)}
                  className="bg-obsidian border border-cream/20 px-3 py-1.5 text-xs text-cream focus:border-gold outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
