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

export function RolesTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const { data: roleRows, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      if (!roleRows || roleRows.length === 0) return [];

      const userIds = Array.from(new Set(roleRows.map((r) => r.user_id)));
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, avatar_url")
        .in("id", userIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      return roleRows.map((r) => ({
        ...r,
        profile: profileMap.get(r.user_id),
      }));
    },
  });

  const updateRole = async (user_id: string, role: string) => {
    const { error } = await supabase.from("user_roles").upsert({ user_id, role });
    if (error) { toast.error(error.message); return; }
    await logAudit("role_update", "user_roles", user_id, { new_role: role });
    toast.success("Role updated successfully");
    qc.invalidateQueries({ queryKey: ["admin", "roles"] });
  };

  const filtered = roles.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.profile?.full_name?.toLowerCase().includes(q) ||
      r.profile?.email?.toLowerCase().includes(q) ||
      r.profile?.phone?.includes(q) ||
      r.user_id.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <Panel title="Team Permissions & Roles" subtitle="Assign staff, manager, and administrative roles to platform team members.">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <p className="text-cream/60 text-xs">{roles.length} assigned user roles</p>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-1.5 text-xs text-cream w-64"
          />
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading team members & profiles…</p>
        ) : filtered.length === 0 ? (
          <p className="text-cream/50 text-xs py-8 text-center">No user roles found matching search.</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {filtered.map((r) => (
              <div key={r.id || r.user_id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-cream/[0.02]">
                <div className="flex items-center gap-3">
                  {r.profile?.avatar_url ? (
                    <img src={r.profile.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-cream/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-bold text-xs uppercase shrink-0">
                      {(r.profile?.full_name || r.profile?.email || "U").slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-cream text-base font-medium">
                      {r.profile?.full_name || "User Account"}
                    </h3>
                    <p className="text-cream/50 text-xs font-mono">
                      {r.profile?.email || r.profile?.phone || r.user_id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-bold border ${
                    r.role === "admin"
                      ? "bg-gold/10 text-gold border-gold/30"
                      : r.role === "manager"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-cream/10 text-cream/60 border-cream/20"
                  }`}>
                    {r.role}
                  </span>
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
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
