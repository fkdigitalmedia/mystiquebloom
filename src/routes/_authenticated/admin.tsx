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
  PanelLeftClose,
  PanelLeftOpen,
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

  if (role === "customer" || !role) {
    return (
      <div className="min-h-screen bg-obsidian text-cream">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-serif text-4xl mb-4">Management Access Only</h1>
          <p className="text-cream/60 mb-8">
            You must be granted an administrative, manager, or staff role to view this page.
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

  const ALL_NAV: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; group: string }[] = [
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

  const NAV = ALL_NAV.filter((item) => {
    if (role === "admin") return true;
    if (role === "manager") {
      return !["customers", "roles", "audit", "automations", "integrations", "data", "settings", "cache"].includes(item.id);
    }
    if (role === "staff") {
      return ["dashboard", "reports", "orders"].includes(item.id);
    }
    return false;
  });

  useEffect(() => {
    if (NAV.length > 0 && !NAV.some((n) => n.id === tab)) {
      setTab(NAV[0].id);
    }
  }, [tab, NAV]);

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
          <div className="flex items-center justify-between px-3.5 py-4 border-b border-cream/10">
            {sidebarOpen ? (
              <>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.4em] text-gold font-bold">Atelier</p>
                  <p className="font-serif text-lg leading-tight mt-0.5 text-cream">Control</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-cream/60 hover:text-gold hover:bg-gold/10 transition-colors flex items-center gap-1 text-xs"
                  title="Collapse Sidebar"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-full flex items-center justify-center p-2 rounded-lg text-gold hover:bg-gold/10 transition-all border border-gold/30"
                title="Expand Sidebar"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
          </div>
          <nav className="py-4 space-y-6">
            {Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                {sidebarOpen && (
                  <p className="px-4 mb-2 text-[9px] uppercase tracking-[0.32em] text-cream/40 font-semibold">
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
                              ? "border-gold text-gold bg-gold/[0.04] font-bold"
                              : "border-transparent text-cream/60 hover:text-cream hover:bg-cream/[0.02]"
                          } ${!sidebarOpen ? "justify-center px-0" : ""}`}
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
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4 border-b border-cream/10 pb-4">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/40 text-gold hover:bg-gold hover:text-obsidian transition-all text-xs font-bold uppercase tracking-wider shadow-md shrink-0"
                  title="Show Sidebar Menu"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                  <span>Show Menu</span>
                </button>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-cream/40 font-semibold">Admin</p>
                <h1 className="font-serif text-3xl md:text-4xl mt-0.5 text-cream">{activeLabel}</h1>
              </div>
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

// Full definitions of all tabs follow in src/routes/_authenticated/admin.tsx
