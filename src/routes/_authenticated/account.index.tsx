import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Clock,
  CheckCircle2,
  Heart,
  Sparkles,
  Wallet,
  Ticket,
  ShoppingBag,
  MapPin,
  UserCog,
  ChevronRight,
  ArrowUpRight,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { useLoyaltySettings, currentTier } from "@/lib/use-site-settings";

export const Route = createFileRoute("/_authenticated/account/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Mystique Blends" },
      { name: "description", content: "Your Mystique concierge — orders, rewards and recommendations at a glance." },
    ],
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user, role } = useAuth();
  const uid = user?.id;

  const { data: orders } = useQuery({
    queryKey: ["account", "orders", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total_inr, points_earned, points_redeemed, created_at, order_items(id, name, quantity, price_inr)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["account", "profile", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, loyalty_points")
        .eq("id", uid!)
        .maybeSingle();
      return data;
    },
  });

  const { data: wishlistCount = 0 } = useQuery({
    queryKey: ["account", "wishlist-count", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { count } = await supabase
        .from("wishlist")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid!);
      return count ?? 0;
    },
  });

  const { data: couponsCount = 0 } = useQuery({
    queryKey: ["account", "coupons-count"],
    queryFn: async () => {
      const nowIso = new Date().toISOString();
      const { count } = await supabase
        .from("coupons")
        .select("id", { count: "exact", head: true })
        .eq("active", true)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`);
      return count ?? 0;
    },
  });

  const { data: loyalty } = useLoyaltySettings();

  const list = orders ?? [];
  const total = list.length;
  const pending = list.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "shipped" || o.status === "out_for_delivery").length;
  const completed = list.filter((o) => o.status === "delivered").length;
  const points = profile?.loyalty_points ?? 0;
  const tiers = loyalty?.tiers ?? [];
  const tier = tiers.length ? currentTier(points, tiers) : null;
  const nextTier = tiers.find((t) => t.minPoints > points);
  const tierProgress = nextTier
    ? Math.min(100, Math.round(((points - (tier?.minPoints ?? 0)) / Math.max(1, nextTier.minPoints - (tier?.minPoints ?? 0))) * 100))
    : 100;

  const firstName =
    (profile?.full_name || (user?.user_metadata?.full_name as string | undefined) || user?.email || "").split(/[ @]/)[0];

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      {role && role !== "customer" && (
        <div className="border border-gold/40 bg-gold/10 p-5 rounded-sm flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Shield className="text-gold w-6 h-6 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-medium text-gold">
                {role === "admin" ? "Super Admin" : role === "manager" ? "Store Manager" : "Staff Member"} Role Active
              </p>
              <p className="text-[11px] text-cream/70 mt-0.5">
                You have active store management permissions.
              </p>
            </div>
          </div>
          <Link
            to="/admin"
            className="bg-gold text-obsidian px-5 py-2.5 text-[10px] uppercase tracking-[0.25em] font-medium hover:bg-cream transition-colors"
          >
            Open Management Portal →
          </Link>
        </div>
      )}

      {/* Greeting */}
      <section className="relative overflow-hidden border border-cream/10 bg-gradient-to-br from-graphite/60 via-obsidian to-obsidian p-8 md:p-10">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="relative">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Welcome back</span>
          <h1 className="mt-3 font-serif text-4xl md:text-5xl capitalize">
            {firstName || "there"} <span className="text-gold">·</span> The Circle
          </h1>
          <p className="mt-3 text-cream/60 max-w-xl">
            Your private concierge — orders, rewards and recommendations, elegantly composed.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <QuickAction to="/shop" icon={ShoppingBag} label="Shop Now" />
            <QuickAction to="/wishlist" icon={Heart} label="Wishlist" />
            <QuickAction to="/loyalty" icon={Sparkles} label="Rewards" />
            <QuickAction to="/contact" icon={UserCog} label="Concierge" />
          </div>
        </div>
      </section>

      {/* Stat grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Package} label="Total Orders" value={total} accent />
        <StatCard icon={Clock} label="In Progress" value={pending} />
        <StatCard icon={CheckCircle2} label="Delivered" value={completed} />
        <StatCard icon={Heart} label="Wishlist" value={wishlistCount} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Loyalty card */}
        <div className="md:col-span-2 border border-gold/30 bg-gradient-to-br from-gold/10 via-obsidian to-obsidian p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Loyalty Balance</p>
              <p className="mt-3 font-serif text-5xl text-gold">{points}</p>
              <p className="mt-1 text-xs text-cream/50">points · 1 pt = ₹1</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Tier</p>
              <p className="mt-2 font-serif text-2xl text-cream">{tier?.name ?? "Ivory"}</p>
              {tier?.perk && <p className="text-[10px] text-cream/50 mt-1 max-w-[180px]">{tier.perk}</p>}
            </div>
          </div>

          {nextTier ? (
            <div className="mt-6">
              <div className="flex justify-between text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-2">
                <span>{tier?.name ?? "Ivory"}</span>
                <span>{nextTier.minPoints - points} pts to {nextTier.name}</span>
              </div>
              <div className="h-1.5 bg-cream/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-gold to-gold/60 transition-all" style={{ width: `${tierProgress}%` }} />
              </div>
            </div>
          ) : (
            <p className="mt-6 text-[10px] uppercase tracking-[0.28em] text-gold/70">Top tier — enjoy every perk.</p>
          )}

          <Link to="/loyalty" className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold gold-underline">
            View The Circle <ArrowUpRight size={12} />
          </Link>
        </div>

        {/* Wallet + Coupons stacked */}
        <div className="grid grid-cols-1 gap-4">
          <div className="border border-cream/10 p-6 bg-graphite/30">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-cream/50">
              <Wallet size={13} /> Wallet
            </div>
            <p className="mt-3 font-serif text-3xl">{formatINR(0)}</p>
            <p className="mt-1 text-[10px] text-cream/40">Store credits arriving soon</p>
          </div>
          <Link to="/shop" className="group border border-cream/10 p-6 bg-graphite/30 hover:border-gold/40 transition-colors">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-cream/50">
              <Ticket size={13} /> Coupons
            </div>
            <p className="mt-3 font-serif text-3xl text-cream group-hover:text-gold transition-colors">{couponsCount}</p>
            <p className="mt-1 text-[10px] text-cream/40">Active offers · apply at checkout</p>
          </Link>
        </div>
      </section>

      {/* Recent orders */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Order History</span>
            <h2 className="mt-2 font-serif text-2xl">Recent activity</h2>
          </div>
          {list.length > 0 && (
            <span className="text-[10px] uppercase tracking-[0.24em] text-cream/40">{list.length} total</span>
          )}
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            body="Discover the atelier's rarest attars and modern parfums."
            cta={{ to: "/shop", label: "Start shopping" }}
          />
        ) : (
          <div className="space-y-3">
            {list.slice(0, 5).map((o) => (
              <div key={o.id} className="border border-cream/10 bg-graphite/20 hover:border-gold/30 transition-colors p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-serif text-lg truncate">{o.order_number}</p>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 mt-1">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}
                      {o.order_items?.length ?? 0} item{(o.order_items?.length ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusPill status={o.status as string} />
                    <p className="font-serif text-lg mt-2">{formatINR(o.total_inr)}</p>
                  </div>
                </div>
                {(o.order_items?.length ?? 0) > 0 && (
                  <div className="mt-4 pt-4 border-t border-cream/5 text-sm text-cream/70 space-y-1">
                    {o.order_items!.slice(0, 3).map((it) => (
                      <div key={it.id} className="flex justify-between gap-4">
                        <span className="truncate">{it.name} × {it.quantity}</span>
                        <span className="shrink-0">{formatINR(it.price_inr * it.quantity)}</span>
                      </div>
                    ))}
                    {o.order_items!.length > 3 && (
                      <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 pt-1">
                        + {o.order_items!.length - 3} more
                      </p>
                    )}
                  </div>
                )}
                {((o.points_earned ?? 0) > 0 || (o.points_redeemed ?? 0) > 0) && (
                  <div className="mt-3 pt-3 border-t border-cream/5 flex justify-between text-[10px] uppercase tracking-[0.24em] text-gold/80">
                    <span>{o.points_redeemed ? `−${o.points_redeemed} pts redeemed` : ""}</span>
                    <span>+{o.points_earned ?? 0} pts earned</span>
                  </div>
                )}
              </div>
            ))}
            {list.length > 5 && (
              <p className="text-center text-[10px] uppercase tracking-[0.28em] text-cream/40 pt-2">
                Full order manager arrives with the next release.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Recommendations */}
      <Recommended />
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ size?: number }>; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 border border-cream/15 hover:border-gold hover:text-gold px-4 py-2.5 text-[10px] uppercase tracking-[0.28em] transition-colors"
    >
      <Icon size={13} />
      {label}
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className={`border p-4 md:p-5 ${accent ? "border-gold/40 bg-gold/5" : "border-cream/10 bg-graphite/20"}`}>
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cream/50">
        <Icon size={13} className={accent ? "text-gold" : ""} />
        <span className="truncate">{label}</span>
      </div>
      <p className={`mt-3 font-serif text-3xl md:text-4xl ${accent ? "text-gold" : "text-cream"}`}>{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Placed", className: "border-cream/30 text-cream/70" },
    confirmed: { label: "Confirmed", className: "border-gold/40 text-gold" },
    shipped: { label: "Shipped", className: "border-gold/40 text-gold" },
    out_for_delivery: { label: "Out for Delivery", className: "border-gold/60 text-gold" },

    delivered: { label: "Delivered", className: "border-emerald-500/40 text-emerald-400" },
    cancelled: { label: "Cancelled", className: "border-red-500/40 text-red-400" },
  };
  const s = map[status] ?? { label: status, className: "border-cream/20 text-cream/60" };
  return (
    <span className={`inline-flex items-center border px-2.5 py-1 text-[9px] uppercase tracking-[0.28em] ${s.className}`}>
      {s.label}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
  cta: { to: string; label: string };
}) {
  return (
    <div className="border border-cream/10 bg-graphite/20 p-10 md:p-14 text-center">
      <div className="mx-auto w-14 h-14 grid place-items-center rounded-full border border-gold/40 text-gold">
        <Icon size={20} />
      </div>
      <h3 className="mt-5 font-serif text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-cream/50 max-w-sm mx-auto">{body}</p>
      <Link
        to={cta.to}
        className="mt-6 inline-flex items-center gap-2 bg-gold text-obsidian px-6 py-3 text-[10px] uppercase tracking-[0.28em] hover:bg-cream transition-colors"
      >
        {cta.label} <ChevronRight size={12} />
      </Link>
    </div>
  );
}

function Recommended() {
  const { data: products } = useQuery({
    queryKey: ["account", "recommended"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, subtitle, fragrance_family, price_inr, image_url")
        .eq("is_published", true)
        .order("is_bestseller", { ascending: false })
        .order("rating", { ascending: false })
        .limit(4);
      return data ?? [];
    },
  });
  if (!products || products.length === 0) return null;
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Curated for you</span>
          <h2 className="mt-2 font-serif text-2xl">Recommended</h2>
        </div>
        <Link to="/shop" className="text-[10px] uppercase tracking-[0.28em] text-gold gold-underline">
          Shop all
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {products.map((p) => (
          <Link
            key={p.id}
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="group border border-cream/10 bg-graphite/20 hover:border-gold/30 transition-colors"
          >
            <div className="aspect-[4/5] overflow-hidden bg-obsidian">
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
            </div>
            <div className="p-3 md:p-4">
              <p className="text-[9px] uppercase tracking-[0.28em] text-cream/40 truncate">{p.subtitle || p.fragrance_family || "Fragrance"}</p>
              <p className="mt-1 font-serif text-sm md:text-base truncate group-hover:text-gold transition-colors">{p.name}</p>
              <p className="mt-2 text-[11px] text-gold">{formatINR(p.price_inr)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
