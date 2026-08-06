import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User as UserIcon,
  Gift,
  Wallet,
  Ticket,
  Bell,
  MessageSquare,
  RotateCcw,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account · Mystique Blends" },
      { name: "description", content: "Your personal Mystique concierge — orders, rewards, wishlist and preferences in one place." },
      { property: "og:title", content: "My Account · Mystique Blends" },
      { property: "og:description", content: "Your personal Mystique concierge dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountShell,
});

type NavKey =
  | "dashboard"
  | "orders"
  | "wishlist"
  | "returns"
  | "gifts"
  | "addresses"
  | "profile"
  | "rewards"
  | "wallet"
  | "coupons"
  | "notifications"
  | "support"
  | "settings";

type NavEntry = {
  key: NavKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  to: string;
  match: (path: string) => boolean;
  soon?: boolean;
};

const NAV: NavEntry[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/account", match: (p) => p === "/account" || p === "/account/" },
  { key: "orders", label: "Orders", icon: Package, to: "/account/orders", match: (p) => p.startsWith("/account/orders") },
  { key: "returns", label: "Returns", icon: RotateCcw, to: "/account/returns", match: (p) => p.startsWith("/account/returns") },
  { key: "wishlist", label: "Wishlist", icon: Heart, to: "/wishlist", match: (p) => p.startsWith("/wishlist") },
  { key: "gifts", label: "Gift Boxes", icon: Gift, to: "/account/gifts", match: (p) => p.startsWith("/account/gifts") },
  { key: "addresses", label: "Addresses", icon: MapPin, to: "/account/addresses", match: (p) => p.startsWith("/account/addresses") },
  { key: "profile", label: "Profile", icon: UserIcon, to: "/account/profile", match: (p) => p.startsWith("/account/profile") },
  { key: "rewards", label: "Rewards", icon: Sparkles, to: "/account/rewards", match: (p) => p.startsWith("/account/rewards") },
  { key: "wallet", label: "Wallet", icon: Wallet, to: "/account/wallet", match: (p) => p.startsWith("/account/wallet") },
  { key: "coupons", label: "Coupons", icon: Ticket, to: "/account/coupons", match: (p) => p.startsWith("/account/coupons") },
  { key: "notifications", label: "Notifications", icon: Bell, to: "/account/notifications", match: (p) => p.startsWith("/account/notifications") },
  { key: "support", label: "Support", icon: MessageSquare, to: "/account/support", match: (p) => p.startsWith("/account/support") },
  { key: "settings", label: "Settings", icon: Settings, to: "/account/security", match: (p) => p.startsWith("/account/security") },
];


