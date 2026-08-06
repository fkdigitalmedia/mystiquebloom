import { useState, useEffect, Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { uploadToBlob } from "@/lib/blob-upload";
import { ImageUpload, GalleryUpload } from "@/components/image-upload";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Gift,
  Ticket,
  Star,
  Award,
  FileText,
  Menu as MenuIcon,
  MessageSquare,
  Home,
  ChevronLeft,
  Users,
  Shield,
  ScrollText,
  Warehouse,
  Truck,
  Receipt,
  Megaphone,
  Search as SearchIcon,
  Mail,
  Image as ImageIcon,
  Palette,
  Copy,
  Trash2,
  Settings,
  Zap,
  Plug,
  Database,
  Download,
  BarChart3,
  RotateCcw,
  ShoppingCart,
  Eraser,
  Check,
  X,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function PagesTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data: pages } = useQuery({
    queryKey: ["admin", "pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").order("title");
      if (error) throw error;
      return data;
    },
  });

  const save = async (p: any) => {
    const patch = {
      title: p.title,
      slug: p.slug,
      content: p.content,
      is_published: p.is_published,
      updated_at: new Date().toISOString(),
    };

    if (p.id) {
      const { error } = await supabase.from("pages").update(patch).eq("id", p.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Page updated");
    } else {
      const { error } = await supabase.from("pages").insert([patch]);
      if (error) { toast.error(error.message); return; }
      toast.success("Page created");
    }
    qc.invalidateQueries({ queryKey: ["admin", "pages"] });
    setEditing(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this page?")) return;
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Page deleted");
    qc.invalidateQueries({ queryKey: ["admin", "pages"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-cream/60 text-sm">Static content pages (Privacy Policy, About, Terms, etc.).</p>
        <button
          onClick={() => setEditing({ title: "", slug: "", content: "", is_published: true })}
          className="bg-gold text-obsidian px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Page
        </button>
      </div>

      <div className="border border-cream/10 divide-y divide-cream/10">
        {pages?.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between hover:bg-cream/[0.02]">
            <div>
              <h3 className="font-serif text-lg text-cream">{p.title}</h3>
              <p className="text-xs text-cream/40 font-mono">/{p.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${p.is_published ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cream/10 text-cream/40"}`}>
                {p.is_published ? "Published" : "Draft"}
              </span>
              <button onClick={() => setEditing(p)} className="p-2 text-cream/60 hover:text-gold">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => remove(p.id)} className="p-2 text-cream/60 hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian border border-cream/20 p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-serif text-xl text-cream">{editing.id ? "Edit Page" : "New Page"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Title</label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Slug</label>
                <input
                  type="text"
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Content (Markdown / HTML)</label>
                <textarea
                  rows={10}
                  value={editing.content || ""}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  className="w-full bg-transparent border border-cream/20 p-3 text-sm text-cream focus:border-gold outline-none font-mono"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={editing.is_published}
                  onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                  className="accent-gold"
                />
                <span className="text-sm text-cream">Publish page immediately</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-cream/10">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs uppercase tracking-wider text-cream/60 hover:text-cream">
                Cancel
              </button>
              <button onClick={() => save(editing)} className="bg-gold text-obsidian px-6 py-2 text-xs uppercase tracking-wider font-bold">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function NavigationTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data: items } = useQuery({
    queryKey: ["admin", "navigation"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_navigation").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const save = async (item: any) => {
    if (item.id) {
      const { error } = await supabase.from("site_navigation").update(item).eq("id", item.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Navigation item updated");
    } else {
      const { error } = await supabase.from("site_navigation").insert([item]);
      if (error) { toast.error(error.message); return; }
      toast.success("Navigation item created");
    }
    qc.invalidateQueries({ queryKey: ["admin", "navigation"] });
    setEditing(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete navigation item?")) return;
    const { error } = await supabase.from("site_navigation").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Navigation item deleted");
    qc.invalidateQueries({ queryKey: ["admin", "navigation"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-cream/60 text-sm">Header and footer navigation links.</p>
        <button
          onClick={() => setEditing({ label: "", url: "", location: "header", sort_order: (items?.length || 0) + 1 })}
          className="bg-gold text-obsidian px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Nav Link
        </button>
      </div>

      <div className="border border-cream/10 divide-y divide-cream/10">
        {items?.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-cream/[0.02]">
            <div className="flex items-center gap-4">
              <span className="text-xs text-cream/40 font-mono w-6">#{item.sort_order}</span>
              <div>
                <h3 className="font-serif text-base text-cream">{item.label}</h3>
                <p className="text-xs text-cream/40 font-mono">{item.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-cream/10 text-cream/60">
                {item.location}
              </span>
              <button onClick={() => setEditing(item)} className="p-2 text-cream/60 hover:text-gold">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => remove(item.id)} className="p-2 text-cream/60 hover:text-rose-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-obsidian border border-cream/20 p-6 max-w-md w-full space-y-4">
            <h2 className="font-serif text-xl text-cream">{editing.id ? "Edit Link" : "New Link"}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Label</label>
                <input
                  type="text"
                  value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">URL Target</label>
                <input
                  type="text"
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Location</label>
                <select
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  className="w-full bg-obsidian border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none"
                >
                  <option value="header">Header Menu</option>
                  <option value="footer">Footer Menu</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-cream/60 block mb-1">Sort Order</label>
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })}
                  className="w-full bg-transparent border border-cream/20 px-3 py-2 text-sm text-cream focus:border-gold outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-cream/10">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs uppercase tracking-wider text-cream/60 hover:text-cream">
                Cancel
              </button>
              <button onClick={() => save(editing)} className="bg-gold text-obsidian px-6 py-2 text-xs uppercase tracking-wider font-bold">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MessagesTab() {
  const qc = useQueryClient();
  const { data: messages } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const markRead = async (id: string, is_read: boolean) => {
    const { error } = await supabase.from("contact_submissions").update({ is_read }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "messages"] });
  };

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Inbound contact inquiries and customer support messages.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {messages?.map((msg) => (
          <div key={msg.id} className={`p-4 space-y-2 ${msg.is_read ? "opacity-60" : "bg-gold/[0.02]"}`}>
            <div className="flex justify-between items-start">
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
        ))}
      </div>
    </div>
  );
}

export function CustomersTab() {
  const { data: customers } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Registered customer accounts and profiles.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {customers?.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base text-cream">{c.full_name || "Anonymous User"}</h3>
              <p className="text-xs text-cream/40">{c.email || c.phone || c.id}</p>
            </div>
            <span className="text-xs text-cream/40 font-mono">
              Joined {new Date(c.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RolesTab() {
  const qc = useQueryClient();
  const { data: roles } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const updateRole = async (user_id: string, role: string) => {
    const { error } = await supabase.from("user_roles").upsert({ user_id, role });
    if (error) { toast.error(error.message); return; }
    toast.success("Role updated");
    qc.invalidateQueries({ queryKey: ["admin", "roles"] });
  };

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Assign team permissions (Admin, Manager, Staff).</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {roles?.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between">
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
    </div>
  );
}

export function AuditLogsTab() {
  const { data: logs } = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">System security audit trailing administrative actions.</p>
      <div className="border border-cream/10 divide-y divide-cream/10 font-mono text-xs">
        {logs?.map((l) => (
          <div key={l.id} className="p-3 flex items-center justify-between hover:bg-cream/[0.02]">
            <div>
              <span className="text-gold uppercase tracking-wider font-bold">{l.action}</span>
              <span className="text-cream/60 ml-2">{l.entity_type} {l.entity_id}</span>
            </div>
            <span className="text-cream/40">{new Date(l.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InventoryTab() {
  const { data: items } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, sku, stock").order("stock");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Catalog stock levels and inventory alerts.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {items?.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base text-cream">{item.name}</h3>
              <p className="text-xs text-cream/40 font-mono">SKU: {item.sku || "N/A"}</p>
            </div>
            <span className={`text-sm font-mono font-bold px-3 py-1 border ${item.stock < 5 ? "border-rose-500/40 text-rose-400 bg-rose-500/10" : "border-cream/20 text-cream"}`}>
              {item.stock} in stock
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ShippingTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Shipping rates and delivery zone configurations.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Truck className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Standard Nationwide Delivery</h3>
        <p className="text-xs text-cream/60">Flat ₹99 shipping across India. Free shipping on orders above ₹1,999.</p>
      </div>
    </div>
  );
}

export function TaxesTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">GST rate settings and tax invoices.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Receipt className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">18% Luxury Fragrance GST</h3>
        <p className="text-xs text-cream/60">All product prices listed in the catalog are inclusive of 18% GST.</p>
      </div>
    </div>
  );
}

export function MarketingTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">SMS & WhatsApp promotional broadcasts.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Megaphone className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Customer Broadcasts</h3>
        <p className="text-xs text-cream/60">Connect Interakt or LimeChat in Integrations tab to send automated WhatsApp broadcasts.</p>
      </div>
    </div>
  );
}
