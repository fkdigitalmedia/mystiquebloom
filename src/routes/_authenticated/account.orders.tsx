import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, Search, ChevronRight, Filter, Ban } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/orders")({
  head: () => ({
    meta: [
      { title: "My Orders · Mystique Blends" },
      { name: "description", content: "Track, review and reorder from your Mystique atelier order history." },
    ],
  }),
  component: OrdersPage,
});

type StatusFilter = "all" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function OrdersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function cancelOrder(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Cancel this order? This action cannot be undone.")) return;
    setCancellingId(id);
    try {
      const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
      toast.success("Order cancelled");
      await qc.invalidateQueries({ queryKey: ["account", "orders-full"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not cancel order");
    } finally {
      setCancellingId(null);
    }
  }

  const { data: orders, isLoading } = useQuery({
    queryKey: ["account", "orders-full", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, total_inr, subtotal_inr, shipping_inr, discount_amount, points_earned, points_redeemed, coupon_code, created_at, order_items(id, name, quantity, price_inr, image_url)"
        )
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const list = orders ?? [];
    return list.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!q.trim()) return true;
      const needle = q.trim().toLowerCase();
      if (o.order_number?.toLowerCase().includes(needle)) return true;
      return (o.order_items ?? []).some((it) => it.name?.toLowerCase().includes(needle));
    });
  }, [orders, q, status]);

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <header>
        <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Order History</span>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">My Orders</h1>
        <p className="mt-2 text-cream/60 text-sm">Track shipments, review deliveries, and reorder your signature scents.</p>
      </header>

      {/* Controls */}
      <div className="border border-cream/10 bg-graphite/30 p-4 md:p-5 space-y-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by order number or product…"
            className="w-full bg-obsidian/60 border border-cream/10 focus:border-gold/40 outline-none pl-9 pr-3 py-2.5 text-sm placeholder:text-cream/30"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1">
          <Filter size={12} className="text-cream/40 shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] border transition-colors ${
                status === f.key
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-cream/15 text-cream/60 hover:border-gold/40 hover:text-gold"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 border border-cream/10 bg-graphite/20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-cream/10 bg-graphite/20 p-12 text-center">
          <div className="mx-auto w-14 h-14 grid place-items-center rounded-full border border-gold/40 text-gold">
            <Package size={20} />
          </div>
          <h3 className="mt-5 font-serif text-2xl">No orders found</h3>
          <p className="mt-2 text-sm text-cream/50 max-w-sm mx-auto">
            {q || status !== "all" ? "Try clearing filters to see all your orders." : "Begin your Mystique journey with a signature attar."}
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 bg-gold text-obsidian px-6 py-3 text-[10px] uppercase tracking-[0.28em] hover:bg-cream transition-colors"
          >
            Explore fragrances <ChevronRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const items = o.order_items ?? [];
            const preview = items.slice(0, 3);
            const extra = items.length - preview.length;
            return (
              <Link
                key={o.id}
                to="/account/orders/$id"
                params={{ id: o.id }}
                className="block border border-cream/10 bg-graphite/20 hover:border-gold/40 transition-colors p-5 md:p-6 group"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-serif text-lg group-hover:text-gold transition-colors truncate">{o.order_number}</p>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 mt-1">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      {" · "}
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusPill status={o.status as string} />
                    <p className="font-serif text-lg mt-2">{formatINR(o.total_inr)}</p>
                  </div>
                </div>

                {preview.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-cream/5 flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {preview.map((it) => (
                        <div
                          key={it.id}
                          className="h-12 w-12 border border-cream/10 bg-obsidian overflow-hidden shrink-0"
                        >
                          {it.image_url ? (
                            <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-cream/30">
                              <Package size={14} />
                            </div>
                          )}
                        </div>
                      ))}
                      {extra > 0 && (
                        <div className="h-12 w-12 grid place-items-center border border-cream/10 bg-obsidian text-[10px] text-cream/60">
                          +{extra}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-sm text-cream/70 truncate">
                      {preview.map((it) => it.name).join(" · ")}
                    </div>
                    <ChevronRight size={16} className="text-cream/40 group-hover:text-gold shrink-0" />
                  </div>
                )}

                {(o.status === "pending" || o.status === "confirmed") && (
                  <div className="mt-4 pt-4 border-t border-cream/5 flex justify-end">
                    <button
                      onClick={(e) => cancelOrder(e, o.id)}
                      disabled={cancellingId === o.id}
                      className="inline-flex items-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 px-3 py-2 text-[10px] uppercase tracking-[0.28em] transition-colors disabled:opacity-50"
                    >
                      <Ban size={12} />
                      {cancellingId === o.id ? "Cancelling…" : "Cancel order"}
                    </button>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
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