function AccountShell() {
  const { user, role, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const active = NAV.find((n) => n.match(pathname)) ?? NAV[0];

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id, "shell"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, loyalty_points")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const displayName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "there";
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />

      <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6 md:py-10 grid gap-6 md:gap-8 md:grid-cols-[auto_minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside
          className={`hidden md:flex md:flex-col sticky top-24 self-start h-[calc(100vh-7rem)] transition-all duration-300 ${
            collapsed ? "w-[76px]" : "w-[260px]"
          }`}
        >
          <SidebarCard
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            displayName={displayName}
            initials={initials}
            email={user?.email ?? ""}
            points={profile?.loyalty_points ?? 0}
            role={role}
            pathname={pathname}
            onSignOut={signOut}
          />
        </aside>

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between border border-cream/10 bg-graphite/30 px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cream"
            aria-label="Open account menu"
          >
            <Menu size={16} /> {active.label}
          </button>
          <div className="h-9 w-9 grid place-items-center rounded-full bg-gold text-obsidian font-serif text-sm">
            {initials || "M"}
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[70] md:hidden">
            <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[300px] max-w-[86vw] bg-obsidian border-r border-cream/10 animate-fade-in overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-cream/10">
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Concierge</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <SidebarCard
                  collapsed={false}
                  onToggle={() => setMobileOpen(false)}
                  displayName={displayName}
                  initials={initials}
                  email={user?.email ?? ""}
                  points={profile?.loyalty_points ?? 0}
                  role={role}
                  pathname={pathname}
                  onSignOut={signOut}
                  hideToggle
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="min-w-0">
          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cream/40 mb-4">
            <Link to="/" className="hover:text-gold">Home</Link>
            <ChevronRight size={12} />
            <Link to="/account" className="hover:text-gold">Account</Link>
            {active.key !== "dashboard" && (
              <>
                <ChevronRight size={12} />
                <span className="text-cream/70">{active.label}</span>
              </>
            )}
          </nav>

          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-obsidian/95 backdrop-blur-xl border-t border-cream/10">
        <div className="grid grid-cols-5">
          {[
            { key: "dashboard", label: "Home", icon: LayoutDashboard, to: "/account" },
            { key: "orders", label: "Orders", icon: Package, to: "/account/orders" },
            { key: "wishlist", label: "Wishlist", icon: Heart, to: "/wishlist" },
            { key: "rewards", label: "Rewards", icon: Gift, to: "/loyalty" },
            { key: "support", label: "Help", icon: MessageSquare, to: "/contact" },
          ].map((n) => {
            const Icon = n.icon;
            const isActive = n.to === pathname || (n.to !== "/" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.key}
                to={n.to}
                className={`py-3 flex flex-col items-center gap-1 text-[9px] uppercase tracking-[0.22em] ${
                  isActive ? "text-gold" : "text-cream/60"
                }`}
              >
                <Icon size={16} />
                {n.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SidebarCard({
  collapsed,
  onToggle,
  displayName,
  initials,
  email,
  points,
  role,
  pathname,
  onSignOut,
  hideToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  displayName: string;
  initials: string;
  email: string;
  points: number;
  role: string | null;
  pathname: string;
  onSignOut: () => void;
  hideToggle?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full border border-cream/10 bg-graphite/30 backdrop-blur">
      {/* Profile chip */}
      <div className={`p-4 border-b border-cream/10 ${collapsed ? "text-center" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="h-11 w-11 shrink-0 grid place-items-center rounded-full bg-gold text-obsidian font-serif text-base">
            {initials || <UserIcon size={18} />}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-[10px] text-cream/50 truncate">{email}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold">
            <Sparkles size={12} />
            {points} pts · The Circle
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV.map((n) => {
          const Icon = n.icon;
          const isActive = n.match(pathname);
          const disabled = n.soon;
          const content = (
            <>
              <Icon size={15} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{n.label}</span>
                  {n.soon && (
                    <span className="text-[9px] uppercase tracking-[0.22em] text-cream/40">Soon</span>
                  )}
                </>
              )}
            </>
          );
          const cls = `w-full flex items-center gap-3 px-4 py-2.5 text-[11px] uppercase tracking-[0.22em] transition-colors ${
            isActive
              ? "bg-gold/10 text-gold border-l-2 border-gold"
              : disabled
                ? "text-cream/30 cursor-not-allowed"
                : "text-cream/70 hover:text-gold hover:bg-cream/5 border-l-2 border-transparent"
          } ${collapsed ? "justify-center" : ""}`;
          if (disabled) {
            return (
              <button key={n.key} className={cls} title={`${n.label} — coming soon`} disabled>
                {content}
              </button>
            );
          }
          return (
            <Link key={n.key} to={n.to} className={cls} onClick={onNavigate} title={n.label}>
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="border-t border-cream/10 p-3 space-y-1">
        {role === "admin" && (
          <Link
            to="/admin"
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-gold hover:bg-gold/10 ${
              collapsed ? "justify-center" : ""
            }`}
            title="Admin Panel"
          >
            <Settings size={14} />
            {!collapsed && "Admin Panel"}
          </Link>
        )}
        <button
          onClick={onSignOut}
          className={`w-full flex items-center gap-3 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-cream/60 hover:text-red-400 ${
            collapsed ? "justify-center" : ""
          }`}
          title="Sign Out"
        >
          <LogOut size={14} />
          {!collapsed && "Sign Out"}
        </button>
        {!hideToggle && (
          <button
            onClick={onToggle}
            className={`w-full flex items-center gap-3 px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-cream/40 hover:text-cream ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <ChevronRight size={14} className={`transition-transform ${collapsed ? "" : "rotate-180"}`} />
            {!collapsed && "Collapse"}
          </button>
        )}
      </div>
    </div>
  );
}
