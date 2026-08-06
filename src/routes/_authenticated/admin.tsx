import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, Fragment } from "react";
import { SiteHeader } from "@/components/site-header";
import { ImageUpload, GalleryUpload } from "@/components/image-upload";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { uploadToBlob } from "@/lib/blob-upload";
import { AdminDashboard } from "@/components/admin-dashboard";
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
} from "lucide-react";


export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Mystique Blends" },
      { name: "description", content: "Manage the Mystique Blends catalog, journal, and orders." },
      { property: "og:title", content: "Admin · Mystique Blends" },
      { property: "og:description", content: "Admin dashboard." },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "homepage" | "products" | "collections" | "orders" | "blog" | "gifts" | "coupons" | "reviews" | "loyalty" | "pages" | "navigation" | "messages" | "customers" | "roles" | "audit" | "inventory" | "shipping" | "taxes" | "marketing" | "seo" | "emails" | "media" | "branding" | "settings" | "automations" | "integrations" | "data" | "reports" | "returns" | "carts" | "cache";

function AdminPage() {
  const { role, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) return null;

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-obsidian text-cream">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-serif text-4xl mb-4">Admin Access Only</h1>
          <p className="text-cream/60 mb-8">
            You must be granted the admin role to view this page.
          </p>
          <Link
            to="/account"
            className="inline-block bg-gold text-obsidian px-6 py-3 text-[11px] uppercase tracking-[0.28em]"
          >
            Back to Account
          </Link>
        </main>
      </div>
    );
  }

  const NAV: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; group: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
    { id: "reports", label: "Reports", icon: BarChart3, group: "Overview" },
    { id: "orders", label: "Orders", icon: ShoppingBag, group: "Commerce" },
    { id: "returns", label: "Returns", icon: RotateCcw, group: "Commerce" },
    { id: "carts", label: "Abandoned Carts", icon: ShoppingCart, group: "Commerce" },
    { id: "products", label: "Products", icon: Package, group: "Commerce" },
    { id: "collections", label: "Collections", icon: FolderTree, group: "Commerce" },
    { id: "gifts", label: "Gift Boxes", icon: Gift, group: "Commerce" },
    { id: "inventory", label: "Inventory", icon: Warehouse, group: "Operations" },
    { id: "shipping", label: "Shipping", icon: Truck, group: "Operations" },
    { id: "taxes", label: "Taxes", icon: Receipt, group: "Operations" },
    { id: "coupons", label: "Coupons", icon: Ticket, group: "Marketing" },
    { id: "loyalty", label: "Loyalty", icon: Award, group: "Marketing" },
    { id: "reviews", label: "Reviews", icon: Star, group: "Marketing" },
    { id: "marketing", label: "Broadcasts", icon: Megaphone, group: "Marketing" },
    { id: "emails", label: "Email Templates", icon: Mail, group: "Marketing" },
    { id: "seo", label: "SEO", icon: SearchIcon, group: "Marketing" },
    { id: "homepage", label: "Homepage", icon: Home, group: "Content" },
    { id: "blog", label: "Journal", icon: FileText, group: "Content" },
    { id: "pages", label: "Pages", icon: FileText, group: "Content" },
    { id: "navigation", label: "Navigation", icon: MenuIcon, group: "Content" },
    { id: "messages", label: "Messages", icon: MessageSquare, group: "Support" },
    { id: "customers", label: "Customers", icon: Users, group: "People" },
    { id: "roles", label: "Roles & Team", icon: Shield, group: "People" },
    { id: "audit", label: "Audit Logs", icon: ScrollText, group: "People" },
    { id: "media", label: "Media Library", icon: ImageIcon, group: "System" },
    { id: "branding", label: "Branding", icon: Palette, group: "System" },
    { id: "automations", label: "Automations", icon: Zap, group: "System" },
    { id: "integrations", label: "Integrations", icon: Plug, group: "System" },
    { id: "data", label: "Data & Backup", icon: Database, group: "System" },
    { id: "settings", label: "Store Settings", icon: Settings, group: "System" },
    { id: "cache", label: "Cache", icon: Eraser, group: "System" },
  ];

  const grouped = NAV.reduce<Record<string, typeof NAV>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  const activeLabel = NAV.find((n) => n.id === tab)?.label ?? "";

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-64" : "w-16"} shrink-0 border-r border-cream/10 bg-obsidian sticky top-0 h-[calc(100vh-0px)] overflow-y-auto transition-all duration-200 hidden md:block`}
        >
          <div className="flex items-center justify-between px-4 py-5 border-b border-cream/10">
            {sidebarOpen && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.4em] text-gold">Atelier</p>
                <p className="font-serif text-lg leading-tight mt-0.5">Control</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="p-1.5 hover:text-gold text-cream/60"
              aria-label="Toggle sidebar"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`} />
            </button>
          </div>
          <nav className="py-4 space-y-6">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                {sidebarOpen && (
                  <p className="px-4 mb-2 text-[9px] uppercase tracking-[0.32em] text-cream/40">
                    {group}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = tab === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-[11px] uppercase tracking-[0.24em] border-l-2 transition-colors ${
                            active
                              ? "border-gold text-gold bg-gold/[0.04]"
                              : "border-transparent text-cream/60 hover:text-cream hover:bg-cream/[0.02]"
                          }`}
                          title={item.label}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          {sidebarOpen && <span>{item.label}</span>}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-obsidian border-t border-cream/10 overflow-x-auto">
          <div className="flex">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2.5 shrink-0 ${
                    tab === item.id ? "text-gold" : "text-cream/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[9px] uppercase tracking-[0.2em]">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <main className="flex-1 min-w-0 px-4 md:px-8 py-8 md:py-12 pb-24 md:pb-12">
          <div className="mb-6 flex items-baseline justify-between flex-wrap gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40">Admin</p>
              <h1 className="font-serif text-3xl md:text-4xl mt-1">{activeLabel}</h1>
            </div>
          </div>

          {tab === "dashboard" && <AdminDashboard />}
          {tab === "reports" && <ReportsTab />}
          {tab === "homepage" && <HomepageTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "collections" && <CollectionsTab />}
          {tab === "blog" && <BlogTab />}
          {tab === "orders" && <OrdersTab />}
          {tab === "returns" && <ReturnsTab />}
          {tab === "gifts" && <GiftsTab />}
          {tab === "coupons" && <CouponsTab />}
          {tab === "reviews" && <ReviewsTab />}
          {tab === "loyalty" && <LoyaltyTab />}
          {tab === "pages" && <PagesTab />}
          {tab === "navigation" && <NavigationTab />}
          {tab === "messages" && <MessagesTab />}
          {tab === "customers" && <CustomersTab />}
          {tab === "roles" && <RolesTab />}
          {tab === "audit" && <AuditLogsTab />}
          {tab === "inventory" && <InventoryTab />}
          {tab === "shipping" && <ShippingTab />}
          {tab === "taxes" && <TaxesTab />}
          {tab === "marketing" && <MarketingTab />}
          {tab === "emails" && <EmailTemplatesTab />}
          {tab === "seo" && <SeoTab />}
          {tab === "media" && <MediaLibraryTab />}
          {tab === "branding" && <BrandingTab />}
          {tab === "automations" && <AutomationsTab />}
          {tab === "integrations" && <IntegrationsTab />}
          {tab === "data" && <DataBackupTab />}
          {tab === "settings" && <StoreSettingsTab />}
          {tab === "carts" && <AbandonedCartsTab />}
          {tab === "cache" && <CacheTab />}
        </main>
      </div>
    </div>
  );
}


function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const EMPTY_PRODUCT = {
  slug: "",
  name: "",
  subtitle: "",
  description: "",
  fragrance_family: "",
  notes_top_str: "",
  notes_heart_str: "",
  notes_base_str: "",
  price_inr: 0,
  compare_at_price_inr: null as number | null,
  volume_ml: 50,
  sku: "",
  stock: 0,
  image_url: "",
  gallery_str: "",
  collection_id: null as string | null,
  is_bestseller: false,
  is_new: false,
  is_published: true,
};

function ProductsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const { data: products } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: collections } = useQuery({
    queryKey: ["admin", "collections-lite"],
    queryFn: async () => {
      const { data } = await supabase.from("collections").select("id,name,slug").order("name");
      return data ?? [];
    },
  });

  async function updateField(id: string, field: string, value: any) {
    const { error } = await supabase.from("products").update({ [field]: value } as any).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this product? This will also remove it from carts and wishlists.")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    }
  }

  async function save() {
    if (!editing) return;
    if (!editing.name?.trim()) return toast.error("Name is required");
    const slug = (editing.slug?.trim() || slugify(editing.name)).toLowerCase();

    const toArr = (s: string) =>
      (s || "")
        .split(",")
        .map((x: string) => x.trim())
        .filter(Boolean);

    const payload: any = {
      slug,
      name: editing.name.trim(),
      subtitle: editing.subtitle || null,
      description: editing.description || null,
      fragrance_family: editing.fragrance_family || null,
      notes_top: toArr(editing.notes_top_str),
      notes_heart: toArr(editing.notes_heart_str),
      notes_base: toArr(editing.notes_base_str),
      price_inr: Number(editing.price_inr) || 0,
      compare_at_price_inr: editing.compare_at_price_inr ? Number(editing.compare_at_price_inr) : null,
      volume_ml: editing.volume_ml ? Number(editing.volume_ml) : null,
      sku: editing.sku || null,
      stock: Number(editing.stock) || 0,
      image_url: editing.image_url || null,
      gallery: toArr(editing.gallery_str),
      collection_id: editing.collection_id || null,
      is_bestseller: !!editing.is_bestseller,
      is_new: !!editing.is_new,
      is_published: !!editing.is_published,
      seo_title: editing.seo_title || null,
      seo_description: editing.seo_description || null,
      og_image_url: editing.og_image_url || null,
    };

    const q = editing.id
      ? supabase.from("products").update(payload).eq("id", editing.id)
      : supabase.from("products").insert(payload);
    const { error } = await q;
    if (error) toast.error(error.message);
    else {
      toast.success(editing.id ? "Product saved" : "Product created");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    }
  }

  if (editing) {
    return (
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-2xl">
            {editing.id ? "Edit Product" : "New Product"}
          </h2>
          <button
            onClick={() => setEditing(null)}
            className="text-[11px] uppercase tracking-[0.3em] text-cream/60 hover:text-gold"
          >
            ← Back to catalog
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-cream/10 p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">General</p>
              <Field label="Name">
                <input
                  value={editing.name ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      name: e.target.value,
                      slug: editing.id ? editing.slug : slugify(e.target.value),
                    })
                  }
                  className="input-mystique font-serif text-xl"
                  placeholder="Oud Noir"
                />
              </Field>
              <Field label="Slug (URL)">
                <input
                  value={editing.slug ?? ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  className="input-mystique"
                  placeholder="oud-noir"
                />
              </Field>
              <Field label="Subtitle / Tagline">
                <input
                  value={editing.subtitle ?? ""}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                  className="input-mystique"
                  placeholder="A smoky, resinous nightfall"
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={5}
                  className="input-mystique resize-none"
                />
              </Field>
            </div>

            <div className="border border-cream/10 p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Fragrance Notes</p>
              <Field label="Fragrance Family">
                <input
                  value={editing.fragrance_family ?? ""}
                  onChange={(e) => setEditing({ ...editing, fragrance_family: e.target.value })}
                  className="input-mystique"
                  placeholder="Oriental, Woody, Floral..."
                />
              </Field>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Top Notes (comma)">
                  <textarea
                    value={editing.notes_top_str ?? ""}
                    onChange={(e) => setEditing({ ...editing, notes_top_str: e.target.value })}
                    rows={3}
                    className="input-mystique resize-none text-sm"
                    placeholder="Bergamot, Saffron"
                  />
                </Field>
                <Field label="Heart Notes (comma)">
                  <textarea
                    value={editing.notes_heart_str ?? ""}
                    onChange={(e) => setEditing({ ...editing, notes_heart_str: e.target.value })}
                    rows={3}
                    className="input-mystique resize-none text-sm"
                    placeholder="Rose, Jasmine"
                  />
                </Field>
                <Field label="Base Notes (comma)">
                  <textarea
                    value={editing.notes_base_str ?? ""}
                    onChange={(e) => setEditing({ ...editing, notes_base_str: e.target.value })}
                    rows={3}
                    className="input-mystique resize-none text-sm"
                    placeholder="Oud, Amber, Musk"
                  />
                </Field>
              </div>
            </div>

            <div className="border border-cream/10 p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Media</p>
              <ImageUpload
                label="Main Image"
                value={editing.image_url}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
              />
              <GalleryUpload
                value={editing.gallery_str}
                onChange={(val) => setEditing({ ...editing, gallery_str: val })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-cream/10 p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Pricing & Inventory</p>
              <Field label="Price (₹)">
                <input
                  type="number"
                  value={editing.price_inr ?? 0}
                  onChange={(e) => setEditing({ ...editing, price_inr: e.target.value })}
                  className="input-mystique"
                />
              </Field>
              <Field label="Compare-at Price (₹)">
                <input
                  type="number"
                  value={editing.compare_at_price_inr ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, compare_at_price_inr: e.target.value })
                  }
                  className="input-mystique"
                  placeholder="Optional strikethrough price"
                />
              </Field>
              <Field label="Volume (ml)">
                <input
                  type="number"
                  value={editing.volume_ml ?? ""}
                  onChange={(e) => setEditing({ ...editing, volume_ml: e.target.value })}
                  className="input-mystique"
                />
              </Field>
              <Field label="SKU">
                <input
                  value={editing.sku ?? ""}
                  onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                  className="input-mystique"
                />
              </Field>
              <Field label="Stock">
                <input
                  type="number"
                  value={editing.stock ?? 0}
                  onChange={(e) => setEditing({ ...editing, stock: e.target.value })}
                  className="input-mystique"
                />
              </Field>
            </div>

            <div className="border border-cream/10 p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Organization</p>
              <Field label="Collection">
                <select
                  value={editing.collection_id ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, collection_id: e.target.value || null })
                  }
                  className="input-mystique"
                >
                  <option value="">— None —</option>
                  {collections?.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!editing.is_bestseller}
                  onChange={(e) => setEditing({ ...editing, is_bestseller: e.target.checked })}
                  className="accent-gold"
                />
                Bestseller
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!editing.is_new}
                  onChange={(e) => setEditing({ ...editing, is_new: e.target.checked })}
                  className="accent-gold"
                />
                New Arrival
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!editing.is_published}
                  onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                  className="accent-gold"
                />
                Published (visible on storefront)
            </label>
            </div>

            <div className="pt-6 mt-2 border-t border-cream/10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Search Engine Optimization</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label={`SEO Title (${(editing.seo_title ?? "").length}/60)`}>
                  <input
                    value={editing.seo_title ?? ""}
                    onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })}
                    maxLength={70}
                    className="input-mystique"
                    placeholder={`${editing.name || "Product"} · Mystique Blends`}
                  />
                </Field>
                <Field label="Open Graph Image URL (https)">
                  <input
                    value={editing.og_image_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, og_image_url: e.target.value })}
                    className="input-mystique"
                    placeholder="https://…/share.jpg"
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label={`Meta Description (${(editing.seo_description ?? "").length}/160)`}>
                    <textarea
                      value={editing.seo_description ?? ""}
                      onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })}
                      maxLength={200}
                      rows={2}
                      className="input-mystique"
                      placeholder="Falls back to subtitle or description."
                    />
                  </Field>
                </div>
              </div>
            </div>


            <div className="flex flex-col gap-3">
              <button
                onClick={save}
                className="bg-gold text-obsidian px-6 py-3 text-[11px] uppercase tracking-[0.3em]"
              >
                {editing.id ? "Save Changes" : "Create Product"}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-cream/40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const filtered = (products ?? []).filter((p: any) =>
    !search
      ? true
      : (p.name + " " + (p.sku ?? "") + " " + (p.fragrance_family ?? ""))
          .toLowerCase()
          .includes(search.toLowerCase()),
  );

  return (
    <section>
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-mystique w-64"
          />
          <p className="text-sm text-cream/60">{filtered.length} products</p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_PRODUCT })}
          className="bg-gold text-obsidian px-5 py-2.5 text-[11px] uppercase tracking-[0.3em]"
        >
          + Add Product
        </button>
      </div>

      <div className="overflow-x-auto border border-cream/10">
        <table className="w-full text-sm">
          <thead className="bg-graphite/60 text-[10px] uppercase tracking-[0.2em] text-cream/60">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Family</th>
              <th className="text-left p-3">Price ₹</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Best</th>
              <th className="text-left p-3">New</th>
              <th className="text-left p-3">Published</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id} className="border-t border-cream/5">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt=""
                        className="w-10 h-12 object-cover border border-cream/10"
                      />
                    )}
                    <div>
                      <div className="font-serif">{p.name}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-cream/40">
                        {p.sku || p.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-cream/60">{p.fragrance_family}</td>
                <td className="p-3">
                  <input
                    type="number"
                    defaultValue={p.price_inr}
                    onBlur={(e) =>
                      e.target.value !== String(p.price_inr) &&
                      updateField(p.id, "price_inr", Number(e.target.value))
                    }
                    className="w-24 bg-transparent border border-cream/15 px-2 py-1"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    defaultValue={p.stock}
                    onBlur={(e) =>
                      e.target.value !== String(p.stock) &&
                      updateField(p.id, "stock", Number(e.target.value))
                    }
                    className="w-20 bg-transparent border border-cream/15 px-2 py-1"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    defaultChecked={p.is_bestseller}
                    onChange={(e) => updateField(p.id, "is_bestseller", e.target.checked)}
                    className="accent-gold"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    defaultChecked={p.is_new}
                    onChange={(e) => updateField(p.id, "is_new", e.target.checked)}
                    className="accent-gold"
                  />
                </td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    defaultChecked={p.is_published}
                    onChange={(e) => updateField(p.id, "is_published", e.target.checked)}
                    className="accent-gold"
                  />
                </td>
                <td className="p-3 text-right space-x-3 whitespace-nowrap">
                  <button
                    onClick={() =>
                      setEditing({
                        ...p,
                        notes_top_str: (p.notes_top ?? []).join(", "),
                        notes_heart_str: (p.notes_heart ?? []).join(", "),
                        notes_base_str: (p.notes_base ?? []).join(", "),
                        gallery_str: (p.gallery ?? []).join(", "),
                      })
                    }
                    className="text-gold hover:underline text-xs uppercase tracking-[0.2em]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-red-400/80 hover:text-red-400 text-xs uppercase tracking-[0.2em]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-cream/40">
                  No products yet — click "Add Product" to create your first fragrance.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CollectionsTab() {
  const qc = useQueryClient();
  const { data: collections } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  async function update(id: string, field: string, value: any) {
    const { error } = await supabase.from("collections").update({ [field]: value } as any).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "collections"] });
      qc.invalidateQueries({ queryKey: ["home", "collections"] });
    }
  }

  async function uploadImage(id: string, file: File) {
    try {
      const publicUrl = await uploadToBlob(file, "collections");
      await update(id, "image_url", publicUrl);
      toast.success("Image updated");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    }
  }

  async function addCollection() {
    const name = prompt("Collection name?");
    if (!name) return;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("collections").insert({ name, slug, is_published: true } as any);
    if (error) toast.error(error.message);
    else {
      toast.success("Collection created");
      qc.invalidateQueries({ queryKey: ["admin", "collections"] });
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this collection?")) return;
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "collections"] });
      qc.invalidateQueries({ queryKey: ["home", "collections"] });
    }
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-cream/60">Collections shown on homepage's Curated Collections grid and /shop/[slug].</p>
        <button onClick={addCollection} className="px-4 py-2 border border-gold text-gold text-xs uppercase tracking-[0.25em]">
          + New collection
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {collections?.map((c: any) => (
          <div key={c.id} className="border border-cream/10 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{c.slug}</p>
              <button onClick={() => remove(c.id)} className="text-[10px] uppercase tracking-[0.25em] text-cream/40 hover:text-red-400">
                Delete
              </button>
            </div>
            <input
              defaultValue={c.name}
              onBlur={(e) => e.target.value !== c.name && update(c.id, "name", e.target.value)}
              placeholder="Name"
              className="mt-2 w-full bg-transparent font-serif text-2xl border-b border-cream/10 focus:border-gold outline-none pb-1"
            />
            <input
              defaultValue={c.tagline ?? ""}
              onBlur={(e) => update(c.id, "tagline", e.target.value)}
              placeholder="Tagline (e.g. 12 fragrances)"
              className="mt-3 w-full bg-transparent text-sm text-cream/80 border-b border-cream/10 focus:border-gold outline-none pb-1"
            />
            <textarea
              defaultValue={c.description ?? ""}
              onBlur={(e) => update(c.id, "description", e.target.value)}
              rows={3}
              placeholder="Description"
              className="mt-3 w-full bg-transparent text-sm text-cream/70 border border-cream/10 focus:border-gold outline-none p-3 resize-none"
            />

            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-2">Image</p>
              {c.image_url && (
                <img src={c.image_url} alt="" className="w-full aspect-[4/3] object-cover border border-cream/10 mb-2" />
              )}
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && uploadImage(c.id, e.target.files[0])}
                  className="text-xs text-cream/70 file:mr-2 file:py-1 file:px-3 file:bg-gold/10 file:text-gold file:border-0 file:text-[10px] file:uppercase file:tracking-[0.25em]"
                />
                {c.image_url && (
                  <button onClick={() => update(c.id, "image_url", null)} className="text-[10px] uppercase tracking-[0.25em] text-cream/40 hover:text-red-400">
                    Remove
                  </button>
                )}
              </div>
              <input
                defaultValue={c.image_url ?? ""}
                onBlur={(e) => e.target.value !== (c.image_url ?? "") && update(c.id, "image_url", e.target.value || null)}
                placeholder="Or paste image URL"
                className="mt-2 w-full bg-transparent text-xs text-cream/70 border-b border-cream/10 focus:border-gold outline-none pb-1"
              />
            </div>

            <div className="mt-4 flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs text-cream/70">
                <input
                  type="checkbox"
                  defaultChecked={c.is_published}
                  onChange={(e) => update(c.id, "is_published", e.target.checked)}
                  className="accent-gold"
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-xs text-cream/70">
                Sort
                <input
                  type="number"
                  defaultValue={c.sort_order ?? 0}
                  onBlur={(e) => update(c.id, "sort_order", Number(e.target.value) || 0)}
                  className="w-16 bg-transparent border-b border-cream/10 focus:border-gold outline-none text-center"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BlogTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const { data: posts } = useQuery({
    queryKey: ["admin", "blog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function save() {
    if (!editing) return;
    const payload = {
      slug: editing.slug,
      title: editing.title,
      excerpt: editing.excerpt,
      cover_image: editing.cover_image,
      body: editing.body,
      author: editing.author || "Mystique Atelier",
      tags: (editing.tags_str ?? (editing.tags ?? []).join(","))
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean),
      published: !!editing.published,
      published_at: editing.published ? editing.published_at || new Date().toISOString() : null,
    };
    const q = editing.id
      ? supabase.from("blog_posts").update(payload).eq("id", editing.id)
      : supabase.from("blog_posts").insert(payload);
    const { error } = await q;
    if (error) toast.error(error.message);
    else {
      toast.success("Post saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "blog"] });
    }
  }

  if (editing) {
    return (
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-2xl">{editing.id ? "Edit Post" : "New Post"}</h2>
          <button
            onClick={() => setEditing(null)}
            className="text-[11px] uppercase tracking-[0.3em] text-cream/60 hover:text-gold"
          >
            ← Back
          </button>
        </div>
        <div className="grid gap-4 max-w-3xl">
          <Field label="Title">
            <input
              value={editing.title ?? ""}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="input-mystique font-serif text-xl"
            />
          </Field>
          <Field label="Slug (URL)">
            <input
              value={editing.slug ?? ""}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              className="input-mystique"
            />
          </Field>
          <Field label="Cover Image URL">
            <input
              value={editing.cover_image ?? ""}
              onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })}
              className="input-mystique"
            />
          </Field>
          <Field label="Excerpt">
            <textarea
              value={editing.excerpt ?? ""}
              onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
              rows={2}
              className="input-mystique resize-none"
            />
          </Field>
          <Field label="Author">
            <input
              value={editing.author ?? "Mystique Atelier"}
              onChange={(e) => setEditing({ ...editing, author: e.target.value })}
              className="input-mystique"
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <input
              value={editing.tags_str ?? (editing.tags ?? []).join(", ")}
              onChange={(e) => setEditing({ ...editing, tags_str: e.target.value })}
              className="input-mystique"
            />
          </Field>
          <Field label="Body (Markdown)">
            <textarea
              value={editing.body ?? ""}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              rows={16}
              className="input-mystique resize-none font-mono text-sm"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!editing.published}
              onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
              className="accent-gold"
            />
            Published
          </label>
          <div className="flex gap-3">
            <button
              onClick={save}
              className="bg-gold text-obsidian px-6 py-3 text-[11px] uppercase tracking-[0.3em]"
            >
              Save Post
            </button>
            <button
              onClick={() => setEditing(null)}
              className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-cream/40"
            >
              Cancel
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-cream/60">{posts?.length ?? 0} posts</p>
        <button
          onClick={() =>
            setEditing({
              title: "",
              slug: "",
              excerpt: "",
              cover_image: "",
              body: "",
              tags_str: "",
              published: false,
            })
          }
          className="bg-gold text-obsidian px-5 py-2.5 text-[11px] uppercase tracking-[0.3em]"
        >
          + New Post
        </button>
      </div>
      <div className="overflow-x-auto border border-cream/10">
        <table className="w-full text-sm">
          <thead className="bg-graphite/60 text-[10px] uppercase tracking-[0.2em] text-cream/60">
            <tr>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Updated</th>
              <th className="text-left p-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts?.map((p: any) => (
              <tr key={p.id} className="border-t border-cream/5">
                <td className="p-3 font-serif">{p.title}</td>
                <td className="p-3 text-cream/60">{p.slug}</td>
                <td className="p-3">
                  <span className={p.published ? "text-gold" : "text-cream/40"}>
                    {p.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 text-cream/50 text-xs">
                  {new Date(p.updated_at).toLocaleDateString("en-IN")}
                </td>
                <td className="p-3 text-right space-x-3">
                  <button
                    onClick={() => setEditing({ ...p, tags_str: (p.tags ?? []).join(", ") })}
                    className="text-gold hover:underline text-xs uppercase tracking-[0.2em]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="text-red-400/80 hover:text-red-400 text-xs uppercase tracking-[0.2em]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function OrdersTab() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: orders } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  async function updateOrder(id: string, patch: Record<string, any>) {
    const { error } = await (supabase.from("orders") as any).update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    }
  }

  const STATUSES = ["pending", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled"];

  return (
    <section>
      <div className="overflow-x-auto border border-cream/10">
        <table className="w-full text-sm">
          <thead className="bg-graphite/60 text-[10px] uppercase tracking-[0.2em] text-cream/60">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Tracking</th>
              <th className="text-left p-3">Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders?.map((o: any) => (
              <Fragment key={o.id}>
                <tr className="border-t border-cream/5">

                  <td className="p-3 font-serif">{o.order_number}</td>
                  <td className="p-3 text-cream/60">
                    {new Date(o.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-3">
                    <select
                      defaultValue={o.status}
                      onChange={(e) => updateOrder(o.id, { status: e.target.value })}
                      className="bg-transparent border border-cream/15 px-2 py-1 text-gold"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-obsidian">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-cream/70 text-xs">
                    {o.tracking_number ? (
                      <span>
                        <span className="text-gold">{o.courier || "Courier"}</span> · {o.tracking_number}
                      </span>
                    ) : (
                      <span className="text-cream/40">—</span>
                    )}
                  </td>
                  <td className="p-3">{formatINR(o.total_inr)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                      className="text-[10px] uppercase tracking-[0.28em] text-gold gold-underline"
                    >
                      {expanded === o.id ? "Close" : "Tracking"}
                    </button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className="border-t border-cream/5 bg-graphite/30">
                    <td colSpan={6} className="p-4">
                      <TrackingEditor order={o} onSave={(patch) => updateOrder(o.id, patch)} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TrackingEditor({ order, onSave }: { order: any; onSave: (patch: Record<string, any>) => void }) {
  const [courier, setCourier] = useState(order.courier ?? "");
  const [tn, setTn] = useState(order.tracking_number ?? "");
  const [url, setUrl] = useState(order.tracking_url ?? "");
  const [eta, setEta] = useState<string>(order.estimated_delivery ?? "");
  const COURIERS = ["", "Delhivery", "Bluedart", "DTDC", "India Post", "Ekart", "XpressBees", "Shadowfax", "FedEx", "DHL"];
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <label className="text-xs text-cream/60">
        Courier
        <select
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          className="mt-1 w-full bg-transparent border border-cream/15 px-2 py-2 text-cream"
        >
          {COURIERS.map((c) => (
            <option key={c} value={c} className="bg-obsidian">{c || "— Select —"}</option>
          ))}
        </select>
      </label>
      <label className="text-xs text-cream/60">
        AWB / Tracking No.
        <input
          value={tn}
          onChange={(e) => setTn(e.target.value)}
          className="mt-1 w-full bg-transparent border border-cream/15 px-2 py-2 text-cream"
        />
      </label>
      <label className="text-xs text-cream/60 md:col-span-2">
        Tracking URL
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="mt-1 w-full bg-transparent border border-cream/15 px-2 py-2 text-cream"
        />
      </label>
      <label className="text-xs text-cream/60">
        Estimated delivery
        <input
          type="date"
          value={eta ?? ""}
          onChange={(e) => setEta(e.target.value)}
          className="mt-1 w-full bg-transparent border border-cream/15 px-2 py-2 text-cream"
        />
      </label>
      <div className="md:col-span-4 flex justify-end">
        <button
          onClick={() =>
            onSave({
              courier: courier || null,
              tracking_number: tn || null,
              tracking_url: url || null,
              estimated_delivery: eta || null,
            })
          }
          className="bg-gold text-obsidian px-5 py-2 text-[10px] uppercase tracking-[0.28em] hover:bg-cream"
        >
          Save tracking
        </button>
      </div>
    </div>
  );
}


const GIFT_STATUSES = ["saved", "ordered", "processing", "packed", "shipped", "delivered", "cancelled"] as const;

function GiftsTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: gifts } = useQuery({
    queryKey: ["admin", "gifts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("gift_boxes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  const productIds = Array.from(new Set((gifts ?? []).flatMap((g: any) => g.product_ids ?? [])));
  const { data: productMap } = useQuery({
    queryKey: ["admin", "gifts", "products", productIds.sort().join(",")],
    enabled: productIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("products").select("id, name, price_inr").in("id", productIds);
      const m = new Map<string, any>();
      (data ?? []).forEach((p) => m.set(p.id, p));
      return m;
    },
  });

  const userIds = Array.from(new Set((gifts ?? []).map((g: any) => g.user_id).filter(Boolean)));
  const { data: userMap } = useQuery({
    queryKey: ["admin", "gifts", "users", userIds.sort().join(",")],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
      const m = new Map<string, any>();
      (data ?? []).forEach((p) => m.set(p.id, p));
      return m;
    },
  });

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("gift_boxes").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    qc.invalidateQueries({ queryKey: ["admin", "gifts"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this gift box permanently?")) return;
    const { error } = await supabase.from("gift_boxes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "gifts"] });
  }

  const filtered = (gifts ?? []).filter((g: any) => filter === "all" || g.status === filter);
  const counts = (gifts ?? []).reduce((acc: Record<string, number>, g: any) => {
    acc[g.status] = (acc[g.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] border ${filter === "all" ? "border-gold text-gold" : "border-cream/15 text-cream/60 hover:border-cream/30"}`}
        >
          All ({gifts?.length ?? 0})
        </button>
        {GIFT_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] border ${filter === s ? "border-gold text-gold" : "border-cream/15 text-cream/60 hover:border-cream/30"}`}
          >
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.length === 0 && <p className="text-cream/50 text-sm">No gift boxes in this view.</p>}
        {filtered.map((g: any) => {
          const bottles = (g.product_ids ?? []).map((id: string) => productMap?.get(id)).filter(Boolean);
          const cust = g.user_id ? userMap?.get(g.user_id) : null;
          return (
            <div key={g.id} className="border border-cream/10 bg-graphite/30 p-5">
              <div className="flex justify-between items-start mb-3 gap-3">
                <div>
                  <p className="font-serif text-lg">{g.recipient_name || "Anonymous recipient"}</p>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mt-1">
                    {g.box_style} vessel · {g.occasion || "Any occasion"}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-cream/40 mt-1">
                    {cust?.full_name || "Guest"} · {new Date(g.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-[9px] uppercase tracking-[0.28em] px-2 py-1 border shrink-0 ${
                    g.status === "delivered"
                      ? "text-emerald-300 border-emerald-500/40"
                      : g.status === "cancelled"
                        ? "text-red-300 border-red-500/40"
                        : g.status === "saved"
                          ? "text-cream/60 border-cream/20"
                          : "text-gold border-gold/40"
                  }`}
                >
                  {g.status}
                </span>
              </div>

              {bottles.length > 0 && (
                <ul className="text-xs text-cream/70 space-y-1 mb-3 border-t border-cream/5 pt-3">
                  {bottles.map((p: any) => (
                    <li key={p.id} className="flex justify-between">
                      <span className="font-serif">{p.name}</span>
                      <span>{formatINR(p.price_inr)}</span>
                    </li>
                  ))}
                </ul>
              )}

              {g.message && (
                <p className="italic text-cream/70 text-sm border-l-2 border-gold/40 pl-3 mb-3">"{g.message}"</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-cream/10">
                <span className="font-serif text-gold">{formatINR(g.total)}</span>
                <div className="flex items-center gap-2">
                  <select
                    value={g.status}
                    onChange={(e) => updateStatus(g.id, e.target.value)}
                    className="bg-obsidian border border-cream/15 text-cream text-[10px] uppercase tracking-[0.24em] px-2 py-1.5 focus:border-gold outline-none"
                  >
                    {GIFT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {g.message && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(g.message);
                        toast.success("Message copied");
                      }}
                      className="px-2.5 py-1.5 text-[10px] uppercase tracking-[0.24em] border border-cream/15 hover:border-gold hover:text-gold"
                    >
                      Copy note
                    </button>
                  )}
                  <button
                    onClick={() => remove(g.id)}
                    className="px-2.5 py-1.5 text-[10px] uppercase tracking-[0.24em] border border-red-500/30 text-red-300 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HomepageTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<any | null>(null);
  const { data } = useQuery({
    queryKey: ["admin", "site_settings", "homepage"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "homepage")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const value = draft ?? (data?.value as any) ?? {};

  function set(path: string[], v: any) {
    const next = JSON.parse(JSON.stringify(value));
    let node = next;
    for (let i = 0; i < path.length - 1; i++) {
      node[path[i]] = node[path[i]] ?? {};
      node = node[path[i]];
    }
    node[path[path.length - 1]] = v;
    setDraft(next);
  }

  async function save() {
    const payload = { key: "homepage", value };
    const q = data?.id
      ? supabase.from("site_settings").update({ value }).eq("id", data.id)
      : supabase.from("site_settings").insert(payload);
    const { error } = await q;
    if (error) toast.error(error.message);
    else {
      toast.success("Homepage saved");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin", "site_settings", "homepage"] });
      qc.invalidateQueries({ queryKey: ["site_settings", "homepage"] });
    }
  }

  const announcements: string[] = value.announcements ?? [];
  const hero = value.hero ?? {};
  const story = value.brandStory ?? {};
  const news = value.newsletter ?? {};
  const faq = value.faq ?? {};
  const faqItems: { q: string; a: string }[] = faq.items ?? [];
  const ig = value.instagram ?? {};
  const igItems: { image: string; href?: string; caption?: string }[] = ig.items ?? [];
  const testimonials = value.testimonials ?? {};
  const tItems: { quote: string; name: string; role?: string; rating?: number }[] = testimonials.items ?? [];
  const families = value.families ?? {};
  const famItems: { name: string; note?: string; href?: string }[] = families.items ?? [];
  const occItems: { label: string; href?: string }[] = families.occasions ?? [];

  return (
    <section className="max-w-3xl">
      <p className="text-sm text-cream/60 mb-8">
        Edit the homepage announcement bar, hero, brand story, and newsletter. Changes go live instantly.
      </p>

      <div className="space-y-10">
        <div>
          <h3 className="font-serif text-2xl mb-4">Announcement Bar</h3>
          <p className="text-xs text-cream/50 mb-3">Messages rotate every few seconds.</p>
          <div className="space-y-2">
            {announcements.map((a, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  value={a}
                  onChange={(e) => {
                    const next = [...announcements];
                    next[idx] = e.target.value;
                    set(["announcements"], next);
                  }}
                  className="input-mystique flex-1"
                />
                <button
                  onClick={() => set(["announcements"], announcements.filter((_, i) => i !== idx))}
                  className="px-3 border border-cream/15 hover:border-red-400/60 text-cream/60 hover:text-red-400 text-xs uppercase tracking-[0.2em]"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => set(["announcements"], [...announcements, ""])}
              className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
            >
              + Add message
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl mb-4">Hero</h3>
          <div className="grid gap-4">
            <Field label="Eyebrow">
              <input value={hero.eyebrow ?? ""} onChange={(e) => set(["hero", "eyebrow"], e.target.value)} className="input-mystique" />
            </Field>
            <Field label="Title">
              <input value={hero.title ?? ""} onChange={(e) => set(["hero", "title"], e.target.value)} className="input-mystique font-serif text-xl" />
            </Field>
            <Field label="Subtitle">
              <textarea value={hero.subtitle ?? ""} onChange={(e) => set(["hero", "subtitle"], e.target.value)} rows={3} className="input-mystique resize-none" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary CTA Label">
                <input value={hero.primaryCtaLabel ?? ""} onChange={(e) => set(["hero", "primaryCtaLabel"], e.target.value)} className="input-mystique" />
              </Field>
              <Field label="Primary CTA Link">
                <input value={hero.primaryCtaHref ?? ""} onChange={(e) => set(["hero", "primaryCtaHref"], e.target.value)} className="input-mystique" />
              </Field>
              <Field label="Secondary CTA Label">
                <input value={hero.secondaryCtaLabel ?? ""} onChange={(e) => set(["hero", "secondaryCtaLabel"], e.target.value)} className="input-mystique" />
              </Field>
              <Field label="Secondary CTA Link">
                <input value={hero.secondaryCtaHref ?? ""} onChange={(e) => set(["hero", "secondaryCtaHref"], e.target.value)} className="input-mystique" />
              </Field>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl mb-4">Brand Story</h3>
          <div className="grid gap-4">
            <Field label="Eyebrow">
              <input value={story.eyebrow ?? ""} onChange={(e) => set(["brandStory", "eyebrow"], e.target.value)} className="input-mystique" />
            </Field>
            <Field label="Title">
              <input value={story.title ?? ""} onChange={(e) => set(["brandStory", "title"], e.target.value)} className="input-mystique font-serif text-xl" />
            </Field>
            <Field label="Body">
              <textarea value={story.body ?? ""} onChange={(e) => set(["brandStory", "body"], e.target.value)} rows={5} className="input-mystique resize-none" />
            </Field>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl mb-4">Newsletter</h3>
          <div className="grid gap-4">
            <Field label="Title">
              <input value={news.title ?? ""} onChange={(e) => set(["newsletter", "title"], e.target.value)} className="input-mystique font-serif text-xl" />
            </Field>
            <Field label="Body">
              <textarea value={news.body ?? ""} onChange={(e) => set(["newsletter", "body"], e.target.value)} rows={3} className="input-mystique resize-none" />
            </Field>
            <Field label="Button Label">
              <input value={news.cta ?? ""} onChange={(e) => set(["newsletter", "cta"], e.target.value)} className="input-mystique" />
            </Field>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl mb-4">FAQ</h3>
          <div className="grid gap-4 mb-4">
            <Field label="Eyebrow">
              <input value={faq.eyebrow ?? ""} onChange={(e) => set(["faq", "eyebrow"], e.target.value)} className="input-mystique" />
            </Field>
            <Field label="Section Title">
              <input value={faq.title ?? ""} onChange={(e) => set(["faq", "title"], e.target.value)} className="input-mystique font-serif text-xl" />
            </Field>
          </div>
          <div className="space-y-3">
            {faqItems.map((it, idx) => (
              <div key={idx} className="border border-cream/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Question {idx + 1}</span>
                  <button
                    onClick={() => set(["faq", "items"], faqItems.filter((_, i) => i !== idx))}
                    className="text-[10px] uppercase tracking-[0.2em] text-cream/50 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
                <input
                  value={it.q}
                  placeholder="Question"
                  onChange={(e) => {
                    const next = [...faqItems];
                    next[idx] = { ...next[idx], q: e.target.value };
                    set(["faq", "items"], next);
                  }}
                  className="input-mystique w-full"
                />
                <textarea
                  value={it.a}
                  placeholder="Answer"
                  rows={3}
                  onChange={(e) => {
                    const next = [...faqItems];
                    next[idx] = { ...next[idx], a: e.target.value };
                    set(["faq", "items"], next);
                  }}
                  className="input-mystique w-full resize-none"
                />
              </div>
            ))}
            <button
              onClick={() => set(["faq", "items"], [...faqItems, { q: "", a: "" }])}
              className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
            >
              + Add question
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl mb-4">Instagram Feed</h3>
          <div className="grid gap-4 mb-4">
            <Field label="Eyebrow">
              <input value={ig.eyebrow ?? ""} onChange={(e) => set(["instagram", "eyebrow"], e.target.value)} className="input-mystique" />
            </Field>
            <Field label="Section Title">
              <input value={ig.title ?? ""} onChange={(e) => set(["instagram", "title"], e.target.value)} className="input-mystique font-serif text-xl" />
            </Field>
            <Field label="Profile URL">
              <input value={ig.handle ?? ""} onChange={(e) => set(["instagram", "handle"], e.target.value)} placeholder="https://instagram.com/mystiqueblends" className="input-mystique" />
            </Field>
          </div>
          <div className="space-y-3">
            {igItems.map((it, idx) => (
              <div key={idx} className="border border-cream/10 p-4 flex gap-3">
                {it.image && (
                  <img src={it.image} alt="" className="w-20 h-20 object-cover shrink-0" />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Post {idx + 1}</span>
                    <button
                      onClick={() => set(["instagram", "items"], igItems.filter((_, i) => i !== idx))}
                      className="text-[10px] uppercase tracking-[0.2em] text-cream/50 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <ImageUpload
                    value={it.image}
                    onChange={(url) => {
                      const next = [...igItems];
                      next[idx] = { ...next[idx], image: url };
                      set(["instagram", "items"], next);
                    }}
                  />
                  <input
                    value={it.href ?? ""}
                    placeholder="Post link (optional)"
                    onChange={(e) => {
                      const next = [...igItems];
                      next[idx] = { ...next[idx], href: e.target.value };
                      set(["instagram", "items"], next);
                    }}
                    className="input-mystique w-full"
                  />
                  <input
                    value={it.caption ?? ""}
                    placeholder="Caption (optional)"
                    onChange={(e) => {
                      const next = [...igItems];
                      next[idx] = { ...next[idx], caption: e.target.value };
                      set(["instagram", "items"], next);
                    }}
                    className="input-mystique w-full"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => set(["instagram", "items"], [...igItems, { image: "" }])}
              className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
            >
              + Add post
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl mb-4">Testimonials</h3>
          <div className="grid gap-4 mb-4">
            <Field label="Eyebrow">
              <input value={testimonials.eyebrow ?? ""} onChange={(e) => set(["testimonials", "eyebrow"], e.target.value)} className="input-mystique" />
            </Field>
            <Field label="Section Title">
              <input value={testimonials.title ?? ""} onChange={(e) => set(["testimonials", "title"], e.target.value)} className="input-mystique font-serif text-xl" />
            </Field>
          </div>
          <div className="space-y-3">
            {tItems.map((t, idx) => (
              <div key={idx} className="border border-cream/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Testimonial {idx + 1}</span>
                  <button
                    onClick={() => set(["testimonials", "items"], tItems.filter((_, i) => i !== idx))}
                    className="text-[10px] uppercase tracking-[0.2em] text-cream/50 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={t.quote}
                  placeholder="Quote"
                  rows={3}
                  onChange={(e) => {
                    const next = [...tItems];
                    next[idx] = { ...next[idx], quote: e.target.value };
                    set(["testimonials", "items"], next);
                  }}
                  className="input-mystique w-full resize-none"
                />
                <div className="grid md:grid-cols-3 gap-2">
                  <input
                    value={t.name}
                    placeholder="Name"
                    onChange={(e) => {
                      const next = [...tItems];
                      next[idx] = { ...next[idx], name: e.target.value };
                      set(["testimonials", "items"], next);
                    }}
                    className="input-mystique"
                  />
                  <input
                    value={t.role ?? ""}
                    placeholder="Role · City"
                    onChange={(e) => {
                      const next = [...tItems];
                      next[idx] = { ...next[idx], role: e.target.value };
                      set(["testimonials", "items"], next);
                    }}
                    className="input-mystique"
                  />
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={t.rating ?? 5}
                    placeholder="Rating (1-5)"
                    onChange={(e) => {
                      const next = [...tItems];
                      next[idx] = { ...next[idx], rating: Math.max(1, Math.min(5, Number(e.target.value) || 5)) };
                      set(["testimonials", "items"], next);
                    }}
                    className="input-mystique"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => set(["testimonials", "items"], [...tItems, { quote: "", name: "", role: "", rating: 5 }])}
              className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
            >
              + Add testimonial
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-2xl mb-4">Fragrance Families</h3>
          <div className="grid gap-4 mb-4">
            <Field label="Eyebrow">
              <input value={families.eyebrow ?? ""} onChange={(e) => set(["families", "eyebrow"], e.target.value)} placeholder="Shop by Fragrance Family" className="input-mystique" />
            </Field>
            <Field label="Section Title">
              <input value={families.title ?? ""} onChange={(e) => set(["families", "title"], e.target.value)} placeholder="Find your olfactive signature." className="input-mystique font-serif text-xl" />
            </Field>
          </div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-3">Family tiles</p>
          <div className="space-y-3">
            {famItems.map((it, idx) => (
              <div key={idx} className="border border-cream/10 p-4 grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                <input
                  value={it.name}
                  placeholder="Name (e.g. Oud)"
                  onChange={(e) => {
                    const next = [...famItems]; next[idx] = { ...next[idx], name: e.target.value };
                    set(["families", "items"], next);
                  }}
                  className="input-mystique"
                />
                <input
                  value={it.note ?? ""}
                  placeholder="Note (e.g. Deep · Resinous)"
                  onChange={(e) => {
                    const next = [...famItems]; next[idx] = { ...next[idx], note: e.target.value };
                    set(["families", "items"], next);
                  }}
                  className="input-mystique"
                />
                <input
                  value={it.href ?? ""}
                  placeholder="Link (e.g. /shop?family=oud)"
                  onChange={(e) => {
                    const next = [...famItems]; next[idx] = { ...next[idx], href: e.target.value };
                    set(["families", "items"], next);
                  }}
                  className="input-mystique"
                />
                <button
                  onClick={() => set(["families", "items"], famItems.filter((_, i) => i !== idx))}
                  className="text-[10px] uppercase tracking-[0.2em] text-cream/50 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => set(["families", "items"], [...famItems, { name: "", note: "", href: "" }])}
              className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
            >
              + Add family
            </button>
          </div>

          <div className="mt-8 grid gap-4 mb-4">
            <Field label="Occasions Label">
              <input value={families.occasionsLabel ?? ""} onChange={(e) => set(["families", "occasionsLabel"], e.target.value)} placeholder="Or shop by occasion" className="input-mystique" />
            </Field>
          </div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-3">Occasion chips</p>
          <div className="space-y-3">
            {occItems.map((it, idx) => (
              <div key={idx} className="border border-cream/10 p-4 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <input
                  value={it.label}
                  placeholder="Label (e.g. Date Night)"
                  onChange={(e) => {
                    const next = [...occItems]; next[idx] = { ...next[idx], label: e.target.value };
                    set(["families", "occasions"], next);
                  }}
                  className="input-mystique"
                />
                <input
                  value={it.href ?? ""}
                  placeholder="Link (optional)"
                  onChange={(e) => {
                    const next = [...occItems]; next[idx] = { ...next[idx], href: e.target.value };
                    set(["families", "occasions"], next);
                  }}
                  className="input-mystique"
                />
                <button
                  onClick={() => set(["families", "occasions"], occItems.filter((_, i) => i !== idx))}
                  className="text-[10px] uppercase tracking-[0.2em] text-cream/50 hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => set(["families", "occasions"], [...occItems, { label: "", href: "" }])}
              className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
            >
              + Add occasion
            </button>
          </div>
        </div>


        <div className="flex gap-3 pt-4 border-t border-cream/10">
          <button
            onClick={save}
            disabled={!draft}
            className="bg-gold text-obsidian px-6 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
          <button
            onClick={() => setDraft(null)}
            disabled={!draft}
            className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-cream/40 disabled:opacity-40"
          >
            Discard
          </button>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.28em] text-cream/60">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_order_amount: number;
  usage_limit: number | null;
  times_used: number;
  active: boolean;
  expires_at: string | null;
};

const EMPTY_COUPON: Omit<Coupon, "id" | "times_used"> = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: 10,
  min_order_amount: 0,
  usage_limit: null,
  active: true,
  expires_at: null,
};

function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<(Omit<Coupon, "times_used" | "id"> & { id?: string }) | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!editing) return;
    const payload = {
      code: editing.code.trim().toUpperCase(),
      description: editing.description,
      discount_type: editing.discount_type,
      discount_value: Number(editing.discount_value),
      min_order_amount: Number(editing.min_order_amount) || 0,
      usage_limit: editing.usage_limit ? Number(editing.usage_limit) : null,
      active: editing.active,
      expires_at: editing.expires_at || null,
    };
    if (!payload.code) return toast.error("Code is required");
    const q = editing.id
      ? supabase.from("coupons").update(payload).eq("id", editing.id)
      : supabase.from("coupons").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Coupon saved");
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Coupon deleted");
    load();
  }

  async function toggleActive(c: Coupon) {
    const { error } = await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) return toast.error(error.message);
    load();
  }

  if (editing) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-3xl">{editing.id ? "Edit Coupon" : "New Coupon"}</h2>
          <button onClick={() => setEditing(null)} className="text-[11px] uppercase tracking-[0.3em] text-cream/60 hover:text-gold">← Back</button>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <Field label="Code">
            <input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className="input-mystique uppercase tracking-[0.2em]" placeholder="WELCOME10" />
          </Field>
          <Field label="Status">
            <select value={editing.active ? "1" : "0"} onChange={(e) => setEditing({ ...editing, active: e.target.value === "1" })} className="input-mystique">
              <option value="1">Active</option>
              <option value="0">Disabled</option>
            </select>
          </Field>
          <div className="col-span-2">
            <Field label="Description">
              <input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input-mystique" placeholder="Shown internally" />
            </Field>
          </div>
          <Field label="Discount Type">
            <select value={editing.discount_type} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value as any })} className="input-mystique">
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </Field>
          <Field label={`Value ${editing.discount_type === "percent" ? "(%)" : "(₹)"}`}>
            <input type="number" value={editing.discount_value} onChange={(e) => setEditing({ ...editing, discount_value: Number(e.target.value) })} className="input-mystique" />
          </Field>
          <Field label="Min Order (₹)">
            <input type="number" value={editing.min_order_amount} onChange={(e) => setEditing({ ...editing, min_order_amount: Number(e.target.value) })} className="input-mystique" />
          </Field>
          <Field label="Usage Limit (blank = unlimited)">
            <input type="number" value={editing.usage_limit ?? ""} onChange={(e) => setEditing({ ...editing, usage_limit: e.target.value ? Number(e.target.value) : null })} className="input-mystique" />
          </Field>
          <div className="col-span-2">
            <Field label="Expires At (blank = never)">
              <input type="datetime-local" value={editing.expires_at ? editing.expires_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className="input-mystique" />
            </Field>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={save} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] font-semibold hover:bg-cream">Save Coupon</button>
          <button onClick={() => setEditing(null)} className="border border-cream/20 px-8 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-3xl">Coupons</h2>
        <button onClick={() => setEditing({ ...EMPTY_COUPON })} className="bg-gold text-obsidian px-6 py-3 text-[11px] uppercase tracking-[0.3em] font-semibold hover:bg-cream">+ New Coupon</button>
      </div>
      {loading ? (
        <p className="text-cream/50 text-sm">Loading…</p>
      ) : coupons.length === 0 ? (
        <p className="text-cream/50 text-sm">No coupons yet. Create one to offer checkout discounts.</p>
      ) : (
        <div className="border border-cream/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-graphite/40 text-[10px] uppercase tracking-[0.25em] text-cream/60">
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Discount</th>
                <th className="text-left px-4 py-3">Min Order</th>
                <th className="text-left px-4 py-3">Used</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t border-cream/10">
                  <td className="px-4 py-3">
                    <p className="text-gold tracking-[0.2em]">{c.code}</p>
                    {c.description && <p className="text-cream/50 text-xs mt-1">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {c.discount_type === "percent" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                  </td>
                  <td className="px-4 py-3 text-cream/70">₹{c.min_order_amount}</td>
                  <td className="px-4 py-3 text-cream/70">{c.times_used}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c)} className={`text-[10px] uppercase tracking-[0.25em] px-3 py-1 border ${c.active ? "border-gold/60 text-gold" : "border-cream/20 text-cream/50"}`}>
                      {c.active ? "Active" : "Off"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-cream/60 text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditing({ ...c })} className="text-[10px] uppercase tracking-[0.25em] text-cream/70 hover:text-gold mr-3">Edit</button>
                    <button onClick={() => remove(c.id)} className="text-[10px] uppercase tracking-[0.25em] text-cream/40 hover:text-red-400">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReviewsTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");

  const { data: reviews } = useQuery({
    queryKey: ["admin", "reviews", filter],
    queryFn: async () => {
      let q = supabase
        .from("product_reviews")
        .select("*, products(name, slug, image_url)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter === "pending") q = q.eq("approved", false);
      if (filter === "approved") q = q.eq("approved", true);
      const { data } = await q;
      return data ?? [];
    },
  });

  async function setApproved(id: string, approved: boolean) {
    const { error } = await supabase.from("product_reviews").update({ approved }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(approved ? "Review approved" : "Review unpublished");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Review deleted");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    }
  }

  const FILTERS: { id: typeof filter; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "all", label: "All" },
  ];

  return (
    <section>
      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 text-[10px] uppercase tracking-[0.28em] border ${
              filter === f.id
                ? "border-gold text-gold"
                : "border-cream/15 text-cream/60 hover:border-cream/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {(!reviews || reviews.length === 0) && (
        <div className="border border-cream/10 p-10 text-center text-cream/50">
          No reviews {filter !== "all" ? `(${filter})` : ""} yet.
        </div>
      )}

      <div className="space-y-4">
        {reviews?.map((r: any) => (
          <div key={r.id} className="border border-cream/10 p-5">
            <div className="flex flex-wrap justify-between gap-4 mb-3">
              <div className="flex items-center gap-4">
                {r.products?.image_url && (
                  <img src={r.products.image_url} alt="" className="w-14 h-14 object-cover" />
                )}
                <div>
                  <p className="font-serif text-lg">{r.products?.name ?? "Unknown product"}</p>
                  <div className="flex items-center gap-3 text-xs text-cream/60 mt-1">
                    <span className="text-gold tracking-widest">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                    <span>{new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                    {r.verified_purchase && (
                      <span className="text-[10px] uppercase tracking-[0.25em] text-gold/80">Verified</span>
                    )}
                    <span
                      className={`text-[10px] uppercase tracking-[0.25em] ${
                        r.approved ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {r.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {r.approved ? (
                  <button
                    onClick={() => setApproved(r.id, false)}
                    className="border border-cream/20 px-4 py-2 text-[10px] uppercase tracking-[0.28em] hover:border-gold hover:text-gold"
                  >
                    Unpublish
                  </button>
                ) : (
                  <button
                    onClick={() => setApproved(r.id, true)}
                    className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.28em]"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => remove(r.id)}
                  className="border border-red-500/40 text-red-400 px-4 py-2 text-[10px] uppercase tracking-[0.28em] hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
            {r.title && <p className="font-serif text-lg mb-1">{r.title}</p>}
            {r.body && <p className="text-sm text-cream/70 leading-relaxed">{r.body}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}



function LoyaltyTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<any | null>(null);
  const { data } = useQuery({
    queryKey: ["admin", "site_settings", "loyalty"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "loyalty")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const defaults = {
    earnPerRupee: 100,
    redeemCapPct: 20,
    pointValue: 1,
    tiers: [
      { name: "Ivory", minPoints: 0, perk: "Welcome tier" },
      { name: "Gold", minPoints: 200, perk: "Priority shipping" },
      { name: "Noir", minPoints: 500, perk: "Exclusive launches" },
    ],
  };
  const value = draft ?? { ...defaults, ...((data?.value as any) ?? {}) };
  const tiers: { name: string; minPoints: number; perk?: string }[] = value.tiers ?? [];

  function update(patch: any) {
    setDraft({ ...value, ...patch });
  }
  function updateTier(idx: number, patch: any) {
    const next = tiers.map((t, i) => (i === idx ? { ...t, ...patch } : t));
    update({ tiers: next });
  }

  async function save() {
    const payload = { key: "loyalty", value };
    const q = data?.id
      ? supabase.from("site_settings").update({ value }).eq("id", data.id)
      : supabase.from("site_settings").insert(payload);
    const { error } = await q;
    if (error) toast.error(error.message);
    else {
      toast.success("Loyalty settings saved");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin", "site_settings", "loyalty"] });
      qc.invalidateQueries({ queryKey: ["site_settings", "loyalty"] });
    }
  }

  return (
    <section className="max-w-3xl">
      <p className="text-sm text-cream/60 mb-8">
        Configure the earn rate, redemption cap, and loyalty tiers shown across checkout and the account dashboard.
        Note: the underlying earn/redeem accounting on orders is fixed (1 pt per ₹100 earned, 1 pt = ₹1); these settings tune the customer-facing rules and the tier ladder.
      </p>

      <div className="space-y-10">
        <div>
          <h3 className="font-serif text-2xl mb-4">Program rules</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Earn: ₹ spent per point">
              <input
                type="number"
                min={1}
                value={value.earnPerRupee}
                onChange={(e) => update({ earnPerRupee: Math.max(1, Number(e.target.value) || 1) })}
                className="input-mystique"
              />
            </Field>
            <Field label="Redeem cap (% of subtotal)">
              <input
                type="number"
                min={0}
                max={100}
                value={value.redeemCapPct}
                onChange={(e) => update({ redeemCapPct: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })}
                className="input-mystique"
              />
            </Field>
            <Field label="Point value (₹)">
              <input
                type="number"
                min={0}
                step={0.5}
                value={value.pointValue}
                onChange={(e) => update({ pointValue: Math.max(0, Number(e.target.value) || 0) })}
                className="input-mystique"
              />
            </Field>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-2xl">Tiers</h3>
            <button
              onClick={() => update({ tiers: [...tiers, { name: "New Tier", minPoints: (tiers.at(-1)?.minPoints ?? 0) + 100, perk: "" }] })}
              className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
            >
              + Add tier
            </button>
          </div>
          <div className="space-y-3">
            {tiers.map((t, idx) => (
              <div key={idx} className="grid gap-3 md:grid-cols-[1fr_140px_2fr_auto] items-end border border-cream/10 p-4">
                <Field label="Name">
                  <input value={t.name} onChange={(e) => updateTier(idx, { name: e.target.value })} className="input-mystique" />
                </Field>
                <Field label="Min points">
                  <input
                    type="number"
                    min={0}
                    value={t.minPoints}
                    onChange={(e) => updateTier(idx, { minPoints: Math.max(0, Number(e.target.value) || 0) })}
                    className="input-mystique"
                  />
                </Field>
                <Field label="Perk">
                  <input value={t.perk ?? ""} onChange={(e) => updateTier(idx, { perk: e.target.value })} className="input-mystique" />
                </Field>
                <button
                  onClick={() => update({ tiers: tiers.filter((_, i) => i !== idx) })}
                  className="border border-cream/15 hover:border-red-400/60 text-cream/60 hover:text-red-400 text-[10px] uppercase tracking-[0.24em] px-3 py-2.5"
                >
                  Remove
                </button>
              </div>
            ))}
            {tiers.length === 0 && (
              <p className="text-cream/50 text-sm">No tiers configured — customers will see the "Ivory" default.</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={!draft}
            className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40"
          >
            Save loyalty settings
          </button>
          {draft && (
            <button
              onClick={() => setDraft(null)}
              className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold"
            >
              Discard
            </button>
          )}
        </div>
      </div>

      <div className="mt-16 border-t border-cream/10 pt-10">
        <LoyaltyPageEditor />
      </div>
    </section>
  );
}

function LoyaltyPageEditor() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<any | null>(null);
  const { data } = useQuery({
    queryKey: ["admin", "site_settings", "loyalty_page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "loyalty_page")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const defaults = {
    hero: {
      eyebrow: "Members Only",
      title: "The Mystique",
      titleHighlight: "Circle",
      subtitle:
        "A quiet privilege for our most discerning patrons. Earn with every acquisition, ascend through three atelier tiers, and unlock rituals reserved for the few.",
      primaryCta: { label: "Join the Circle", href: "/auth" },
      secondaryCta: { label: "Discover Fragrances", href: "/shop" },
    },
    ritual: {
      eyebrow: "The Ritual",
      title: "How the Circle works",
      steps: [
        { n: "01", t: "Acquire", d: "Earn 1 point for every ₹{earnPerRupee} spent across the collection." },
        { n: "02", t: "Ascend", d: "Progress through Ivory, Gold and Noir. Each tier unlocks its own atelier privileges." },
        { n: "03", t: "Redeem", d: "Apply points at checkout — 1 pt = ₹{pointValue}. Redeem up to {redeemCapPct}% of your order." },
      ],
    },
    tiersSection: { eyebrow: "Three Ascensions", title: "Tiers of the Circle" },
    cta: {
      eyebrow: "An Invitation",
      title: "Begin your ascent through the Circle.",
      body: "Every fragrance is a step. Every step, a privilege earned.",
      primary: { label: "Shop the Collection", href: "/shop" },
      secondary: { label: "View Account", href: "/account" },
    },
  };

  const stored = (data?.value as any) ?? {};
  const value = draft ?? {
    hero: { ...defaults.hero, ...(stored.hero ?? {}) },
    ritual: {
      ...defaults.ritual,
      ...(stored.ritual ?? {}),
      steps: stored.ritual?.steps?.length ? stored.ritual.steps : defaults.ritual.steps,
    },
    tiersSection: { ...defaults.tiersSection, ...(stored.tiersSection ?? {}) },
    cta: { ...defaults.cta, ...(stored.cta ?? {}) },
  };

  function update(patch: any) {
    setDraft({ ...value, ...patch });
  }
  function updateHero(patch: any) {
    update({ hero: { ...value.hero, ...patch } });
  }
  function updateRitual(patch: any) {
    update({ ritual: { ...value.ritual, ...patch } });
  }
  function updateStep(idx: number, patch: any) {
    const steps = value.ritual.steps.map((st: any, i: number) => (i === idx ? { ...st, ...patch } : st));
    updateRitual({ steps });
  }
  function updateTiersSection(patch: any) {
    update({ tiersSection: { ...value.tiersSection, ...patch } });
  }
  function updateCta(patch: any) {
    update({ cta: { ...value.cta, ...patch } });
  }

  async function save() {
    const payload = { key: "loyalty_page", value };
    const q = data?.id
      ? supabase.from("site_settings").update({ value }).eq("id", data.id)
      : supabase.from("site_settings").insert(payload);
    const { error } = await q;
    if (error) toast.error(error.message);
    else {
      toast.success("Loyalty page saved");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["admin", "site_settings", "loyalty_page"] });
      qc.invalidateQueries({ queryKey: ["site_settings", "loyalty_page"] });
    }
  }

  return (
    <div className="max-w-3xl">
      <h3 className="font-serif text-2xl mb-2">Loyalty page content</h3>
      <p className="text-sm text-cream/60 mb-8">
        Edit copy shown on the public <code className="text-gold">/loyalty</code> page. Use <code className="text-gold">{"{earnPerRupee}"}</code>, <code className="text-gold">{"{pointValue}"}</code>, <code className="text-gold">{"{redeemCapPct}"}</code> in step descriptions — they auto-fill from program rules.
      </p>

      <div className="space-y-10">
        {/* Hero */}
        <div>
          <h4 className="font-serif text-xl mb-4">Hero</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Eyebrow">
              <input value={value.hero.eyebrow} onChange={(e) => updateHero({ eyebrow: e.target.value })} className="input-mystique" />
            </Field>
            <Field label="Subtitle">
              <textarea value={value.hero.subtitle} onChange={(e) => updateHero({ subtitle: e.target.value })} className="input-mystique min-h-[80px]" />
            </Field>
            <Field label="Title (before highlight)">
              <input value={value.hero.title} onChange={(e) => updateHero({ title: e.target.value })} className="input-mystique" />
            </Field>
            <Field label="Title highlight (gold italic)">
              <input value={value.hero.titleHighlight} onChange={(e) => updateHero({ titleHighlight: e.target.value })} className="input-mystique" />
            </Field>
            <Field label="Primary CTA label">
              <input value={value.hero.primaryCta.label} onChange={(e) => updateHero({ primaryCta: { ...value.hero.primaryCta, label: e.target.value } })} className="input-mystique" />
            </Field>
            <Field label="Primary CTA link">
              <input value={value.hero.primaryCta.href} onChange={(e) => updateHero({ primaryCta: { ...value.hero.primaryCta, href: e.target.value } })} className="input-mystique" />
            </Field>
            <Field label="Secondary CTA label">
              <input value={value.hero.secondaryCta.label} onChange={(e) => updateHero({ secondaryCta: { ...value.hero.secondaryCta, label: e.target.value } })} className="input-mystique" />
            </Field>
            <Field label="Secondary CTA link">
              <input value={value.hero.secondaryCta.href} onChange={(e) => updateHero({ secondaryCta: { ...value.hero.secondaryCta, href: e.target.value } })} className="input-mystique" />
            </Field>
          </div>
        </div>

        {/* Ritual */}
        <div>
          <h4 className="font-serif text-xl mb-4">How it works</h4>
          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <Field label="Eyebrow">
              <input value={value.ritual.eyebrow} onChange={(e) => updateRitual({ eyebrow: e.target.value })} className="input-mystique" />
            </Field>
            <Field label="Title">
              <input value={value.ritual.title} onChange={(e) => updateRitual({ title: e.target.value })} className="input-mystique" />
            </Field>
          </div>
          <div className="space-y-3">
            {value.ritual.steps.map((st: any, idx: number) => (
              <div key={idx} className="grid gap-3 md:grid-cols-[80px_1fr_2fr_auto] items-end border border-cream/10 p-4">
                <Field label="Step">
                  <input value={st.n} onChange={(e) => updateStep(idx, { n: e.target.value })} className="input-mystique" />
                </Field>
                <Field label="Title">
                  <input value={st.t} onChange={(e) => updateStep(idx, { t: e.target.value })} className="input-mystique" />
                </Field>
                <Field label="Description">
                  <input value={st.d} onChange={(e) => updateStep(idx, { d: e.target.value })} className="input-mystique" />
                </Field>
                <button
                  onClick={() => updateRitual({ steps: value.ritual.steps.filter((_: any, i: number) => i !== idx) })}
                  className="border border-cream/15 hover:border-red-400/60 text-cream/60 hover:text-red-400 text-[10px] uppercase tracking-[0.24em] px-3 py-2.5"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => updateRitual({ steps: [...value.ritual.steps, { n: String(value.ritual.steps.length + 1).padStart(2, "0"), t: "New step", d: "" }] })}
              className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
            >
              + Add step
            </button>
          </div>
        </div>

        {/* Tiers section headings */}
        <div>
          <h4 className="font-serif text-xl mb-4">Tiers section</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Eyebrow">
              <input value={value.tiersSection.eyebrow} onChange={(e) => updateTiersSection({ eyebrow: e.target.value })} className="input-mystique" />
            </Field>
            <Field label="Title">
              <input value={value.tiersSection.title} onChange={(e) => updateTiersSection({ title: e.target.value })} className="input-mystique" />
            </Field>
          </div>
          <p className="text-xs text-cream/50 mt-2">Individual tier names, thresholds and perks are managed in <span className="text-gold">Program rules → Tiers</span> above.</p>
        </div>

        {/* Closing CTA */}
        <div>
          <h4 className="font-serif text-xl mb-4">Closing CTA</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Eyebrow">
              <input value={value.cta.eyebrow} onChange={(e) => updateCta({ eyebrow: e.target.value })} className="input-mystique" />
            </Field>
            <Field label="Title">
              <input value={value.cta.title} onChange={(e) => updateCta({ title: e.target.value })} className="input-mystique" />
            </Field>
            <Field label="Body">
              <textarea value={value.cta.body} onChange={(e) => updateCta({ body: e.target.value })} className="input-mystique min-h-[80px] md:col-span-2" />
            </Field>
            <Field label="Primary CTA label">
              <input value={value.cta.primary.label} onChange={(e) => updateCta({ primary: { ...value.cta.primary, label: e.target.value } })} className="input-mystique" />
            </Field>
            <Field label="Primary CTA link">
              <input value={value.cta.primary.href} onChange={(e) => updateCta({ primary: { ...value.cta.primary, href: e.target.value } })} className="input-mystique" />
            </Field>
            <Field label="Secondary CTA label (signed-in only)">
              <input value={value.cta.secondary.label} onChange={(e) => updateCta({ secondary: { ...value.cta.secondary, label: e.target.value } })} className="input-mystique" />
            </Field>
            <Field label="Secondary CTA link">
              <input value={value.cta.secondary.href} onChange={(e) => updateCta({ secondary: { ...value.cta.secondary, href: e.target.value } })} className="input-mystique" />
            </Field>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={!draft}
            className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40"
          >
            Save page content
          </button>
          {draft && (
            <button
              onClick={() => setDraft(null)}
              className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold"
            >
              Discard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PagesTab() {
  const qc = useQueryClient();
  const [pagesDraft, setPagesDraft] = useState<any | null>(null);
  const [contactDraft, setContactDraft] = useState<any | null>(null);

  const { data: pagesRow } = useQuery({
    queryKey: ["admin", "site_settings", "pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("key", "pages").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: contactRow } = useQuery({
    queryKey: ["admin", "site_settings", "contact"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("key", "contact").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const defaultPages = {
    items: [
      { slug: "shipping", title: "Shipping & Delivery", body: "Every parcel is dispatched from our Kannauj atelier within 48 hours. Domestic delivery: 3–5 business days. International: 7–14 business days via insured courier.", showInFooter: true },
      { slug: "returns", title: "Returns & Exchanges", body: "Unopened fragrances may be returned within 14 days of delivery for a full refund. Bespoke commissions are final sale.", showInFooter: true },
      { slug: "privacy", title: "Privacy Policy", body: "We collect only what is necessary to fulfil your order and maintain your account. Your data is never sold. See details for cookie preferences and data requests.", showInFooter: true },
      { slug: "terms", title: "Terms of Service", body: "By purchasing from Mystique Blends you agree to our terms governing orders, payment, delivery, warranties, and dispute resolution.", showInFooter: true },
    ],
  };
  const pages = pagesDraft ?? { ...defaultPages, ...((pagesRow?.value as any) ?? {}) };
  const items: any[] = pages.items ?? [];

  const defaultContact = {
    email: "concierge@mystiqueblends.com",
    phone: "+91 98765 43210",
    address: "The Mystique Atelier\nKannauj, Uttar Pradesh 209725\nIndia",
    hours: "Monday – Saturday · 10:00 – 19:00 IST",
    intro: "For private consultations, bespoke commissions, or care of an existing acquisition — we respond within one business day.",
  };
  const contact = contactDraft ?? { ...defaultContact, ...((contactRow?.value as any) ?? {}) };

  function updatePages(patch: any) { setPagesDraft({ ...pages, ...patch }); }
  function updateItem(idx: number, patch: any) {
    updatePages({ items: items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
  }
  function updateContact(patch: any) { setContactDraft({ ...contact, ...patch }); }

  async function savePages() {
    const value = pages;
    const q = pagesRow?.id
      ? supabase.from("site_settings").update({ value }).eq("id", pagesRow.id)
      : supabase.from("site_settings").insert({ key: "pages", value });
    const { error } = await q;
    if (error) toast.error(error.message);
    else {
      toast.success("Pages saved");
      setPagesDraft(null);
      qc.invalidateQueries({ queryKey: ["admin", "site_settings", "pages"] });
      qc.invalidateQueries({ queryKey: ["site_settings", "pages"] });
    }
  }
  async function saveContact() {
    const value = contact;
    const q = contactRow?.id
      ? supabase.from("site_settings").update({ value }).eq("id", contactRow.id)
      : supabase.from("site_settings").insert({ key: "contact", value });
    const { error } = await q;
    if (error) toast.error(error.message);
    else {
      toast.success("Contact info saved");
      setContactDraft(null);
      qc.invalidateQueries({ queryKey: ["admin", "site_settings", "contact"] });
      qc.invalidateQueries({ queryKey: ["site_settings", "contact"] });
    }
  }

  return (
    <section className="max-w-4xl space-y-16">
      {/* Policy pages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-2xl">Policy & Info Pages</h3>
            <p className="text-sm text-cream/60 mt-1">Live at <code className="text-gold">/p/&lt;slug&gt;</code>. Toggle "show in footer" to feature in the site footer.</p>
          </div>
          <button
            onClick={() => updatePages({ items: [...items, { slug: `page-${items.length + 1}`, title: "New Page", body: "", showInFooter: false }] })}
            className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
          >
            + Add page
          </button>
        </div>
        <div className="space-y-4">
          {items.map((p, idx) => (
            <div key={idx} className="border border-cream/10 p-5 space-y-3">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
                <Field label="Title">
                  <input value={p.title} onChange={(e) => updateItem(idx, { title: e.target.value })} className="input-mystique" />
                </Field>
                <Field label="Slug (URL)">
                  <input value={p.slug} onChange={(e) => updateItem(idx, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} className="input-mystique" />
                </Field>
                <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-cream/70 pb-3">
                  <input type="checkbox" checked={!!p.showInFooter} onChange={(e) => updateItem(idx, { showInFooter: e.target.checked })} />
                  In footer
                </label>
              </div>
              <Field label="Body">
                <textarea rows={5} value={p.body} onChange={(e) => updateItem(idx, { body: e.target.value })} className="input-mystique resize-none" />
              </Field>
              <div className="flex justify-end">
                <button
                  onClick={() => updatePages({ items: items.filter((_, i) => i !== idx) })}
                  className="border border-cream/15 hover:border-red-400/60 text-cream/60 hover:text-red-400 text-[10px] uppercase tracking-[0.24em] px-3 py-2"
                >
                  Delete page
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={savePages} disabled={!pagesDraft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40">
            Save pages
          </button>
          {pagesDraft && (
            <button onClick={() => setPagesDraft(null)} className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold">
              Discard
            </button>
          )}
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="font-serif text-2xl mb-4">Contact Information</h3>
        <p className="text-sm text-cream/60 mb-6">Displayed on the <code className="text-gold">/contact</code> page.</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Email"><input value={contact.email ?? ""} onChange={(e) => updateContact({ email: e.target.value })} className="input-mystique" /></Field>
          <Field label="Phone"><input value={contact.phone ?? ""} onChange={(e) => updateContact({ phone: e.target.value })} className="input-mystique" /></Field>
          <Field label="Address"><textarea rows={3} value={contact.address ?? ""} onChange={(e) => updateContact({ address: e.target.value })} className="input-mystique resize-none" /></Field>
          <Field label="Hours"><textarea rows={3} value={contact.hours ?? ""} onChange={(e) => updateContact({ hours: e.target.value })} className="input-mystique resize-none" /></Field>
          <div className="md:col-span-2">
            <Field label="Intro paragraph"><textarea rows={3} value={contact.intro ?? ""} onChange={(e) => updateContact({ intro: e.target.value })} className="input-mystique resize-none" /></Field>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={saveContact} disabled={!contactDraft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40">
            Save contact info
          </button>
          {contactDraft && (
            <button onClick={() => setContactDraft(null)} className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold">
              Discard
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function NavigationTab() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery({
    queryKey: ["admin", "navigation"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "navigation")
        .maybeSingle();
      const v = (data?.value as { primary?: { label: string; href: string }[] }) ?? {};
      return v.primary ?? [
        { label: "Shop All", href: "/shop" },
        { label: "Oud", href: "/shop/oud-reserve" },
        { label: "Attars", href: "/shop/rare-attars" },
        { label: "Gift Box", href: "/gift-builder" },
        { label: "Journal", href: "/blog" },
        { label: "The Circle", href: "/loyalty" },
      ];
    },
  });
  const [rows, setRows] = useState<{ label: string; href: string }[]>([]);
  useEffect(() => { setRows(items); }, [items]);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = rows.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
  };

  const save = async () => {
    const clean = rows.filter((r) => r.label.trim() && r.href.trim());
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "navigation", value: { primary: clean } as any }, { onConflict: "key" });
    if (error) return toast.error(error.message);
    toast.success("Navigation saved");
    qc.invalidateQueries({ queryKey: ["admin", "navigation"] });
    qc.invalidateQueries({ queryKey: ["site_settings", "navigation"] });
  };

  return (
    <section className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl">Primary Navigation</h2>
          <p className="text-cream/60 text-sm mt-1">Edit the header + mobile menu links.</p>
        </div>
        <button
          onClick={() => setRows([...rows, { label: "", href: "" }])}
          className="px-4 py-2 border border-cream/15 text-[11px] uppercase tracking-[0.28em] hover:border-gold hover:text-gold"
        >+ Add Link</button>
      </div>

      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[1fr_1.4fr_auto] gap-2 items-center border border-cream/10 p-3 bg-obsidian/40">
            <input
              value={r.label}
              onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, label: e.target.value } : x))}
              placeholder="Label"
              className="bg-obsidian border border-cream/10 px-3 py-2 text-sm focus:border-gold outline-none"
            />
            <input
              value={r.href}
              onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, href: e.target.value } : x))}
              placeholder="/shop or https://…"
              className="bg-obsidian border border-cream/10 px-3 py-2 text-sm focus:border-gold outline-none"
            />
            <div className="flex gap-1">
              <button onClick={() => move(i, -1)} className="px-2 py-2 text-cream/60 hover:text-gold text-xs">↑</button>
              <button onClick={() => move(i, 1)} className="px-2 py-2 text-cream/60 hover:text-gold text-xs">↓</button>
              <button
                onClick={() => setRows(rows.filter((_, k) => k !== i))}
                className="px-3 py-2 text-cream/60 hover:text-red-400 text-xs"
              >Remove</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-cream/40 text-sm">No links yet. Add your first menu item.</p>
        )}
      </div>

      <button
        onClick={save}
        className="mt-8 bg-gold text-obsidian px-6 py-3 text-[11px] uppercase tracking-[0.28em] hover:bg-gold/90"
      >Save Navigation</button>
    </section>
  );
}

function MessagesTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "new" | "read" | "archived">("all");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin", "contact_messages", filter],
    queryFn: async () => {
      let q = supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "contact_messages"] });
  };

  const sendReply = async (id: string) => {
    const text = (replyDrafts[id] ?? "").trim();
    if (text.length < 2) return toast.error("Please write a reply first.");
    setSendingId(id);
    const { error } = await supabase
      .from("contact_messages")
      .update({ admin_reply: text, replied_at: new Date().toISOString(), status: "read" } as any)
      .eq("id", id);
    setSendingId(null);
    if (error) return toast.error(error.message);
    toast.success("Reply sent to customer.");
    setReplyDrafts((d) => ({ ...d, [id]: "" }));
    qc.invalidateQueries({ queryKey: ["admin", "contact_messages"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Message deleted.");
    qc.invalidateQueries({ queryKey: ["admin", "contact_messages"] });
  };

  const counts = {
    all: messages.length,
  };


  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-gold">Concierge</p>
          <h2 className="font-serif text-3xl mt-2">Messages</h2>
          <p className="text-cream/60 text-sm mt-2">Submissions from the /contact form.</p>
        </div>
        <div className="flex gap-1 border border-cream/10">
          {(["all", "new", "read", "archived"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.28em] ${
                filter === f ? "bg-gold text-obsidian" : "text-cream/60 hover:text-cream"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-cream/50">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-cream/50 border border-cream/10 p-10 text-center">No messages{filter !== "all" ? ` in ${filter}` : ""} yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((m: any) => (
            <article
              key={m.id}
              className={`border p-6 ${m.status === "new" ? "border-gold/40 bg-gold/5" : "border-cream/10 bg-graphite/20"}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-serif text-xl">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="text-cream/70 text-sm hover:text-gold">
                    {m.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] uppercase tracking-[0.3em] ${
                    m.status === "new" ? "text-gold" : "text-cream/50"
                  }`}>{m.status}</span>
                  <span className="text-cream/40 text-xs">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-cream/80 whitespace-pre-wrap">{m.message}</p>

              {m.admin_reply && (
                <div className="mt-4 border-l-2 border-gold/60 bg-obsidian/40 pl-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-gold">
                    Your reply · {m.replied_at ? new Date(m.replied_at).toLocaleString() : ""}
                  </p>
                  <p className="mt-2 text-cream/80 whitespace-pre-wrap text-sm">{m.admin_reply}</p>
                </div>
              )}

              <div className="mt-4 space-y-2">
                <textarea
                  value={replyDrafts[m.id] ?? ""}
                  onChange={(e) => setReplyDrafts((d) => ({ ...d, [m.id]: e.target.value }))}
                  rows={3}
                  placeholder={m.admin_reply ? "Send a follow-up reply…" : "Write a reply to the customer…"}
                  className="w-full border border-cream/15 bg-obsidian/60 px-3 py-2 text-sm text-cream focus:border-gold outline-none resize-none"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => sendReply(m.id)}
                    disabled={sendingId === m.id}
                    className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.28em] hover:bg-gold/90 disabled:opacity-50"
                  >{sendingId === m.id ? "Sending…" : m.admin_reply ? "Send follow-up" : "Send reply"}</button>
                  {m.status !== "read" && (
                    <button
                      onClick={() => setStatus(m.id, "read")}
                      className="border border-cream/20 px-4 py-2 text-[10px] uppercase tracking-[0.28em] hover:bg-cream/5"
                    >Mark read</button>
                  )}
                  {m.status !== "archived" && (
                    <button
                      onClick={() => setStatus(m.id, "archived")}
                      className="border border-cream/20 px-4 py-2 text-[10px] uppercase tracking-[0.28em] hover:bg-cream/5"
                    >Archive</button>
                  )}
                  <a
                    href={`mailto:${m.email}?subject=Re: your note to Mystique Blends`}
                    className="border border-cream/20 px-4 py-2 text-[10px] uppercase tracking-[0.28em] hover:bg-cream/5"
                  >Email instead</a>
                  <button
                    onClick={() => remove(m.id)}
                    className="ml-auto text-cream/50 text-[10px] uppercase tracking-[0.28em] hover:text-red-400"
                  >Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


// ============================================================
// PHASE 2 — People modules: Customers, Roles & Team, Audit Logs
// ============================================================

const ROLE_OPTIONS: { value: "admin" | "manager" | "staff" | "customer"; label: string; desc: string }[] = [
  { value: "admin", label: "Admin", desc: "Full control across every module." },
  { value: "manager", label: "Manager", desc: "Manage catalog, orders, marketing." },
  { value: "staff", label: "Staff", desc: "Fulfilment & support only." },
  { value: "customer", label: "Customer", desc: "Standard shopper (default)." },
];

async function logAudit(action: string, entity?: string, entity_id?: string, details?: any) {
  const { data: userRes } = await supabase.auth.getUser();
  const u = userRes.user;
  await supabase.from("audit_logs" as any).insert({
    actor_id: u?.id ?? null,
    actor_email: u?.email ?? null,
    action,
    entity: entity ?? null,
    entity_id: entity_id ?? null,
    details: details ?? null,
  } as any);
}

function CustomersTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  const { data: profiles } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,full_name,email,phone,avatar_url,loyalty_points,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: rolesMap } = useQuery({
    queryKey: ["admin", "customers", "roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("user_id,role");
      const map: Record<string, string[]> = {};
      (data ?? []).forEach((r: any) => {
        (map[r.user_id] ||= []).push(r.role);
      });
      return map;
    },
  });

  const { data: orderStats } = useQuery({
    queryKey: ["admin", "customers", "orders"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("user_id,total_inr,created_at");
      const map: Record<string, { count: number; spend: number; last: string | null }> = {};
      (data ?? []).forEach((o: any) => {
        if (!o.user_id) return;
        const cur = map[o.user_id] ?? { count: 0, spend: 0, last: null };
        cur.count += 1;
        cur.spend += o.total_inr ?? 0;
        if (!cur.last || o.created_at > cur.last) cur.last = o.created_at;
        map[o.user_id] = cur;
      });
      return map;
    },
  });

  const filtered = (profiles ?? []).filter((p: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (p.full_name ?? "").toLowerCase().includes(s) ||
      (p.email ?? "").toLowerCase().includes(s) ||
      (p.phone ?? "").toLowerCase().includes(s) ||
      p.id.toLowerCase().includes(s)
    );
  });

  async function setRole(userId: string, role: "admin" | "manager" | "staff" | "customer") {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role } as any);
    if (error) {
      toast.error(error.message);
      return;
    }
    await logAudit("role.change", "user", userId, { role });
    toast.success(`Role set to ${role}`);
    qc.invalidateQueries({ queryKey: ["admin", "customers", "roles"] });
  }

  async function adjustPoints(userId: string, delta: number) {
    const cur = (profiles ?? []).find((p: any) => p.id === userId);
    if (!cur) return;
    const next = Math.max(0, (cur.loyalty_points ?? 0) + delta);
    const { error } = await supabase.from("profiles").update({ loyalty_points: next }).eq("id", userId);
    if (error) return toast.error(error.message);
    await logAudit("loyalty.adjust", "user", userId, { delta, next });
    toast.success(`Points ${delta >= 0 ? "+" : ""}${delta}`);
    qc.invalidateQueries({ queryKey: ["admin", "customers"] });
  }

  const totalSpend = Object.values(orderStats ?? {}).reduce((s, x) => s + x.spend, 0);
  const totalOrders = Object.values(orderStats ?? {}).reduce((s, x) => s + x.count, 0);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={String(profiles?.length ?? 0)} />
        <StatCard label="Total Orders" value={String(totalOrders)} />
        <StatCard label="Total Spend" value={formatINR(totalSpend)} tone="gold" />
        <StatCard label="Team Members" value={String(Object.values(rolesMap ?? {}).filter((r) => r.some((x) => x !== "customer")).length)} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or ID…"
          className="bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-2.5 text-sm w-full max-w-md"
        />
        <span className="text-cream/40 text-[10px] uppercase tracking-[0.28em]">
          {filtered.length} of {profiles?.length ?? 0}
        </span>
      </div>

      <div className="border border-cream/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-cream/[0.03] text-[10px] uppercase tracking-[0.24em] text-cream/50">
            <tr>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-right px-4 py-3">Orders</th>
              <th className="text-right px-4 py-3">Spend</th>
              <th className="text-right px-4 py-3">Points</th>
              <th className="text-right px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream/5">
            {filtered.map((p: any) => {
              const roles = rolesMap?.[p.id] ?? ["customer"];
              const stats = orderStats?.[p.id];
              return (
                <tr key={p.id} className="hover:bg-cream/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center text-[10px] text-cream/60 font-serif">
                          {(p.full_name || p.email || "?").slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{p.full_name || p.email || "Anonymous"}</p>
                        <p className="text-[10px] text-cream/40 truncate">{p.email || p.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {roles.map((r) => (
                        <span
                          key={r}
                          className={`text-[9px] uppercase tracking-[0.24em] border px-2 py-0.5 ${
                            r === "admin"
                              ? "border-gold text-gold"
                              : r === "manager"
                                ? "border-cream/40 text-cream"
                                : r === "staff"
                                  ? "border-cream/25 text-cream/70"
                                  : "border-cream/15 text-cream/50"
                          }`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{stats?.count ?? 0}</td>
                  <td className="px-4 py-3 text-right text-gold">{formatINR(stats?.spend ?? 0)}</td>
                  <td className="px-4 py-3 text-right">{p.loyalty_points ?? 0}</td>
                  <td className="px-4 py-3 text-right text-[10px] text-cream/50 uppercase tracking-[0.2em]">
                    {new Date(p.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected({ ...p, roles, stats })}
                      className="text-[10px] uppercase tracking-[0.24em] text-cream/60 hover:text-gold"
                    >
                      Manage →
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-cream/40 py-10">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-obsidian/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-obsidian border border-cream/15 max-w-lg w-full p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Customer</p>
              <h3 className="font-serif text-2xl mt-1">{selected.full_name ?? "Anonymous"}</h3>
              <p className="text-[10px] text-cream/50 mt-1">{selected.id}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Orders" value={String(selected.stats?.count ?? 0)} />
              <StatCard label="Spend" value={formatINR(selected.stats?.spend ?? 0)} tone="gold" />
              <StatCard label="Points" value={String(selected.loyalty_points ?? 0)} />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-2">Assign Role</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((r) => {
                  const active = selected.roles.includes(r.value);
                  return (
                    <button
                      key={r.value}
                      onClick={() => setRole(selected.id, r.value)}
                      className={`text-left border px-3 py-2 ${
                        active ? "border-gold text-gold bg-gold/[0.05]" : "border-cream/15 hover:border-cream/40"
                      }`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.24em]">{r.label}</p>
                      <p className="text-[10px] text-cream/50 mt-0.5">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-2">Adjust Loyalty Points</p>
              <div className="flex gap-2 flex-wrap">
                {[+100, +500, +1000, -100, -500].map((d) => (
                  <button
                    key={d}
                    onClick={() => adjustPoints(selected.id, d)}
                    className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] border ${
                      d > 0 ? "border-cream/15 hover:border-gold hover:text-gold" : "border-cream/15 hover:border-red-400 hover:text-red-400"
                    }`}
                  >
                    {d > 0 ? `+${d}` : d}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="w-full border border-cream/15 hover:border-gold hover:text-gold py-2.5 text-[10px] uppercase tracking-[0.28em]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function RolesTab() {
  const qc = useQueryClient();
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager" | "staff">("staff");

  const { data: team } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("id,user_id,role,created_at")
        .in("role", ["admin", "manager", "staff"] as any);
      const ids = Array.from(new Set((roles ?? []).map((r: any) => r.user_id)));
      const { data: profiles } = ids.length
        ? await supabase.from("profiles").select("id,full_name,avatar_url").in("id", ids)
        : { data: [] as any[] };
      const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      return (roles ?? []).map((r: any) => ({ ...r, profile: pmap.get(r.user_id) }));
    },
  });

  async function grant() {
    if (!newUserId.trim()) return toast.error("Enter a user ID");
    await supabase.from("user_roles").delete().eq("user_id", newUserId.trim());
    const { error } = await supabase.from("user_roles").insert({ user_id: newUserId.trim(), role: newRole } as any);
    if (error) return toast.error(error.message);
    await logAudit("role.grant", "user", newUserId.trim(), { role: newRole });
    toast.success("Role granted");
    setNewUserId("");
    qc.invalidateQueries({ queryKey: ["admin", "team"] });
    qc.invalidateQueries({ queryKey: ["admin", "customers", "roles"] });
  }

  async function revoke(id: string, userId: string, role: string) {
    if (!confirm(`Revoke ${role} from this user?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await supabase.from("user_roles").insert({ user_id: userId, role: "customer" } as any);
    await logAudit("role.revoke", "user", userId, { role });
    toast.success("Role revoked");
    qc.invalidateQueries({ queryKey: ["admin", "team"] });
  }

  return (
    <section className="space-y-8">
      <div className="border border-cream/10 p-6">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold mb-4">Grant Role</p>
        <div className="grid md:grid-cols-[1fr_180px_auto] gap-3">
          <input
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="User ID (UUID from Customers list)"
            className="bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-2.5 text-sm font-mono"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as any)}
            className="bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-2.5 text-sm"
          >
            <option value="admin" className="bg-obsidian">Admin</option>
            <option value="manager" className="bg-obsidian">Manager</option>
            <option value="staff" className="bg-obsidian">Staff</option>
          </select>
          <button
            onClick={grant}
            className="bg-gold text-obsidian px-6 py-2.5 text-[10px] uppercase tracking-[0.28em] hover:bg-gold/90"
          >
            Grant Role
          </button>
        </div>
        <p className="text-[10px] text-cream/40 mt-3">
          Copy a user's UUID from the Customers module and paste it here to elevate them.
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-cream/50 mb-3">Permission Matrix</p>
        <div className="border border-cream/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/[0.03] text-[10px] uppercase tracking-[0.24em] text-cream/50">
              <tr>
                <th className="text-left px-4 py-3">Capability</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/5">
              {[
                ["View dashboard", true, true, true],
                ["Manage products & catalog", true, true, false],
                ["Manage orders", true, true, true],
                ["Refunds & returns", true, true, false],
                ["Marketing & coupons", true, true, false],
                ["Content & CMS", true, true, false],
                ["Manage roles & team", true, false, false],
                ["View audit logs", true, false, false],
              ].map(([cap, a, m, s]) => (
                <tr key={cap as string}>
                  <td className="px-4 py-3">{cap}</td>
                  {[a, m, s].map((v, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      {v ? <span className="text-gold">●</span> : <span className="text-cream/20">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-cream/50 mb-3">Team Members</p>
        <div className="border border-cream/10">
          <table className="w-full text-sm">
            <thead className="bg-cream/[0.03] text-[10px] uppercase tracking-[0.24em] text-cream/50">
              <tr>
                <th className="text-left px-4 py-3">Member</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Granted</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/5">
              {(team ?? []).map((r: any) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {r.profile?.avatar_url ? (
                        <img src={r.profile.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cream/10" />
                      )}
                      <div>
                        <p>{r.profile?.full_name ?? "Anonymous"}</p>
                        <p className="text-[10px] text-cream/40">{r.user_id.slice(0, 12)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] uppercase tracking-[0.24em] border px-2 py-0.5 ${
                        r.role === "admin"
                          ? "border-gold text-gold"
                          : r.role === "manager"
                            ? "border-cream/40 text-cream"
                            : "border-cream/25 text-cream/70"
                      }`}
                    >
                      {r.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-cream/50 uppercase tracking-[0.2em]">
                    {new Date(r.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => revoke(r.id, r.user_id, r.role)}
                      className="text-[10px] uppercase tracking-[0.24em] text-cream/50 hover:text-red-400"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
              {(team ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-cream/40 py-10">
                    No team members yet. Grant a role above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AuditLogsTab() {
  const [actionFilter, setActionFilter] = useState("");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin", "audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const filtered = (logs ?? []).filter((l: any) =>
    actionFilter ? l.action.toLowerCase().includes(actionFilter.toLowerCase()) : true,
  );

  function exportCsv() {
    if (!filtered.length) return;
    const headers = ["created_at", "actor_email", "action", "entity", "entity_id", "details"];
    const csv = [
      headers.join(","),
      ...filtered.map((r: any) =>
        headers
          .map((h) => {
            const v = h === "details" ? JSON.stringify(r[h] ?? {}) : r[h] ?? "";
            return `"${String(v).replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Filter by action (e.g. role, loyalty)…"
          className="bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-2.5 text-sm w-full max-w-md"
        />
        <span className="text-cream/40 text-[10px] uppercase tracking-[0.28em]">
          {filtered.length} entries
        </span>
        <button
          onClick={exportCsv}
          className="ml-auto border border-cream/15 hover:border-gold hover:text-gold px-4 py-2 text-[10px] uppercase tracking-[0.28em]"
        >
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <p className="text-cream/40 text-sm">Loading logs…</p>
      ) : filtered.length === 0 ? (
        <div className="border border-cream/10 p-12 text-center">
          <ScrollText className="w-8 h-8 mx-auto text-cream/30 mb-3" />
          <p className="text-cream/60">No audit entries yet.</p>
          <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 mt-2">
            Role changes, loyalty adjustments, and other admin actions will appear here.
          </p>
        </div>
      ) : (
        <div className="border border-cream/10 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-cream/[0.03] text-[10px] uppercase tracking-[0.24em] text-cream/50">
              <tr>
                <th className="text-left px-4 py-3">Timestamp</th>
                <th className="text-left px-4 py-3">Actor</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Entity</th>
                <th className="text-left px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/5">
              {filtered.map((l: any) => (
                <tr key={l.id} className="hover:bg-cream/[0.02] align-top">
                  <td className="px-4 py-3 text-[11px] text-cream/60 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-[11px]">
                    <p className="truncate max-w-[180px]">{l.actor_email ?? "system"}</p>
                    <p className="text-cream/40 text-[10px]">{(l.actor_id ?? "").slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] uppercase tracking-[0.24em] border border-gold/40 text-gold px-2 py-0.5">
                      {l.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-cream/70">
                    {l.entity ?? "—"}
                    {l.entity_id && (
                      <p className="text-cream/40 text-[10px] font-mono">{String(l.entity_id).slice(0, 12)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[11px] text-cream/60">
                    <code className="text-[10px] break-all">
                      {l.details ? JSON.stringify(l.details) : "—"}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "gold" }) {
  return (
    <div className={`border p-4 ${tone === "gold" ? "border-gold/40 bg-gold/[0.03]" : "border-cream/10"}`}>
      <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">{label}</p>
      <p className={`mt-2 font-serif text-2xl ${tone === "gold" ? "text-gold" : ""}`}>{value}</p>
    </div>
  );
}


// ---------- Inventory ----------
function InventoryTab() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [bulk, setBulk] = useState<Record<string, string>>({});
  const [adjustFor, setAdjustFor] = useState<any | null>(null);
  const [adjDelta, setAdjDelta] = useState("");
  const [adjReason, setAdjReason] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,slug,sku,stock,price_inr,image_url,is_active,collection_id")
        .order("stock", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = products.filter((p: any) => {
    if (filter === "low" && !(p.stock > 0 && p.stock <= 5)) return false;
    if (filter === "out" && p.stock !== 0) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!p.name.toLowerCase().includes(s) && !(p.sku ?? "").toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const totalUnits = products.reduce((s: number, p: any) => s + (p.stock ?? 0), 0);
  const totalValue = products.reduce((s: number, p: any) => s + (p.stock ?? 0) * (p.price_inr ?? 0), 0);
  const lowCount = products.filter((p: any) => p.stock > 0 && p.stock <= 5).length;
  const outCount = products.filter((p: any) => p.stock === 0).length;

  async function saveStock(id: string, current: number) {
    const nextRaw = bulk[id];
    if (nextRaw === undefined || nextRaw === "") return;
    const next = Math.max(0, Math.floor(Number(nextRaw)));
    if (Number.isNaN(next) || next === current) return;
    const { error } = await supabase.from("products").update({ stock: next }).eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("inventory.set", "product", id, { from: current, to: next });
    toast.success("Stock updated");
    setBulk((b) => {
      const { [id]: _, ...rest } = b;
      return rest;
    });
    qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
  }

  async function submitAdjust() {
    if (!adjustFor) return;
    const delta = Math.floor(Number(adjDelta));
    if (!Number.isFinite(delta) || delta === 0) return toast.error("Enter a non-zero adjustment");
    const next = Math.max(0, (adjustFor.stock ?? 0) + delta);
    const { error } = await supabase.from("products").update({ stock: next }).eq("id", adjustFor.id);
    if (error) return toast.error(error.message);
    await logAudit("inventory.adjust", "product", adjustFor.id, {
      delta,
      from: adjustFor.stock,
      to: next,
      reason: adjReason || null,
    });
    toast.success(`${delta > 0 ? "+" : ""}${delta} units`);
    setAdjustFor(null);
    setAdjDelta("");
    setAdjReason("");
    qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
  }

  function exportCSV() {
    const rows = filtered.map((p: any) => ({
      sku: p.sku ?? "",
      name: p.name,
      slug: p.slug,
      stock: p.stock ?? 0,
      price_inr: p.price_inr ?? 0,
      value_inr: (p.stock ?? 0) * (p.price_inr ?? 0),
      active: p.is_active ? "yes" : "no",
    }));
    if (!rows.length) return toast.error("Nothing to export");
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r: any) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard label="Total SKUs" value={String(products.length)} />
        <StatCard label="Units on hand" value={String(totalUnits)} />
        <StatCard label="Inventory value" value={formatINR(totalValue)} tone="gold" />
        <StatCard label="Low / Out" value={`${lowCount} / ${outCount}`} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or SKU"
          className="input-mystique flex-1 min-w-[220px]"
        />
        <div className="flex border border-cream/15">
          {(["all", "low", "out"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[10px] uppercase tracking-[0.24em] ${
                filter === f ? "bg-gold text-obsidian" : "text-cream/60 hover:text-gold"
              }`}
            >
              {f === "all" ? "All" : f === "low" ? "Low stock" : "Out"}
            </button>
          ))}
        </div>
        <button
          onClick={exportCSV}
          className="border border-cream/15 hover:border-gold hover:text-gold px-4 py-2 text-[10px] uppercase tracking-[0.28em]"
        >
          Export CSV
        </button>
      </div>

      <div className="border border-cream/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream/[0.03]">
            <tr className="text-left text-[10px] uppercase tracking-[0.28em] text-cream/50">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Set</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream/5">
            {filtered.map((p: any) => {
              const status =
                p.stock === 0 ? { label: "Out", cls: "text-red-400" } :
                p.stock <= 5 ? { label: "Low", cls: "text-amber-400" } :
                { label: "In stock", cls: "text-cream/60" };
              const dirty = bulk[p.id] !== undefined && bulk[p.id] !== String(p.stock);
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-9 h-9 object-cover" />
                      ) : (
                        <div className="w-9 h-9 bg-cream/5" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate">{p.name}</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cream/40">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cream/60 font-mono text-xs">{p.sku ?? "—"}</td>
                  <td className="px-4 py-3">{p.stock ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        defaultValue={p.stock}
                        onChange={(e) => setBulk((b) => ({ ...b, [p.id]: e.target.value }))}
                        className="input-mystique w-20"
                      />
                      {dirty && (
                        <button
                          onClick={() => saveStock(p.id, p.stock ?? 0)}
                          className="bg-gold text-obsidian px-3 text-[10px] uppercase tracking-[0.24em]"
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cream/70">{formatINR((p.stock ?? 0) * (p.price_inr ?? 0))}</td>
                  <td className={`px-4 py-3 text-[10px] uppercase tracking-[0.24em] ${status.cls}`}>{status.label}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setAdjustFor(p)}
                      className="text-[10px] uppercase tracking-[0.24em] text-gold gold-underline"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-cream/40 text-sm">
                  No products match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {adjustFor && (
        <div className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-obsidian border border-cream/15 max-w-md w-full p-6 space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Stock adjustment</p>
              <h3 className="font-serif text-2xl mt-1">{adjustFor.name}</h3>
              <p className="text-cream/50 text-sm mt-1">Current stock: {adjustFor.stock ?? 0}</p>
            </div>
            <Field label="Delta (use negative to remove)">
              <input
                type="number"
                value={adjDelta}
                onChange={(e) => setAdjDelta(e.target.value)}
                placeholder="e.g. +50 or -3"
                className="input-mystique"
              />
            </Field>
            <Field label="Reason (optional)">
              <input
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                placeholder="Received shipment, damaged unit, recount…"
                className="input-mystique"
              />
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                onClick={submitAdjust}
                className="bg-gold text-obsidian px-6 py-3 text-[11px] uppercase tracking-[0.28em]"
              >
                Apply adjustment
              </button>
              <button
                onClick={() => { setAdjustFor(null); setAdjDelta(""); setAdjReason(""); }}
                className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.28em] hover:border-gold hover:text-gold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ---------- Shipping ----------
type ShippingZone = { id: string; name: string; regions: string; rate: number; freeAbove: number; etaDays: string };
type ShippingSettings = { currency: string; zones: ShippingZone[]; freeShippingThreshold: number; expressRate: number; note: string };

function ShippingTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<ShippingSettings | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "site_settings", "shipping"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings").select("*").eq("key", "shipping").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const defaults: ShippingSettings = {
    currency: "INR",
    freeShippingThreshold: 2500,
    expressRate: 350,
    note: "Orders ship within 24 hours from our Mumbai atelier.",
    zones: [
      { id: "metro", name: "Metro Cities", regions: "Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad", rate: 99, freeAbove: 2000, etaDays: "1–3" },
      { id: "tier2", name: "Tier II & III", regions: "Rest of India", rate: 149, freeAbove: 2500, etaDays: "3–5" },
      { id: "intl", name: "International", regions: "Worldwide", rate: 1499, freeAbove: 10000, etaDays: "7–14" },
    ],
  };
  const value: ShippingSettings = draft ?? { ...defaults, ...((data?.value as any) ?? {}) };
  const zones = value.zones ?? [];

  function update(patch: Partial<ShippingSettings>) {
    setDraft({ ...value, ...patch });
  }
  function updateZone(idx: number, patch: Partial<ShippingZone>) {
    update({ zones: zones.map((z, i) => (i === idx ? { ...z, ...patch } : z)) });
  }

  async function save() {
    const payload = { key: "shipping", value: value as any };
    const q = data?.id
      ? supabase.from("site_settings").update({ value: payload.value }).eq("id", data.id)
      : supabase.from("site_settings").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Shipping settings saved");
    await logAudit("shipping.update", "site_settings", data?.id ?? "shipping", { zones: zones.length });
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["admin", "site_settings", "shipping"] });
  }

  return (
    <section className="max-w-4xl">
      <p className="text-sm text-cream/60 mb-8">
        Configure shipping zones, per-zone rates, free-shipping thresholds, and estimated delivery times shown at checkout.
      </p>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Field label="Free-shipping threshold (₹)">
          <input
            type="number" min={0}
            value={value.freeShippingThreshold}
            onChange={(e) => update({ freeShippingThreshold: Math.max(0, Number(e.target.value) || 0) })}
            className="input-mystique"
          />
        </Field>
        <Field label="Express upgrade rate (₹)">
          <input
            type="number" min={0}
            value={value.expressRate}
            onChange={(e) => update({ expressRate: Math.max(0, Number(e.target.value) || 0) })}
            className="input-mystique"
          />
        </Field>
        <Field label="Currency">
          <input
            value={value.currency}
            onChange={(e) => update({ currency: e.target.value })}
            className="input-mystique"
          />
        </Field>
      </div>

      <Field label="Checkout note">
        <textarea
          rows={2}
          value={value.note}
          onChange={(e) => update({ note: e.target.value })}
          className="input-mystique"
        />
      </Field>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-2xl">Zones</h3>
          <button
            onClick={() => update({ zones: [...zones, { id: `zone-${Date.now()}`, name: "New Zone", regions: "", rate: 0, freeAbove: 0, etaDays: "3–5" }] })}
            className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
          >
            + Add zone
          </button>
        </div>

        <div className="space-y-3">
          {zones.map((z, idx) => (
            <div key={z.id} className="border border-cream/10 p-4 grid gap-3 md:grid-cols-[1.2fr_2fr_120px_140px_120px_auto] items-end">
              <Field label="Name">
                <input value={z.name} onChange={(e) => updateZone(idx, { name: e.target.value })} className="input-mystique" />
              </Field>
              <Field label="Regions">
                <input value={z.regions} onChange={(e) => updateZone(idx, { regions: e.target.value })} className="input-mystique" />
              </Field>
              <Field label="Rate (₹)">
                <input type="number" min={0} value={z.rate} onChange={(e) => updateZone(idx, { rate: Math.max(0, Number(e.target.value) || 0) })} className="input-mystique" />
              </Field>
              <Field label="Free above (₹)">
                <input type="number" min={0} value={z.freeAbove} onChange={(e) => updateZone(idx, { freeAbove: Math.max(0, Number(e.target.value) || 0) })} className="input-mystique" />
              </Field>
              <Field label="ETA (days)">
                <input value={z.etaDays} onChange={(e) => updateZone(idx, { etaDays: e.target.value })} className="input-mystique" />
              </Field>
              <button
                onClick={() => update({ zones: zones.filter((_, i) => i !== idx) })}
                className="border border-cream/15 hover:border-red-400/60 text-cream/60 hover:text-red-400 text-[10px] uppercase tracking-[0.24em] px-3 py-2.5"
              >
                Remove
              </button>
            </div>
          ))}
          {zones.length === 0 && (
            <p className="text-cream/50 text-sm">No zones configured.</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-10">
        <button
          onClick={save}
          disabled={!draft}
          className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40"
        >
          Save shipping
        </button>
        {draft && (
          <button
            onClick={() => setDraft(null)}
            className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold"
          >
            Discard
          </button>
        )}
      </div>
    </section>
  );
}

// ---------- Taxes ----------
type TaxRule = { id: string; name: string; region: string; ratePct: number; appliesTo: "all" | "fragrance" | "gifting" };
type TaxSettings = { pricesIncludeTax: boolean; displayLabel: string; gstin: string; rules: TaxRule[] };

function TaxesTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<TaxSettings | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "site_settings", "taxes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings").select("*").eq("key", "taxes").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const defaults: TaxSettings = {
    pricesIncludeTax: true,
    displayLabel: "GST included",
    gstin: "",
    rules: [
      { id: "gst-in", name: "GST (India)", region: "India", ratePct: 18, appliesTo: "all" },
      { id: "gst-gift", name: "GST — Gifting", region: "India", ratePct: 12, appliesTo: "gifting" },
    ],
  };
  const value: TaxSettings = draft ?? { ...defaults, ...((data?.value as any) ?? {}) };
  const rules = value.rules ?? [];

  function update(patch: Partial<TaxSettings>) {
    setDraft({ ...value, ...patch });
  }
  function updateRule(idx: number, patch: Partial<TaxRule>) {
    update({ rules: rules.map((r, i) => (i === idx ? { ...r, ...patch } : r)) });
  }

  async function save() {
    const payload = { key: "taxes", value: value as any };
    const q = data?.id
      ? supabase.from("site_settings").update({ value: payload.value }).eq("id", data.id)
      : supabase.from("site_settings").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("Tax settings saved");
    await logAudit("taxes.update", "site_settings", data?.id ?? "taxes", { rules: rules.length });
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["admin", "site_settings", "taxes"] });
  }

  return (
    <section className="max-w-4xl">
      <p className="text-sm text-cream/60 mb-8">
        Configure how tax is displayed and applied. Rates are for reference / display; the checkout ledger currently uses catalog prices as final — enable line-level tax by wiring these rules into the order summary when needed.
      </p>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Field label="Prices include tax">
          <select
            value={value.pricesIncludeTax ? "yes" : "no"}
            onChange={(e) => update({ pricesIncludeTax: e.target.value === "yes" })}
            className="input-mystique"
          >
            <option value="yes">Yes — prices are tax-inclusive</option>
            <option value="no">No — tax added at checkout</option>
          </select>
        </Field>
        <Field label="Display label">
          <input
            value={value.displayLabel}
            onChange={(e) => update({ displayLabel: e.target.value })}
            className="input-mystique"
          />
        </Field>
        <Field label="GSTIN (for invoices)">
          <input
            value={value.gstin}
            onChange={(e) => update({ gstin: e.target.value })}
            placeholder="27ABCDE1234F1Z5"
            className="input-mystique"
          />
        </Field>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-2xl">Tax rules</h3>
          <button
            onClick={() => update({ rules: [...rules, { id: `rule-${Date.now()}`, name: "New Rule", region: "India", ratePct: 18, appliesTo: "all" }] })}
            className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
          >
            + Add rule
          </button>
        </div>

        <div className="space-y-3">
          {rules.map((r, idx) => (
            <div key={r.id} className="border border-cream/10 p-4 grid gap-3 md:grid-cols-[1.4fr_1fr_120px_1fr_auto] items-end">
              <Field label="Name">
                <input value={r.name} onChange={(e) => updateRule(idx, { name: e.target.value })} className="input-mystique" />
              </Field>
              <Field label="Region">
                <input value={r.region} onChange={(e) => updateRule(idx, { region: e.target.value })} className="input-mystique" />
              </Field>
              <Field label="Rate (%)">
                <input
                  type="number" min={0} step={0.5}
                  value={r.ratePct}
                  onChange={(e) => updateRule(idx, { ratePct: Math.max(0, Number(e.target.value) || 0) })}
                  className="input-mystique"
                />
              </Field>
              <Field label="Applies to">
                <select
                  value={r.appliesTo}
                  onChange={(e) => updateRule(idx, { appliesTo: e.target.value as TaxRule["appliesTo"] })}
                  className="input-mystique"
                >
                  <option value="all">All products</option>
                  <option value="fragrance">Fragrance only</option>
                  <option value="gifting">Gifting only</option>
                </select>
              </Field>
              <button
                onClick={() => update({ rules: rules.filter((_, i) => i !== idx) })}
                className="border border-cream/15 hover:border-red-400/60 text-cream/60 hover:text-red-400 text-[10px] uppercase tracking-[0.24em] px-3 py-2.5"
              >
                Remove
              </button>
            </div>
          ))}
          {rules.length === 0 && (
            <p className="text-cream/50 text-sm">No tax rules configured.</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-10">
        <button
          onClick={save}
          disabled={!draft}
          className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40"
        >
          Save taxes
        </button>
        {draft && (
          <button
            onClick={() => setDraft(null)}
            className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold"
          >
            Discard
          </button>
        )}
      </div>
    </section>
  );
}

// ============================================================
// Marketing — Broadcasts / Campaigns
// ============================================================
type Broadcast = {
  id: string;
  name: string;
  channel: "email" | "sms" | "push";
  audience: "all" | "loyalty" | "recent" | "vip";
  subject: string;
  body: string;
  scheduledAt?: string | null;
  status: "draft" | "scheduled" | "sent";
  sentAt?: string | null;
  createdAt: string;
};

function MarketingTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Broadcast | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "site_settings", "marketing"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings").select("*").eq("key", "marketing").maybeSingle();
      return data;
    },
  });

  const campaigns: Broadcast[] = ((data?.value as any)?.campaigns as Broadcast[]) ?? [];

  async function persist(next: Broadcast[]) {
    const payload = { key: "marketing", value: { campaigns: next } as any };
    const q = data?.id
      ? supabase.from("site_settings").update({ value: payload.value }).eq("id", data.id)
      : supabase.from("site_settings").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "site_settings", "marketing"] });
  }

  function newDraft() {
    setDraft({
      id: `bc-${Date.now()}`,
      name: "New broadcast",
      channel: "email",
      audience: "all",
      subject: "",
      body: "",
      scheduledAt: null,
      status: "draft",
      createdAt: new Date().toISOString(),
    });
  }

  async function saveDraft(status: Broadcast["status"] = "draft") {
    if (!draft) return;
    const next = { ...draft, status, sentAt: status === "sent" ? new Date().toISOString() : draft.sentAt };
    const exists = campaigns.some((c) => c.id === next.id);
    const list = exists ? campaigns.map((c) => (c.id === next.id ? next : c)) : [next, ...campaigns];
    await persist(list);
    await logAudit("marketing.save", "broadcast", next.id, { channel: next.channel, status });
    toast.success(status === "sent" ? "Broadcast marked sent" : status === "scheduled" ? "Scheduled" : "Draft saved");
    setDraft(null);
  }

  async function remove(id: string) {
    if (!confirm("Delete this broadcast?")) return;
    await persist(campaigns.filter((c) => c.id !== id));
    toast.success("Deleted");
  }

  const kpi = {
    total: campaigns.length,
    sent: campaigns.filter((c) => c.status === "sent").length,
    scheduled: campaigns.filter((c) => c.status === "scheduled").length,
    drafts: campaigns.filter((c) => c.status === "draft").length,
  };

  return (
    <section className="max-w-5xl">
      <p className="text-sm text-cream/60 mb-8">
        Compose email, SMS or push broadcasts. Delivery is manual — export the audience from Customers and send from your ESP. Each broadcast tracks status here.
      </p>

      <div className="grid gap-3 md:grid-cols-4 mb-8">
        {[
          { label: "Total", value: kpi.total },
          { label: "Sent", value: kpi.sent },
          { label: "Scheduled", value: kpi.scheduled },
          { label: "Drafts", value: kpi.drafts },
        ].map((k) => (
          <div key={k.label} className="border border-cream/10 p-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-cream/40">{k.label}</p>
            <p className="font-serif text-2xl mt-2">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-2xl">Campaigns</h3>
        <button onClick={newDraft} className="bg-gold text-obsidian px-5 py-2.5 text-[11px] uppercase tracking-[0.3em]">
          + New broadcast
        </button>
      </div>

      <div className="border border-cream/10 divide-y divide-cream/10">
        {campaigns.length === 0 && (
          <p className="p-8 text-center text-cream/40 text-sm">No broadcasts yet.</p>
        )}
        {campaigns.map((c) => (
          <div key={c.id} className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <span className="text-[9px] uppercase tracking-[0.28em] px-2 py-0.5 border border-cream/20 text-cream/60">{c.channel}</span>
                <span className={`text-[9px] uppercase tracking-[0.28em] px-2 py-0.5 ${c.status === "sent" ? "bg-gold/20 text-gold" : c.status === "scheduled" ? "border border-gold/40 text-gold" : "border border-cream/20 text-cream/50"}`}>{c.status}</span>
              </div>
              <p className="text-xs text-cream/50 truncate mt-1">
                {c.audience} · {c.subject || "(no subject)"}
              </p>
            </div>
            <button onClick={() => setDraft(c)} className="text-[11px] uppercase tracking-[0.28em] text-cream/60 hover:text-gold">Edit</button>
            <button onClick={() => remove(c.id)} className="text-[11px] uppercase tracking-[0.28em] text-cream/40 hover:text-red-400">Delete</button>
          </div>
        ))}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 bg-obsidian/95 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-16 px-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-3xl">Broadcast</h3>
              <button onClick={() => setDraft(null)} className="text-cream/50 hover:text-cream text-[11px] uppercase tracking-[0.3em]">Close</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Campaign name">
                <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="input-mystique" />
              </Field>
              <Field label="Channel">
                <select value={draft.channel} onChange={(e) => setDraft({ ...draft, channel: e.target.value as Broadcast["channel"] })} className="input-mystique">
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push</option>
                </select>
              </Field>
              <Field label="Audience">
                <select value={draft.audience} onChange={(e) => setDraft({ ...draft, audience: e.target.value as Broadcast["audience"] })} className="input-mystique">
                  <option value="all">All customers</option>
                  <option value="loyalty">Loyalty members</option>
                  <option value="recent">Recent buyers (30d)</option>
                  <option value="vip">VIP (Noir tier)</option>
                </select>
              </Field>
              <Field label="Schedule at (optional)">
                <input type="datetime-local" value={draft.scheduledAt ?? ""} onChange={(e) => setDraft({ ...draft, scheduledAt: e.target.value || null })} className="input-mystique" />
              </Field>
              <div className="md:col-span-2">
                <Field label="Subject / Headline">
                  <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} className="input-mystique" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Body">
                  <textarea rows={10} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className="input-mystique" />
                </Field>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => saveDraft("draft")} className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold">Save draft</button>
              <button onClick={() => saveDraft("scheduled")} className="border border-gold text-gold px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-gold hover:text-obsidian">Schedule</button>
              <button onClick={() => saveDraft("sent")} className="bg-gold text-obsidian px-6 py-3 text-[11px] uppercase tracking-[0.3em]">Mark sent</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ============================================================
// Email Templates
// ============================================================
type EmailTemplate = {
  id: string;
  key: string;
  name: string;
  subject: string;
  body: string;
  enabled: boolean;
};

const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: "welcome", key: "welcome", name: "Welcome", enabled: true,
    subject: "Welcome to Mystique Blends",
    body: "Dear {{name}},\n\nWelcome to the atelier. Your fragrance journey begins with our curated collection.\n\n— Mystique Blends" },
  { id: "order_placed", key: "order_placed", name: "Order placed", enabled: true,
    subject: "Order confirmed · #{{order_id}}",
    body: "Thank you {{name}}.\n\nWe have received your order #{{order_id}} for {{total}}.\n\nOur atelier will prepare your fragrances with care." },
  { id: "order_shipped", key: "order_shipped", name: "Order shipped", enabled: true,
    subject: "Your order is on its way · #{{order_id}}",
    body: "{{name}}, your order #{{order_id}} has been dispatched. Tracking: {{tracking}}." },
  { id: "order_delivered", key: "order_delivered", name: "Order delivered", enabled: true,
    subject: "Delivered · #{{order_id}}",
    body: "{{name}}, your order #{{order_id}} has been delivered. We would love to hear your thoughts." },
  { id: "order_cancelled", key: "order_cancelled", name: "Order cancelled", enabled: true,
    subject: "Order cancelled · #{{order_id}}",
    body: "{{name}}, your order #{{order_id}} has been cancelled. Any charge will be refunded per our policy." },
  { id: "password_reset", key: "password_reset", name: "Password reset", enabled: true,
    subject: "Reset your Mystique Blends password",
    body: "Click below to reset your password.\n\n{{reset_link}}" },
  { id: "abandoned_cart", key: "abandoned_cart", name: "Abandoned cart", enabled: false,
    subject: "Still thinking it over?",
    body: "{{name}}, your selections are waiting. Return anytime — the atelier keeps your cart safe." },
  { id: "review_request", key: "review_request", name: "Review request", enabled: true,
    subject: "How was your Mystique moment?",
    body: "{{name}}, share your thoughts on {{product}} — your voice guides our craft." },
];

function EmailTemplatesTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<EmailTemplate | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "site_settings", "email_templates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings").select("*").eq("key", "email_templates").maybeSingle();
      return data;
    },
  });

  const stored: EmailTemplate[] = ((data?.value as any)?.templates as EmailTemplate[]) ?? [];
  const templates: EmailTemplate[] = DEFAULT_EMAIL_TEMPLATES.map(
    (t) => stored.find((s) => s.key === t.key) ?? t,
  );

  async function persist(next: EmailTemplate[]) {
    const payload = { key: "email_templates", value: { templates: next } as any };
    const q = data?.id
      ? supabase.from("site_settings").update({ value: payload.value }).eq("id", data.id)
      : supabase.from("site_settings").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "site_settings", "email_templates"] });
  }

  async function saveOne(t: EmailTemplate) {
    const list = templates.map((x) => (x.key === t.key ? t : x));
    await persist(list);
    await logAudit("email_template.save", "template", t.key, { enabled: t.enabled });
    toast.success("Template saved");
    setEditing(null);
  }

  async function toggle(t: EmailTemplate) {
    await persist(templates.map((x) => (x.key === t.key ? { ...x, enabled: !x.enabled } : x)));
  }

  return (
    <section className="max-w-4xl">
      <p className="text-sm text-cream/60 mb-8">
        Transactional templates for auth and order events. Placeholders like <code className="text-gold">{'{{name}}'}</code> and <code className="text-gold">{'{{order_id}}'}</code> are replaced when the email is sent by your ESP.
      </p>

      <div className="border border-cream/10 divide-y divide-cream/10">
        {templates.map((t) => (
          <div key={t.key} className="p-4 flex items-center gap-4">
            <button
              onClick={() => toggle(t)}
              className={`w-10 h-6 rounded-full relative transition-colors ${t.enabled ? "bg-gold" : "bg-cream/20"}`}
              aria-label="Toggle"
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-obsidian transition-all ${t.enabled ? "left-4" : "left-0.5"}`} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-cream/50 truncate">{t.subject}</p>
            </div>
            <code className="text-[10px] text-cream/40 hidden md:inline">{t.key}</code>
            <button onClick={() => setEditing(t)} className="text-[11px] uppercase tracking-[0.28em] text-gold gold-underline">Edit</button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-obsidian/95 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-16 px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-cream/40">Template</p>
                <h3 className="font-serif text-3xl mt-1">{editing.name}</h3>
              </div>
              <button onClick={() => setEditing(null)} className="text-cream/50 hover:text-cream text-[11px] uppercase tracking-[0.3em]">Close</button>
            </div>
            <div className="space-y-4">
              <Field label="Subject">
                <input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} className="input-mystique" />
              </Field>
              <Field label="Body">
                <textarea rows={14} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="input-mystique font-mono text-sm" />
              </Field>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/40">
                Available placeholders: name · order_id · total · tracking · product · reset_link
              </p>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => saveOne(editing)} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em]">Save template</button>
              <button onClick={() => setEditing(null)} className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ============================================================
// SEO defaults
// ============================================================
type SeoSettings = {
  titleSuffix: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  twitterHandle: string;
  robotsIndex: boolean;
  canonicalHost: string;
  gaMeasurementId: string;
  gscVerification: string;
  keywords: string;
};

function SeoTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<SeoSettings | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "site_settings", "seo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings").select("*").eq("key", "seo").maybeSingle();
      return data;
    },
  });

  const defaults: SeoSettings = {
    titleSuffix: " · Mystique Blends",
    defaultTitle: "Mystique Blends — Luxury Perfume Atelier",
    defaultDescription: "Rare oud, hand-crafted attars, and modern luxury fragrances from the Mystique Blends atelier.",
    defaultOgImage: "",
    twitterHandle: "@mystiqueblends",
    robotsIndex: true,
    canonicalHost: "",
    gaMeasurementId: "",
    gscVerification: "",
    keywords: "luxury perfume, oud, attar, indian fragrance, niche perfumery",
  };
  const value: SeoSettings = draft ?? { ...defaults, ...((data?.value as any) ?? {}) };

  function update(patch: Partial<SeoSettings>) {
    setDraft({ ...value, ...patch });
  }

  async function save() {
    const payload = { key: "seo", value: value as any };
    const q = data?.id
      ? supabase.from("site_settings").update({ value: payload.value }).eq("id", data.id)
      : supabase.from("site_settings").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success("SEO settings saved");
    await logAudit("seo.update", "site_settings", data?.id ?? "seo", {});
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["admin", "site_settings", "seo"] });
  }

  return (
    <section className="max-w-4xl">
      <p className="text-sm text-cream/60 mb-8">
        Site-wide SEO defaults. Individual pages (products, journal) inherit these unless they set their own overrides.
      </p>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Field label="Default title">
          <input value={value.defaultTitle} onChange={(e) => update({ defaultTitle: e.target.value })} className="input-mystique" />
        </Field>
        <Field label="Title suffix">
          <input value={value.titleSuffix} onChange={(e) => update({ titleSuffix: e.target.value })} className="input-mystique" />
        </Field>
        <div className="md:col-span-2">
          <Field label="Default meta description">
            <textarea rows={3} value={value.defaultDescription} onChange={(e) => update({ defaultDescription: e.target.value })} className="input-mystique" />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Keywords (comma-separated)">
            <input value={value.keywords} onChange={(e) => update({ keywords: e.target.value })} className="input-mystique" />
          </Field>
        </div>
        <Field label="Default OG image URL">
          <input value={value.defaultOgImage} onChange={(e) => update({ defaultOgImage: e.target.value })} placeholder="https://..." className="input-mystique" />
        </Field>
        <Field label="Twitter handle">
          <input value={value.twitterHandle} onChange={(e) => update({ twitterHandle: e.target.value })} placeholder="@handle" className="input-mystique" />
        </Field>
        <Field label="Canonical host (optional)">
          <input value={value.canonicalHost} onChange={(e) => update({ canonicalHost: e.target.value })} placeholder="https://mystiqueblends.com" className="input-mystique" />
        </Field>
        <Field label="Allow search indexing">
          <select value={value.robotsIndex ? "yes" : "no"} onChange={(e) => update({ robotsIndex: e.target.value === "yes" })} className="input-mystique">
            <option value="yes">Yes — index this site</option>
            <option value="no">No — noindex, nofollow</option>
          </select>
        </Field>
        <Field label="Google Analytics ID">
          <input value={value.gaMeasurementId} onChange={(e) => update({ gaMeasurementId: e.target.value })} placeholder="G-XXXXXXX" className="input-mystique" />
        </Field>
        <Field label="Search Console verification">
          <input value={value.gscVerification} onChange={(e) => update({ gscVerification: e.target.value })} placeholder="google-site-verification=..." className="input-mystique" />
        </Field>
      </div>

      <div className="border border-cream/10 p-6 mb-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-cream/40 mb-3">Search preview</p>
        <p className="text-blue-300 text-lg font-serif">{value.defaultTitle}{value.titleSuffix}</p>
        <p className="text-green-400/70 text-xs mt-1">{value.canonicalHost || "https://mystiqueblends.com"}</p>
        <p className="text-cream/70 text-sm mt-2 line-clamp-2">{value.defaultDescription}</p>
      </div>

      <div className="flex gap-3">
        <button onClick={save} disabled={!draft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40">
          Save SEO
        </button>
        {draft && (
          <button onClick={() => setDraft(null)} className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold">Discard</button>
        )}
      </div>
    </section>
  );
}

// ============================================================
// MEDIA LIBRARY
// ============================================================
function MediaLibraryTab() {
  const qc = useQueryClient();
  const [folder, setFolder] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  const { data: files, isLoading } = useQuery({
    queryKey: ["admin", "media", folder],
    queryFn: async () => {
      const path = folder || "";
      const { data, error } = await supabase.storage
        .from("product-images")
        .list(path, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data ?? []).filter((f) => f.name && !f.name.startsWith("."));
    },
  });

  const { data: folders } = useQuery({
    queryKey: ["admin", "media", "folders"],
    queryFn: async () => {
      const { data } = await supabase.storage.from("product-images").list("", { limit: 100 });
      return (data ?? []).filter((f) => !f.metadata).map((f) => f.name);
    },
  });

  async function handleUpload(fileList: FileList) {
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10MB`);
        continue;
      }
      try {
        const publicUrl = await uploadToBlob(file, folder || "media");
        ok++;
        await logAudit("media.upload", "storage", publicUrl, { size: file.size });
      } catch (err: any) {
        toast.error(err.message || `Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    if (ok) toast.success(`${ok} file(s) uploaded`);
    qc.invalidateQueries({ queryKey: ["admin", "media"] });
  }

  async function remove(name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    const path = folder ? `${folder}/${name}` : name;
    const { error } = await supabase.storage.from("product-images").remove([path]);
    if (error) return toast.error(error.message);
    await logAudit("media.delete", "storage", path);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin", "media"] });
  }

  function urlFor(name: string) {
    const path = folder ? `${folder}/${name}` : name;
    return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  function copyUrl(name: string) {
    navigator.clipboard.writeText(urlFor(name));
    toast.success("URL copied");
  }

  const filtered = (files ?? []).filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section>
      <p className="text-sm text-cream/60 mb-6">
        Upload, browse, and manage all images across the storefront — product shots, banners, journal covers, gift boxes.
      </p>

      <div className="flex flex-wrap gap-3 items-center mb-6">
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="input-mystique max-w-xs"
        >
          <option value="">All / media</option>
          {(folders ?? []).map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search filename..."
          className="input-mystique max-w-xs"
        />
        <label className="ml-auto bg-gold text-obsidian px-6 py-3 text-[10px] uppercase tracking-[0.3em] cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
          {uploading ? "Uploading..." : "Upload images"}
        </label>
      </div>

      {isLoading ? (
        <p className="text-cream/50 text-sm">Loading library...</p>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-cream/15 py-20 text-center text-cream/40 text-sm">
          No files in this folder. Upload to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {filtered.map((f) => (
            <div key={f.name} className="group relative border border-cream/10 bg-graphite/40">
              <img src={urlFor(f.name)} alt={f.name} className="w-full aspect-square object-cover" loading="lazy" />
              <div className="px-2 py-1.5">
                <p className="text-[10px] text-cream/70 truncate">{f.name}</p>
                <p className="text-[9px] text-cream/40">
                  {f.metadata?.size ? `${(f.metadata.size / 1024).toFixed(0)} KB` : ""}
                </p>
              </div>
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => copyUrl(f.name)}
                  className="bg-obsidian/85 text-cream p-1.5 hover:text-gold"
                  title="Copy URL"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  onClick={() => remove(f.name)}
                  className="bg-obsidian/85 text-cream p-1.5 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================
// BRANDING & IDENTITY
// ============================================================
type BrandingSettings = {
  brandName: string;
  tagline: string;
  logoUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  whatsapp: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
};

function BrandingTab() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<BrandingSettings | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "site_settings", "branding"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("key", "branding").maybeSingle();
      return data;
    },
  });

  const defaults: BrandingSettings = {
    brandName: "Mystique Blends",
    tagline: "Luxury Perfume Atelier",
    logoUrl: "",
    logoDarkUrl: "",
    faviconUrl: "",
    contactEmail: "concierge@mystiqueblends.com",
    contactPhone: "+91 00000 00000",
    address: "",
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
    whatsapp: "",
    currency: "INR",
    currencySymbol: "₹",
    timezone: "Asia/Kolkata",
  };
  const value: BrandingSettings = draft ?? { ...defaults, ...((data?.value as any) ?? {}) };

  function update(patch: Partial<BrandingSettings>) {
    setDraft({ ...value, ...patch });
  }

  async function save() {
    const payload = { key: "branding", value: value as any };
    const q = data?.id
      ? supabase.from("site_settings").update({ value: payload.value }).eq("id", data.id)
      : supabase.from("site_settings").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    await logAudit("branding.update", "site_settings", data?.id ?? "branding", {});
    toast.success("Branding saved");
    setDraft(null);
    qc.invalidateQueries({ queryKey: ["admin", "site_settings", "branding"] });
  }

  return (
    <section className="max-w-5xl space-y-10">
      <p className="text-sm text-cream/60">
        Core brand identity — name, tagline, logo, favicon, contact details, and social handles. These flow throughout the storefront.
      </p>

      {/* Identity */}
      <div>
        <h2 className="font-serif text-2xl mb-4">Identity</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Brand name">
            <input value={value.brandName} onChange={(e) => update({ brandName: e.target.value })} className="input-mystique" />
          </Field>
          <Field label="Tagline">
            <input value={value.tagline} onChange={(e) => update({ tagline: e.target.value })} className="input-mystique" />
          </Field>
        </div>
      </div>

      {/* Assets */}
      <div>
        <h2 className="font-serif text-2xl mb-4">Visual assets</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <ImageUpload label="Primary logo" value={value.logoUrl} onChange={(url) => update({ logoUrl: url })} folder="branding" />
          <ImageUpload label="Alternate logo" value={value.logoDarkUrl} onChange={(url) => update({ logoDarkUrl: url })} folder="branding" />
          <ImageUpload label="Favicon (512×512)" value={value.faviconUrl} onChange={(url) => update({ faviconUrl: url })} folder="branding" />
        </div>
      </div>

      {/* Contact */}
      <div>
        <h2 className="font-serif text-2xl mb-4">Contact & concierge</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Email">
            <input value={value.contactEmail} onChange={(e) => update({ contactEmail: e.target.value })} className="input-mystique" />
          </Field>
          <Field label="Phone">
            <input value={value.contactPhone} onChange={(e) => update({ contactPhone: e.target.value })} className="input-mystique" />
          </Field>
          <Field label="WhatsApp number">
            <input value={value.whatsapp} onChange={(e) => update({ whatsapp: e.target.value })} className="input-mystique" placeholder="+91..." />
          </Field>
          <Field label="Address">
            <input value={value.address} onChange={(e) => update({ address: e.target.value })} className="input-mystique" />
          </Field>
        </div>
      </div>

      {/* Social */}
      <div>
        <h2 className="font-serif text-2xl mb-4">Social channels</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Instagram URL">
            <input value={value.instagram} onChange={(e) => update({ instagram: e.target.value })} className="input-mystique" placeholder="https://instagram.com/..." />
          </Field>
          <Field label="Facebook URL">
            <input value={value.facebook} onChange={(e) => update({ facebook: e.target.value })} className="input-mystique" />
          </Field>
          <Field label="Twitter / X URL">
            <input value={value.twitter} onChange={(e) => update({ twitter: e.target.value })} className="input-mystique" />
          </Field>
          <Field label="YouTube URL">
            <input value={value.youtube} onChange={(e) => update({ youtube: e.target.value })} className="input-mystique" />
          </Field>
        </div>
      </div>

      {/* Regional */}
      <div>
        <h2 className="font-serif text-2xl mb-4">Regional</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Currency code">
            <input value={value.currency} onChange={(e) => update({ currency: e.target.value })} className="input-mystique" />
          </Field>
          <Field label="Currency symbol">
            <input value={value.currencySymbol} onChange={(e) => update({ currencySymbol: e.target.value })} className="input-mystique" />
          </Field>
          <Field label="Timezone">
            <input value={value.timezone} onChange={(e) => update({ timezone: e.target.value })} className="input-mystique" />
          </Field>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-cream/10">
        <button onClick={save} disabled={!draft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40">
          Save branding
        </button>
        {draft && (
          <button onClick={() => setDraft(null)} className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold">
            Discard
          </button>
        )}
      </div>
    </section>
  );
}

// ============================================================
// Automations Tab — trigger/action rules persisted in site_settings
// ============================================================
type Automation = {
  id: string;
  name: string;
  trigger: "order_placed" | "order_shipped" | "order_delivered" | "cart_abandoned" | "review_submitted" | "customer_signup" | "low_stock" | "birthday";
  action: "send_email" | "send_sms" | "send_push" | "grant_points" | "issue_coupon" | "notify_admin";
  config: string;
  active: boolean;
  runs: number;
};

const TRIGGER_LABELS: Record<Automation["trigger"], string> = {
  order_placed: "Order Placed",
  order_shipped: "Order Shipped",
  order_delivered: "Order Delivered",
  cart_abandoned: "Cart Abandoned (24h)",
  review_submitted: "Review Submitted",
  customer_signup: "New Customer",
  low_stock: "Low Stock Alert",
  birthday: "Customer Birthday",
};

const ACTION_LABELS: Record<Automation["action"], string> = {
  send_email: "Send Email",
  send_sms: "Send SMS",
  send_push: "Send Push Notification",
  grant_points: "Grant Loyalty Points",
  issue_coupon: "Issue Coupon",
  notify_admin: "Notify Admin",
};

function AutomationsTab() {
  const [rules, setRules] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Automation | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("value").eq("key", "automations").maybeSingle();
    setRules(((data?.value as any)?.rules ?? []) as Automation[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function persist(next: Automation[]) {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "automations", value: { rules: next } as any }, { onConflict: "key" });
    if (error) { toast.error(error.message); return; }
    setRules(next);
    await logAudit("automations.update", "site_settings", undefined, { count: next.length });
  }

  function newRule() {
    setEditing({
      id: crypto.randomUUID(),
      name: "",
      trigger: "order_placed",
      action: "send_email",
      config: "",
      active: true,
      runs: 0,
    });
  }

  async function save() {
    if (!editing) return;
    if (!editing.name.trim()) { toast.error("Name required"); return; }
    const exists = rules.find((r) => r.id === editing.id);
    const next = exists ? rules.map((r) => (r.id === editing.id ? editing : r)) : [...rules, editing];
    await persist(next);
    toast.success(exists ? "Automation updated" : "Automation created");
    setEditing(null);
  }

  async function toggle(id: string) {
    await persist(rules.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this automation?")) return;
    await persist(rules.filter((r) => r.id !== id));
    toast.success("Deleted");
  }

  if (loading) return <p className="text-cream/50 text-sm">Loading…</p>;

  const activeCount = rules.filter((r) => r.active).length;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Total Rules" value={String(rules.length)} />
        <Kpi label="Active" value={String(activeCount)} />
        <Kpi label="Paused" value={String(rules.length - activeCount)} />
        <Kpi label="Total Runs" value={String(rules.reduce((s, r) => s + (r.runs || 0), 0))} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-cream/60 text-sm">
          Trigger-action rules that fire automatically on store events.
        </p>
        <button onClick={newRule} className="bg-gold text-obsidian px-5 py-2.5 text-[11px] uppercase tracking-[0.3em]">
          + New Automation
        </button>
      </div>

      {editing && (
        <div className="border border-gold/40 bg-cream/[0.02] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl text-gold">
              {rules.some((r) => r.id === editing.id) ? "Edit" : "New"} Automation
            </h3>
            <button onClick={() => setEditing(null)} className="text-cream/50 hover:text-cream text-xs uppercase tracking-[0.28em]">
              Cancel
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Rule Name">
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="e.g. Thank customer after delivery"
                className="w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-2.5 text-sm"
              />
            </Field>
            <Field label="Active">
              <label className="flex items-center gap-2 text-sm text-cream/80 py-2">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="accent-gold"
                />
                Enabled
              </label>
            </Field>
            <Field label="When (Trigger)">
              <select
                value={editing.trigger}
                onChange={(e) => setEditing({ ...editing, trigger: e.target.value as Automation["trigger"] })}
                className="w-full bg-obsidian border border-cream/15 focus:border-gold outline-none px-3 py-2.5 text-sm"
              >
                {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Then (Action)">
              <select
                value={editing.action}
                onChange={(e) => setEditing({ ...editing, action: e.target.value as Automation["action"] })}
                className="w-full bg-obsidian border border-cream/15 focus:border-gold outline-none px-3 py-2.5 text-sm"
              >
                {Object.entries(ACTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Configuration (email subject, points amount, coupon code, etc.)">
                <textarea
                  value={editing.config}
                  onChange={(e) => setEditing({ ...editing, config: e.target.value })}
                  rows={3}
                  placeholder="e.g. Subject: Thanks for your order — Template: order_placed"
                  className="w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-2.5 text-sm font-mono"
                />
              </Field>
            </div>
          </div>
          <div className="pt-4 border-t border-cream/10">
            <button onClick={save} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em]">
              Save Automation
            </button>
          </div>
        </div>
      )}

      {rules.length === 0 ? (
        <p className="text-cream/40 text-sm py-8 text-center border border-dashed border-cream/15">
          No automations yet — create your first rule to trigger emails, points, or coupons on store events.
        </p>
      ) : (
        <div className="border border-cream/10">
          <table className="w-full text-sm">
            <thead className="bg-cream/[0.03] text-[10px] uppercase tracking-[0.24em] text-cream/50">
              <tr>
                <th className="text-left px-4 py-3">Rule</th>
                <th className="text-left px-4 py-3">Trigger</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-right px-4 py-3">Runs</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-t border-cream/5 hover:bg-cream/[0.02]">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-cream/70">{TRIGGER_LABELS[r.trigger]}</td>
                  <td className="px-4 py-3 text-cream/70">{ACTION_LABELS[r.action]}</td>
                  <td className="px-4 py-3 text-right text-cream/60">{r.runs}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggle(r.id)}
                      className={`px-2.5 py-0.5 text-[9px] uppercase tracking-[0.24em] border ${
                        r.active ? "border-emerald-500/50 text-emerald-400" : "border-cream/20 text-cream/40"
                      }`}
                    >
                      {r.active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setEditing(r)} className="text-gold text-[10px] uppercase tracking-[0.28em]">Edit</button>
                    <button onClick={() => remove(r.id)} className="text-red-400/70 hover:text-red-400 text-[10px] uppercase tracking-[0.28em]">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-cream/10 p-4">
      <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">{label}</p>
      <p className="mt-2 font-serif text-2xl text-gold">{value}</p>
    </div>
  );
}

// ============================================================
// Store Settings — global store config & policies
// ============================================================
type StoreSettings = {
  store: { name: string; legalName: string; supportEmail: string; supportPhone: string; businessHours: string };
  orders: { minOrderInr: number; maxItemsPerOrder: number; codEnabled: boolean; prepaidEnabled: boolean; autoCancelUnpaidHours: number };
  returns: { enabled: boolean; windowDays: number; policy: string };
  cart: { abandonHours: number; freeShippingReminder: boolean };
  reviews: { autoApprove: boolean; minRating: number; requirePurchase: boolean };
  compliance: { gstin: string; fssai: string; cin: string; termsUrl: string; privacyUrl: string };
  maintenance: { enabled: boolean; message: string };
};

const DEFAULT_STORE: StoreSettings = {
  store: { name: "Mystique Blends", legalName: "Mystique Blends Pvt Ltd", supportEmail: "concierge@mystiqueblends.com", supportPhone: "+91 98765 43210", businessHours: "Mon–Sat, 10am–7pm IST" },
  orders: { minOrderInr: 0, maxItemsPerOrder: 20, codEnabled: true, prepaidEnabled: false, autoCancelUnpaidHours: 48 },
  returns: { enabled: true, windowDays: 7, policy: "Unopened bottles within 7 days of delivery. Custom blends non-returnable." },
  cart: { abandonHours: 24, freeShippingReminder: true },
  reviews: { autoApprove: false, minRating: 1, requirePurchase: true },
  compliance: { gstin: "", fssai: "", cin: "", termsUrl: "/p/terms", privacyUrl: "/p/privacy" },
  maintenance: { enabled: false, message: "We're crafting something special — back shortly." },
};

function StoreSettingsTab() {
  const [current, setCurrent] = useState<StoreSettings | null>(null);
  const [draft, setDraft] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "store").maybeSingle();
      const merged = { ...DEFAULT_STORE, ...((data?.value as any) ?? {}) } as StoreSettings;
      setCurrent(merged);
      setLoading(false);
    })();
  }, []);

  const view = draft ?? current;
  if (loading || !view) return <p className="text-cream/50 text-sm">Loading…</p>;

  function upd<K extends keyof StoreSettings>(section: K, patch: Partial<StoreSettings[K]>) {
    setDraft({ ...(view as StoreSettings), [section]: { ...(view as StoreSettings)[section], ...patch } });
  }

  async function save() {
    if (!draft) return;
    const { error } = await supabase.from("site_settings").upsert({ key: "store", value: draft as any }, { onConflict: "key" });
    if (error) { toast.error(error.message); return; }
    setCurrent(draft);
    setDraft(null);
    await logAudit("store_settings.update");
    toast.success("Store settings saved");
  }

  return (
    <section className="space-y-8">
      <p className="text-cream/60 text-sm">Global store configuration, policies, and compliance details.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Panel title="Store Identity">
          <Field label="Store Name"><Text value={view.store.name} onChange={(v) => upd("store", { name: v })} /></Field>
          <Field label="Legal Entity"><Text value={view.store.legalName} onChange={(v) => upd("store", { legalName: v })} /></Field>
          <Field label="Support Email"><Text value={view.store.supportEmail} onChange={(v) => upd("store", { supportEmail: v })} /></Field>
          <Field label="Support Phone"><Text value={view.store.supportPhone} onChange={(v) => upd("store", { supportPhone: v })} /></Field>
          <Field label="Business Hours"><Text value={view.store.businessHours} onChange={(v) => upd("store", { businessHours: v })} /></Field>
        </Panel>

        <Panel title="Order Rules">
          <Field label="Minimum Order (₹)"><Text type="number" value={String(view.orders.minOrderInr)} onChange={(v) => upd("orders", { minOrderInr: Number(v) || 0 })} /></Field>
          <Field label="Max Items per Order"><Text type="number" value={String(view.orders.maxItemsPerOrder)} onChange={(v) => upd("orders", { maxItemsPerOrder: Number(v) || 0 })} /></Field>
          <Field label="Auto-cancel Unpaid After (hours)"><Text type="number" value={String(view.orders.autoCancelUnpaidHours)} onChange={(v) => upd("orders", { autoCancelUnpaidHours: Number(v) || 0 })} /></Field>
          <Toggle label="Enable Cash on Delivery" checked={view.orders.codEnabled} onChange={(v) => upd("orders", { codEnabled: v })} />
          <Toggle label="Enable Prepaid Payments" checked={view.orders.prepaidEnabled} onChange={(v) => upd("orders", { prepaidEnabled: v })} />
        </Panel>

        <Panel title="Returns & Refunds">
          <Toggle label="Accept Returns" checked={view.returns.enabled} onChange={(v) => upd("returns", { enabled: v })} />
          <Field label="Return Window (days)"><Text type="number" value={String(view.returns.windowDays)} onChange={(v) => upd("returns", { windowDays: Number(v) || 0 })} /></Field>
          <Field label="Policy Summary">
            <textarea
              value={view.returns.policy}
              onChange={(e) => upd("returns", { policy: e.target.value })}
              rows={3}
              className="w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-2.5 text-sm"
            />
          </Field>
        </Panel>

        <Panel title="Cart & Reviews">
          <Field label="Cart Abandon After (hours)"><Text type="number" value={String(view.cart.abandonHours)} onChange={(v) => upd("cart", { abandonHours: Number(v) || 0 })} /></Field>
          <Toggle label="Show Free-Shipping Reminder" checked={view.cart.freeShippingReminder} onChange={(v) => upd("cart", { freeShippingReminder: v })} />
          <Toggle label="Auto-approve Reviews" checked={view.reviews.autoApprove} onChange={(v) => upd("reviews", { autoApprove: v })} />
          <Toggle label="Require Verified Purchase" checked={view.reviews.requirePurchase} onChange={(v) => upd("reviews", { requirePurchase: v })} />
          <Field label="Minimum Rating Accepted"><Text type="number" value={String(view.reviews.minRating)} onChange={(v) => upd("reviews", { minRating: Number(v) || 1 })} /></Field>
        </Panel>

        <Panel title="Compliance">
          <Field label="GSTIN"><Text value={view.compliance.gstin} onChange={(v) => upd("compliance", { gstin: v })} /></Field>
          <Field label="FSSAI License"><Text value={view.compliance.fssai} onChange={(v) => upd("compliance", { fssai: v })} /></Field>
          <Field label="CIN"><Text value={view.compliance.cin} onChange={(v) => upd("compliance", { cin: v })} /></Field>
          <Field label="Terms URL"><Text value={view.compliance.termsUrl} onChange={(v) => upd("compliance", { termsUrl: v })} /></Field>
          <Field label="Privacy URL"><Text value={view.compliance.privacyUrl} onChange={(v) => upd("compliance", { privacyUrl: v })} /></Field>
        </Panel>

        <Panel title="Maintenance Mode">
          <Toggle label="Enable Maintenance Banner" checked={view.maintenance.enabled} onChange={(v) => upd("maintenance", { enabled: v })} />
          <Field label="Message">
            <textarea
              value={view.maintenance.message}
              onChange={(e) => upd("maintenance", { message: e.target.value })}
              rows={3}
              className="w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-2.5 text-sm"
            />
          </Field>
        </Panel>
      </div>

      <div className="flex gap-3 pt-4 border-t border-cream/10">
        <button onClick={save} disabled={!draft} className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-40">
          Save Settings
        </button>
        {draft && (
          <button onClick={() => setDraft(null)} className="border border-cream/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold">
            Discard
          </button>
        )}
      </div>
    </section>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="border border-cream/10 p-5 space-y-4">
      <div>
        <h3 className="font-serif text-lg text-gold">{title}</h3>
        {subtitle && <p className="text-xs text-cream/50 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Text({ value, onChange, type = "text", label, placeholder }: { value: string; onChange: (v: string) => void; type?: string; label?: string; placeholder?: string }) {
  const input = (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-2.5 text-sm"
    />
  );
  if (!label) return input;
  return (
    <label className="block space-y-1.5">
      <span className="text-[9px] uppercase tracking-[0.28em] text-cream/50">{label}</span>
      {input}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 text-sm text-cream/80 cursor-pointer py-1">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-gold" />
      <span>{label}</span>
    </label>
  );
}

// ---------- Integrations ----------
type IntegrationRow = {
  id: string;
  name: string;
  category: string;
  description: string;
  connected: boolean;
  apiKey?: string;
  webhook?: string;
  config?: Record<string, string>;
};

const DEFAULT_INTEGRATIONS: IntegrationRow[] = [
  { id: "razorpay", name: "Razorpay", category: "Payments", description: "UPI, cards, netbanking, wallets.", connected: false },
  { id: "stripe", name: "Stripe", category: "Payments", description: "International cards & wallets.", connected: false },
  { id: "shiprocket", name: "Shiprocket", category: "Logistics", description: "Multi-courier fulfillment across India.", connected: false },
  { id: "delhivery", name: "Delhivery", category: "Logistics", description: "Direct courier integration.", connected: false },
  { id: "twilio", name: "Twilio SMS", category: "Messaging", description: "Transactional SMS & OTP.", connected: false },
  { id: "msg91", name: "MSG91", category: "Messaging", description: "India-first SMS gateway.", connected: false },
  { id: "sendgrid", name: "SendGrid", category: "Email", description: "Transactional email delivery.", connected: false },
  { id: "resend", name: "Resend", category: "Email", description: "Developer-grade email API.", connected: false },
  { id: "mailchimp", name: "Mailchimp", category: "Marketing", description: "Newsletter & journeys.", connected: false },
  { id: "ga4", name: "Google Analytics 4", category: "Analytics", description: "Traffic & conversion insights.", connected: false },
  { id: "meta_pixel", name: "Meta Pixel", category: "Analytics", description: "Facebook & Instagram tracking.", connected: false },
  { id: "gtm", name: "Google Tag Manager", category: "Analytics", description: "Central tag orchestration.", connected: false },
  { id: "whatsapp", name: "WhatsApp Business", category: "Messaging", description: "Order updates via WhatsApp.", connected: false },
  { id: "zapier", name: "Zapier", category: "Automation", description: "5000+ app connections.", connected: false },
];

function IntegrationsTab() {
  const qc = useQueryClient();
  const { data: rows = [] } = useQuery({
    queryKey: ["site_settings", "integrations"],
    queryFn: async (): Promise<IntegrationRow[]> => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "integrations").maybeSingle();
      const saved = (data?.value as { items?: IntegrationRow[] } | null)?.items;
      if (!saved || saved.length === 0) return DEFAULT_INTEGRATIONS;
      // merge defaults so new ones appear
      const byId = new Map(saved.map((i) => [i.id, i] as const));
      return DEFAULT_INTEGRATIONS.map((d) => byId.get(d.id) ?? d).concat(
        saved.filter((s) => !DEFAULT_INTEGRATIONS.find((d) => d.id === s.id)),
      );
    },
  });
  const [editing, setEditing] = useState<IntegrationRow | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const save = async (items: IntegrationRow[]) => {
    await supabase.from("site_settings").upsert({ key: "integrations", value: { items } as never });
    qc.invalidateQueries({ queryKey: ["site_settings", "integrations"] });
  };

  const toggle = async (row: IntegrationRow) => {
    const next = rows.map((r) => (r.id === row.id ? { ...r, connected: !r.connected } : r));
    await save(next);
    await logAudit(row.connected ? "integration_disconnect" : "integration_connect", "integration", row.id);
    toast.success(`${row.name} ${row.connected ? "disconnected" : "connected"}`);
  };

  const categories = Array.from(new Set(rows.map((r) => r.category)));
  const filtered = filter === "all" ? rows : rows.filter((r) => r.category === filter);

  return (
    <div className="space-y-6">
      <Panel title="Integrations" subtitle="Connect Mystique Blends to third-party tools. Keys are stored securely in Store Settings.">
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] border ${filter === "all" ? "border-gold text-gold" : "border-cream/15 text-cream/60"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] border ${filter === c ? "border-gold text-gold" : "border-cream/15 text-cream/60"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="border border-cream/10 p-5 bg-cream/[0.02] flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-cream/40">{r.category}</p>
                  <h3 className="font-serif text-xl mt-1">{r.name}</h3>
                </div>
                <span
                  className={`text-[9px] uppercase tracking-[0.28em] px-2 py-1 border ${
                    r.connected ? "border-gold/40 text-gold" : "border-cream/15 text-cream/40"
                  }`}
                >
                  {r.connected ? "Live" : "Off"}
                </span>
              </div>
              <p className="mt-3 text-sm text-cream/60 leading-relaxed flex-1">{r.description}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditing(r)}
                  className="flex-1 border border-cream/20 py-2 text-[10px] uppercase tracking-[0.3em] hover:border-gold hover:text-gold"
                >
                  Configure
                </button>
                <button
                  onClick={() => toggle(r)}
                  className={`flex-1 py-2 text-[10px] uppercase tracking-[0.3em] ${
                    r.connected ? "border border-cream/20 hover:border-red-400 hover:text-red-400" : "bg-gold text-obsidian hover:bg-gold/90"
                  }`}
                >
                  {r.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {editing && (
        <div className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-obsidian border border-cream/15 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{editing.category}</p>
            <h3 className="font-serif text-2xl mt-1">{editing.name}</h3>
            <div className="mt-6 space-y-4">
              <Text
                label="API Key / Token"
                value={editing.apiKey ?? ""}
                onChange={(v) => setEditing({ ...editing, apiKey: v })}
                placeholder="sk_live_••••"
              />
              <Text
                label="Webhook URL"
                value={editing.webhook ?? ""}
                onChange={(v) => setEditing({ ...editing, webhook: v })}
                placeholder="https://..."
              />
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-[10px] uppercase tracking-[0.3em] border border-cream/20">
                Cancel
              </button>
              <button
                onClick={async () => {
                  const next = rows.map((r) => (r.id === editing.id ? editing : r));
                  await save(next);
                  await logAudit("integration_configure", "integration", editing.id);
                  toast.success("Configuration saved");
                  setEditing(null);
                }}
                className="px-4 py-2 bg-gold text-obsidian text-[10px] uppercase tracking-[0.3em]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Data & Backup ----------
function DataBackupTab() {
  const [busy, setBusy] = useState<string | null>(null);

  const download = (filename: string, content: string, mime = "text/csv") => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toCsv = (rows: Record<string, unknown>[]) => {
    if (rows.length === 0) return "";
    const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
    const esc = (v: unknown) => {
      if (v == null) return "";
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  };

  const exportTable = async (table: "products" | "orders" | "profiles" | "coupons" | "collections" | "blog_posts" | "contact_messages" | "return_requests") => {
    setBusy(table);
    try {
      const { data, error } = await supabase.from(table).select("*");
      if (error) throw error;
      const rows = (data ?? []) as Record<string, unknown>[];
      download(`${table}-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows));
      await logAudit("data_export", "table", table, { rows: rows.length });
      toast.success(`Exported ${rows.length} rows from ${table}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(null);
    }
  };

  const exportFullBackup = async () => {
    setBusy("backup");
    try {
      const tables = ["products", "collections", "orders", "order_items", "coupons", "blog_posts", "gift_boxes", "site_settings", "profiles"] as const;
      const dump: Record<string, unknown> = { generated_at: new Date().toISOString() };
      for (const t of tables) {
        const { data } = await supabase.from(t).select("*");
        dump[t] = data ?? [];
      }
      download(`mystique-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(dump, null, 2), "application/json");
      await logAudit("data_backup", "database", "full");
      toast.success("Full backup downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Backup failed");
    } finally {
      setBusy(null);
    }
  };

  const tables: { id: Parameters<typeof exportTable>[0]; label: string; desc: string }[] = [
    { id: "products", label: "Products", desc: "Full catalog with pricing, SKU, and inventory." },
    { id: "orders", label: "Orders", desc: "All order records with status and totals." },
    { id: "profiles", label: "Customers", desc: "Registered customer directory." },
    { id: "coupons", label: "Coupons", desc: "Promo codes and redemption counters." },
    { id: "collections", label: "Collections", desc: "Curated product groupings." },
    { id: "blog_posts", label: "Journal", desc: "Editorial articles." },
    { id: "contact_messages", label: "Messages", desc: "Concierge inbox history." },
    { id: "return_requests", label: "Returns", desc: "Return & refund requests." },
  ];

  return (
    <div className="space-y-6">
      <Panel title="Full Backup" subtitle="Download a JSON snapshot of core tables. Store securely.">
        <button
          onClick={exportFullBackup}
          disabled={busy === "backup"}
          className="inline-flex items-center gap-2 bg-gold text-obsidian px-6 py-3 text-[11px] uppercase tracking-[0.3em] disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {busy === "backup" ? "Preparing…" : "Download Backup (JSON)"}
        </button>
      </Panel>

      <Panel title="Export by Table" subtitle="Download individual tables as CSV for spreadsheets or migration.">
        <div className="grid md:grid-cols-2 gap-4">
          {tables.map((t) => (
            <div key={t.id} className="border border-cream/10 p-5 bg-cream/[0.02] flex items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg">{t.label}</h3>
                <p className="text-xs text-cream/50 mt-1">{t.desc}</p>
              </div>
              <button
                onClick={() => exportTable(t.id)}
                disabled={busy === t.id}
                className="shrink-0 inline-flex items-center gap-2 border border-cream/20 hover:border-gold hover:text-gold px-4 py-2 text-[10px] uppercase tracking-[0.3em] disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {busy === t.id ? "…" : "CSV"}
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Data Retention" subtitle="Backups are generated on demand — no automated schedule. Store copies in your secure vault.">
        <ul className="text-sm text-cream/60 space-y-2 list-disc pl-5">
          <li>Full JSON backup includes products, orders, order items, coupons, collections, journal, gift boxes, site settings, and customer profiles.</li>
          <li>Individual CSV exports are ideal for spreadsheet review or supplier hand-off.</li>
          <li>Every export is recorded in the Audit Log for compliance.</li>
        </ul>
      </Panel>
    </div>
  );
}

// ---------- Reports ----------
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

type OrderRow = { id: string; created_at: string; total_inr: number; status: string; user_id: string | null };
type OrderItemRow = { order_id: string; product_id: string; quantity: number; price_inr: number; name: string | null };

function ReportsTab() {
  const [days, setDays] = useState(30);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data: orders = [] } = useQuery({
    queryKey: ["reports", "orders", days],
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, created_at, total_inr, status, user_id")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as OrderRow[];
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ["reports", "items", days],
    queryFn: async (): Promise<OrderItemRow[]> => {
      const orderIds = orders.map((o) => o.id);
      if (orderIds.length === 0) return [];
      const { data, error } = await supabase
        .from("order_items")
        .select("order_id, product_id, quantity, price_inr, name")
        .in("order_id", orderIds);
      if (error) throw error;
      return (data ?? []) as OrderItemRow[];
    },
    enabled: orders.length > 0,
  });

  // Revenue by day
  const revenueByDay = (() => {
    const map = new Map<string, { day: string; revenue: number; orders: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      map.set(d, { day: d.slice(5), revenue: 0, orders: 0 });
    }
    for (const o of orders) {
      const key = o.created_at.slice(0, 10);
      const row = map.get(key);
      if (row) {
        row.revenue += Number(o.total_inr || 0);
        row.orders += 1;
      }
    }
    return Array.from(map.values());
  })();

  // Top products
  const topProducts = (() => {
    const agg = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const it of items) {
      const name = it.name || it.product_id;
      const cur = agg.get(name) ?? { name, quantity: 0, revenue: 0 };
      cur.quantity += it.quantity;
      cur.revenue += it.quantity * Number(it.price_inr || 0);
      agg.set(name, cur);
    }
    return Array.from(agg.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  })();

  // Status breakdown
  const statusBreakdown = (() => {
    const agg = new Map<string, number>();
    for (const o of orders) agg.set(o.status, (agg.get(o.status) ?? 0) + 1);
    return Array.from(agg.entries()).map(([status, count]) => ({ status, count }));
  })();

  // Top customers
  const topCustomers = (() => {
    const agg = new Map<string, { user_id: string; orders: number; revenue: number }>();
    for (const o of orders) {
      if (!o.user_id) continue;
      const cur = agg.get(o.user_id) ?? { user_id: o.user_id, orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += Number(o.total_inr || 0);
      agg.set(o.user_id, cur);
    }
    return Array.from(agg.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  })();

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_inr || 0), 0);
  const aov = orders.length ? totalRevenue / orders.length : 0;
  const uniqueCustomers = new Set(orders.map((o) => o.user_id).filter(Boolean)).size;

  const downloadCsv = (name: string, rows: Record<string, unknown>[]) => {
    if (rows.length === 0) return toast.error("No data to export");
    const cols = Object.keys(rows[0]);
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-cream/50 mr-2">Range</p>
        {[7, 30, 90, 180, 365].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] border ${days === d ? "border-gold text-gold" : "border-cream/15 text-cream/60 hover:border-cream/30"}`}
          >
            {d}d
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Kpi label="Revenue" value={formatINR(totalRevenue)} />
        <Kpi label="Orders" value={String(orders.length)} />
        <Kpi label="AOV" value={formatINR(aov)} />
        <Kpi label="Customers" value={String(uniqueCustomers)} />
      </div>

      <Panel title="Revenue Trend" subtitle={`Daily revenue over the last ${days} days.`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="day" stroke="#ffffff60" fontSize={10} />
              <YAxis stroke="#ffffff60" fontSize={10} />
              <RTooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff20", fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Top Products" subtitle="Ranked by revenue in the selected period.">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" stroke="#ffffff60" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#ffffff60" fontSize={10} width={120} />
                <RTooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff20", fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#D4AF37" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button
            onClick={() => downloadCsv("top-products", topProducts)}
            className="mt-2 inline-flex items-center gap-2 border border-cream/20 hover:border-gold hover:text-gold px-3 py-1.5 text-[10px] uppercase tracking-[0.28em]"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </Panel>

        <Panel title="Order Status" subtitle="Distribution of order states in the period.">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="status" stroke="#ffffff60" fontSize={10} />
                <YAxis stroke="#ffffff60" fontSize={10} />
                <RTooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #ffffff20", fontSize: 12 }} />
                <Bar dataKey="count" fill="#D4AF37" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Top Customers" subtitle="By revenue contribution in the period.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.28em] text-cream/50 border-b border-cream/10">
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Orders</th>
                <th className="py-2 pr-4">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-cream/40">No customer data in this period.</td>
                </tr>
              )}
              {topCustomers.map((c) => (
                <tr key={c.user_id} className="border-b border-cream/[0.06]">
                  <td className="py-3 pr-4 font-mono text-xs text-cream/70">{c.user_id.slice(0, 12)}…</td>
                  <td className="py-3 pr-4">{c.orders}</td>
                  <td className="py-3 pr-4 text-gold">{formatINR(c.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={() => downloadCsv("top-customers", topCustomers)}
          className="mt-2 inline-flex items-center gap-2 border border-cream/20 hover:border-gold hover:text-gold px-3 py-1.5 text-[10px] uppercase tracking-[0.28em]"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </Panel>
    </div>
  );
}


const RETURN_STATUSES = ["pending", "approved", "rejected", "refunded", "closed"] as const;
type ReturnStatus = typeof RETURN_STATUSES[number];

function ReturnsTab() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<ReturnStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "returns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("return_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = rows.filter((r: any) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        (r.order_id ?? "").toLowerCase().includes(q) ||
        (r.reason ?? "").toLowerCase().includes(q) ||
        (r.user_id ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = RETURN_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = rows.filter((r: any) => r.status === s).length;
    return acc;
  }, {});

  async function updateReturn(id: string, patch: Record<string, any>) {
    const { error } = await supabase
      .from("return_requests")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Return updated");
    qc.invalidateQueries({ queryKey: ["admin", "returns"] });
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {RETURN_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`border p-4 text-left transition-colors ${
              filter === s ? "border-gold bg-gold/[0.04]" : "border-cream/10 hover:border-cream/30"
            }`}
          >
            <p className="text-[9px] uppercase tracking-[0.28em] text-cream/50">{s}</p>
            <p className="font-serif text-2xl mt-1">{counts[s] ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] border ${
            filter === "all" ? "border-gold text-gold" : "border-cream/20 text-cream/60 hover:border-cream/40"
          }`}
        >
          All ({rows.length})
        </button>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by order, user, reason…"
          className="flex-1 min-w-[200px] bg-obsidian border border-cream/15 px-3 py-2 text-sm placeholder:text-cream/30"
        />
      </div>

      <div className="border border-cream/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.28em] text-cream/50 border-b border-cream/10">
              <th className="py-3 px-4">Requested</th>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Reason</th>
              <th className="py-3 px-4">Refund</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="py-8 text-center text-cream/40">Loading…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-cream/40">No returns found.</td></tr>
            )}
            {filtered.map((r: any) => (
              <tr key={r.id} className="border-b border-cream/[0.06] hover:bg-cream/[0.02]">
                <td className="py-3 px-4 text-cream/70 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-cream/70">{(r.order_id ?? "").slice(0, 8)}…</td>
                <td className="py-3 px-4 max-w-[260px] truncate">{r.reason}</td>
                <td className="py-3 px-4 text-gold">{r.refund_amount_inr ? formatINR(r.refund_amount_inr) : "—"}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-[0.24em] border ${
                    r.status === "approved" || r.status === "refunded"
                      ? "border-gold text-gold"
                      : r.status === "rejected"
                      ? "border-red-500/40 text-red-400"
                      : "border-cream/20 text-cream/60"
                  }`}>{r.status}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setSelected(r)}
                    className="text-[10px] uppercase tracking-[0.28em] text-gold hover:underline"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <ReturnEditor
          request={selected}
          onClose={() => setSelected(null)}
          onSave={(patch) => updateReturn(selected.id, patch)}
        />
      )}
    </div>
  );
}

function ReturnEditor({
  request,
  onClose,
  onSave,
}: {
  request: any;
  onClose: () => void;
  onSave: (patch: Record<string, any>) => void;
}) {
  const [status, setStatus] = useState<ReturnStatus>(request.status);
  const [notes, setNotes] = useState<string>(request.resolution_notes ?? "");
  const [refund, setRefund] = useState<string>(
    request.refund_amount_inr != null ? String(request.refund_amount_inr) : ""
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-obsidian/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-obsidian border border-cream/15 max-w-2xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Return Request</p>
            <p className="font-serif text-2xl mt-1">Manage resolution</p>
          </div>
          <button onClick={onClose} className="text-cream/50 hover:text-cream">✕</button>
        </div>

        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cream/40">Order</p>
              <p className="font-mono mt-1">{request.order_id}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cream/40">Customer</p>
              <p className="font-mono mt-1">{request.user_id?.slice(0, 12)}…</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cream/40">Filed</p>
              <p className="mt-1">{new Date(request.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cream/40">Last updated</p>
              <p className="mt-1">{new Date(request.updated_at).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-cream/40 mb-1">Reason</p>
            <p className="border border-cream/10 px-3 py-2 bg-cream/[0.02]">{request.reason}</p>
          </div>

          {request.details && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cream/40 mb-1">Customer details</p>
              <p className="border border-cream/10 px-3 py-2 bg-cream/[0.02] whitespace-pre-wrap">{request.details}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cream/40 mb-1">Status</p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReturnStatus)}
                className="w-full bg-obsidian border border-cream/15 px-3 py-2 text-sm"
              >
                {RETURN_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-cream/40 mb-1">Refund (₹)</p>
              <input
                type="number"
                value={refund}
                onChange={(e) => setRefund(e.target.value)}
                placeholder="0"
                className="w-full bg-obsidian border border-cream/15 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-cream/40 mb-1">Resolution notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Internal notes shared with the customer…"
              className="w-full bg-obsidian border border-cream/15 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[10px] uppercase tracking-[0.28em] border border-cream/20 hover:border-cream/40"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onSave({
                  status,
                  resolution_notes: notes || null,
                  refund_amount_inr: refund ? Number(refund) : null,
                })
              }
              className="px-4 py-2 text-[10px] uppercase tracking-[0.28em] bg-gold text-obsidian hover:bg-gold/90"
            >
              Save resolution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AbandonedCartsTab() {
  const [search, setSearch] = useState("");
  const [days, setDays] = useState(7);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "abandoned-carts", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const { data: items } = await supabase
        .from("cart_items")
        .select("id, user_id, product_id, quantity, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false });
      const rows = items ?? [];
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      const productIds = Array.from(new Set(rows.map((r) => r.product_id)));
      const [profs, prods] = await Promise.all([
        userIds.length
          ? supabase.from("profiles").select("id, full_name, phone").in("id", userIds)
          : Promise.resolve({ data: [] as { id: string; full_name: string | null; phone: string | null }[] }),
        productIds.length
          ? supabase.from("products").select("id, name, price_inr, slug").in("id", productIds)
          : Promise.resolve({ data: [] as { id: string; name: string; price_inr: number; slug: string }[] }),
      ]);
      const pMap = new Map((profs.data ?? []).map((p) => [p.id, p]));
      const prodMap = new Map((prods.data ?? []).map((p) => [p.id, p]));
      const byUser = new Map<
        string,
        {
          user_id: string;
          name: string;
          phone: string;
          lastActive: string;
          items: { name: string; slug: string; quantity: number; price: number }[];
          value: number;
        }
      >();
      for (const r of rows) {
        const pr = prodMap.get(r.product_id);
        if (!pr) continue;
        const prof = pMap.get(r.user_id);
        const existing = byUser.get(r.user_id) ?? {
          user_id: r.user_id,
          name: prof?.full_name ?? "Guest",
          phone: prof?.phone ?? "—",
          lastActive: r.created_at,
          items: [],
          value: 0,
        };
        existing.items.push({ name: pr.name, slug: pr.slug, quantity: r.quantity, price: pr.price_inr });
        existing.value += pr.price_inr * r.quantity;
        if (r.created_at > existing.lastActive) existing.lastActive = r.created_at;
        byUser.set(r.user_id, existing);
      }
      return Array.from(byUser.values()).sort((a, b) => b.value - a.value);
    },
  });

  const filtered = (data ?? []).filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()),
  );
  const totalValue = filtered.reduce((s, c) => s + c.value, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-cream/10 p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cream/50">Abandoned Carts</p>
          <p className="font-serif text-3xl mt-2">{filtered.length}</p>
        </div>
        <div className="border border-cream/10 p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cream/50">Recovery Value</p>
          <p className="font-serif text-3xl mt-2 text-gold">{formatINR(totalValue)}</p>
        </div>
        <div className="border border-cream/10 p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cream/50">Avg Cart Value</p>
          <p className="font-serif text-3xl mt-2">
            {filtered.length ? formatINR(Math.round(totalValue / filtered.length)) : "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer…"
          className="flex-1 min-w-[240px] bg-obsidian border border-cream/15 px-4 py-2 text-sm"
        />
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="bg-obsidian border border-cream/15 px-4 py-2 text-sm"
        >
          <option value={1}>Last 24 hours</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-cream/50 text-sm">Loading abandoned carts…</p>
      ) : filtered.length === 0 ? (
        <div className="border border-cream/10 p-10 text-center text-cream/50">
          No abandoned carts in this window.
        </div>
      ) : (
        <div className="border border-cream/10 divide-y divide-cream/10">
          {filtered.map((c) => (
            <div key={c.user_id} className="p-5 grid md:grid-cols-[2fr_3fr_auto] gap-4 items-start">
              <div>
                <p className="font-serif text-lg">{c.name}</p>
                <p className="text-xs text-cream/50">{c.phone}</p>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cream/40 mt-2">
                  Last active {new Date(c.lastActive).toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                {c.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-sm text-cream/70">
                    <span>
                      {it.quantity}× {it.name}
                    </span>
                    <span>{formatINR(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="font-serif text-xl text-gold">{formatINR(c.value)}</p>
                {c.phone !== "—" && (
                  <a
                    href={`https://wa.me/${c.phone.replace(/\D/g, "")}?text=${encodeURIComponent("Your Mystique Blends selection is waiting — complete your order for a signature scent.")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 px-3 py-2 text-[10px] uppercase tracking-[0.28em] border border-gold text-gold hover:bg-gold hover:text-obsidian"
                  >
                    WhatsApp Reminder
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Cache management
// ============================================================
function CacheTab() {
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

  useEffect(() => { refreshStats(); /* eslint-disable-next-line */ }, []);

  const runQueryCache = async () => {
    setBusy("queries");
    try {
      await qc.invalidateQueries();
      qc.clear();
      toast.success("Query cache cleared. Fresh data fetched.");
      await refreshStats();
    } finally { setBusy(null); }
  };

  const runLocal = async () => {
    setBusy("local");
    try {
      // Preserve Supabase auth session so admin doesn't get logged out
      const preserve: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("sb-") || k.includes("supabase.auth"))) {
          preserve[k] = localStorage.getItem(k) || "";
        }
      }
      localStorage.clear();
      Object.entries(preserve).forEach(([k, v]) => localStorage.setItem(k, v));
      toast.success("Local storage cleared (session preserved).");
      await refreshStats();
    } finally { setBusy(null); }
  };

  const runSession = async () => {
    setBusy("session");
    try {
      sessionStorage.clear();
      toast.success("Session storage cleared.");
      await refreshStats();
    } finally { setBusy(null); }
  };

  const runBrowserCaches = async () => {
    setBusy("caches");
    try {
      if ("caches" in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }
      toast.success("Browser cache storage cleared.");
      await refreshStats();
    } finally { setBusy(null); }
  };

  const runServiceWorkers = async () => {
    setBusy("sw");
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      toast.success("Service workers unregistered.");
      await refreshStats();
    } finally { setBusy(null); }
  };

  const runAll = async () => {
    if (!confirm("Clear ALL caches (query, storage, browser cache, service workers) and reload? Auth session will be preserved.")) return;
    setBusy("all");
    try {
      await runQueryCache();
      await runLocal();
      await runSession();
      await runBrowserCaches();
      await runServiceWorkers();
      toast.success("All caches cleared. Reloading…");
      setTimeout(() => window.location.reload(), 600);
    } finally { setBusy(null); }
  };

  const runHardReload = () => {
    toast.info("Hard reloading…");
    setTimeout(() => {
      // Bust URL to force network revalidation
      const u = new URL(window.location.href);
      u.searchParams.set("_t", String(Date.now()));
      window.location.replace(u.toString());
    }, 300);
  };

  const items = [
    { key: "queries", title: "Data cache (React Query)", desc: "Cached API responses used across admin & storefront. Clearing forces fresh fetches.", stat: `${stats.queries} queries`, action: runQueryCache, label: "Clear data cache" },
    { key: "local", title: "Local storage", desc: "Cart, wishlist, UI preferences saved in browser. Auth session is preserved.", stat: `${stats.localKeys} keys`, action: runLocal, label: "Clear local storage" },
    { key: "session", title: "Session storage", desc: "Temporary per-tab state.", stat: `${stats.sessionKeys} keys`, action: runSession, label: "Clear session storage" },
    { key: "caches", title: "Browser cache storage", desc: "PWA / offline caches for images and assets.", stat: `${stats.caches} cache buckets`, action: runBrowserCaches, label: "Clear browser cache" },
    { key: "sw", title: "Service workers", desc: "Background workers that serve offline assets. Unregister if the site feels stale after a deploy.", stat: `${stats.sw} registered`, action: runServiceWorkers, label: "Unregister workers" },
  ];

  return (
    <div className="space-y-8">
      <div className="border border-cream/10 rounded-sm p-6 bg-cream/[0.02]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Maintenance</p>
            <h3 className="font-serif text-2xl mt-1">Clear cache</h3>
            <p className="text-sm text-cream/60 mt-2 max-w-2xl">
              Use this after publishing new products, images, or homepage settings if changes don't appear immediately. Auth session is always preserved.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshStats}
              className="px-4 py-2 text-[11px] uppercase tracking-[0.24em] border border-cream/20 hover:border-gold hover:text-gold"
            >
              Refresh stats
            </button>
            <button
              onClick={runHardReload}
              className="px-4 py-2 text-[11px] uppercase tracking-[0.24em] border border-cream/20 hover:border-gold hover:text-gold"
            >
              Hard reload
            </button>
            <button
              onClick={runAll}
              disabled={busy !== null}
              className="px-4 py-2 text-[11px] uppercase tracking-[0.24em] bg-gold text-obsidian hover:bg-gold/90 disabled:opacity-50"
            >
              {busy === "all" ? "Clearing…" : "Clear everything"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((it) => (
          <div key={it.key} className="border border-cream/10 rounded-sm p-5 bg-obsidian">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-serif text-lg">{it.title}</h4>
                <p className="text-[10px] uppercase tracking-[0.32em] text-gold/80 mt-1">{it.stat}</p>
              </div>
              <button
                onClick={it.action}
                disabled={busy !== null}
                className="px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] border border-cream/20 hover:border-gold hover:text-gold disabled:opacity-50 whitespace-nowrap"
              >
                {busy === it.key ? "Clearing…" : it.label}
              </button>
            </div>
            <p className="text-sm text-cream/60 mt-3">{it.desc}</p>
          </div>
        ))}
      </div>

      <div className="border border-gold/20 rounded-sm p-5 bg-gold/[0.03]">
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Tip</p>
        <p className="text-sm text-cream/70 mt-2">
          Customers ke browser me purani copy dikhne pe unhe ek baar page refresh karne ke liye kaho, ya "Clear everything" ke baad site reload karo — service workers re-install ho jaayenge naye assets ke saath.
        </p>
      </div>
    </div>
  );
}
