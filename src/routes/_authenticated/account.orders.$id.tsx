import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Home,
  XCircle,
  ChevronLeft,
  Copy,
  RotateCcw,
  Printer,
  Ban,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, useCart } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/orders/$id")({
  head: () => ({
    meta: [
      { title: "Order Details · Mystique Blends" },
      { name: "description", content: "Track your Mystique atelier order — items, shipment status and invoice." },
    ],
  }),
  component: OrderDetailPage,
});

type ShippingAddress = {
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

const TIMELINE = [
  { key: "pending", label: "Order Placed", icon: Clock, desc: "Order received at the atelier.", tsKey: "created_at" },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2, desc: "Composition confirmed and being prepared.", tsKey: "confirmed_at" },
  { key: "shipped", label: "Shipped", icon: Package, desc: "Dispatched with care in signature packaging.", tsKey: "shipped_at" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck, desc: "Your parcel is with the courier for final delivery.", tsKey: "out_for_delivery_at" },
  { key: "delivered", label: "Delivered", icon: Home, desc: "Arrived at your doorstep.", tsKey: "delivered_at" },
] as const;

const STATUS_ORDER = ["pending", "confirmed", "shipped", "out_for_delivery", "delivered"];

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["account", "order", id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, status, total_inr, subtotal_inr, shipping_inr, discount_amount, points_earned, points_redeemed, coupon_code, shipping_address, created_at, confirmed_at, shipped_at, out_for_delivery_at, delivered_at, cancelled_at, courier, tracking_number, tracking_url, estimated_delivery, order_items(id, product_id, name, quantity, price_inr, image_url)"
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const addr = (order?.shipping_address ?? {}) as ShippingAddress;
  const items = order?.order_items ?? [];

  const stepIndex = useMemo(() => {
    if (!order) return -1;
    if (order.status === "cancelled") return -1;
    const idx = STATUS_ORDER.indexOf(order.status as string);
    return idx === -1 ? 0 : idx;
  }, [order]);


  async function copyOrderNumber() {
    if (!order?.order_number) return;
    await navigator.clipboard.writeText(order.order_number);
    toast.success("Order number copied");
  }

  async function reorder() {
    if (!order) return;
    setReordering(true);
    try {
      for (const it of items) {
        if (it.product_id) await addToCart(it.product_id, it.quantity);
      }
      toast.success("Items added to your cart");
      navigate({ to: "/cart" });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not reorder");
    } finally {
      setReordering(false);
    }
  }

  async function cancelOrder() {
    if (!order) return;
    if (!confirm("Cancel this order? This action cannot be undone.")) return;
    setCancelling(true);
    try {
      const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      if (error) throw error;
      toast.success("Order cancelled");
      await qc.invalidateQueries({ queryKey: ["account", "order", id] });
      await qc.invalidateQueries({ queryKey: ["account", "orders-full"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not cancel order");
    } finally {
      setCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 pb-24 md:pb-8">
        <div className="h-32 border border-cream/10 bg-graphite/20 animate-pulse" />
        <div className="h-64 border border-cream/10 bg-graphite/20 animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="border border-cream/10 bg-graphite/20 p-12 text-center">
        <div className="mx-auto w-14 h-14 grid place-items-center rounded-full border border-red-500/40 text-red-400">
          <XCircle size={20} />
        </div>
        <h3 className="mt-5 font-serif text-2xl">Order not found</h3>
        <p className="mt-2 text-sm text-cream/50">This order may have been removed or does not belong to you.</p>
        <Link to="/account/orders" className="mt-6 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold gold-underline">
          <ChevronLeft size={12} /> Back to orders
        </Link>
      </div>
    );
  }

  const cancelled = order.status === "cancelled";
  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <div className="space-y-6 pb-24 md:pb-8 print:pb-0">
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.28em] text-cream/50 hover:text-gold print:hidden"
      >
        <ChevronLeft size={12} /> All orders
      </Link>

      {/* Header */}
      <section className="border border-cream/10 bg-gradient-to-br from-graphite/60 via-obsidian to-obsidian p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Order</span>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-3xl md:text-4xl">{order.order_number}</h1>
              <button onClick={copyOrderNumber} className="text-cream/40 hover:text-gold print:hidden" title="Copy order number">
                <Copy size={14} />
              </button>
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-cream/50">
              Placed {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}
              {items.length} item{items.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="text-right">
            <StatusBadge status={order.status as string} />
            <p className="font-serif text-3xl mt-2">{formatINR(order.total_inr)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-2 print:hidden">
          <button
            onClick={reorder}
            disabled={reordering || items.length === 0}
            className="inline-flex items-center gap-2 border border-gold text-gold hover:bg-gold hover:text-obsidian px-4 py-2.5 text-[10px] uppercase tracking-[0.28em] transition-colors disabled:opacity-50"
          >
            <RotateCcw size={13} />
            {reordering ? "Adding…" : "Reorder"}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 border border-cream/20 text-cream hover:border-gold hover:text-gold px-4 py-2.5 text-[10px] uppercase tracking-[0.28em] transition-colors"
          >
            <Printer size={13} />
            Invoice
          </button>
          {canCancel && (
            <button
              onClick={cancelOrder}
              disabled={cancelling}
              className="inline-flex items-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-2.5 text-[10px] uppercase tracking-[0.28em] transition-colors disabled:opacity-50"
            >
              <Ban size={13} />
              {cancelling ? "Cancelling…" : "Cancel order"}
            </button>
          )}
        </div>
      </section>

      {/* Tracking card */}
      {(order.courier || order.tracking_number || order.tracking_url || order.estimated_delivery) && !cancelled && (
        <section className="border border-gold/30 bg-gradient-to-br from-gold/5 via-graphite/20 to-obsidian p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Shipment Tracking</span>
              <h2 className="mt-2 font-serif text-2xl">
                {order.courier ? order.courier : "Courier partner"}
              </h2>
              {order.tracking_number && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-cream/50">AWB</span>
                  <code className="font-mono text-cream tracking-wider">{order.tracking_number}</code>
                  <button
                    onClick={async () => { await navigator.clipboard.writeText(order.tracking_number!); toast.success("Tracking number copied"); }}
                    className="text-cream/40 hover:text-gold print:hidden"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              )}
            </div>
            {order.estimated_delivery && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Estimated delivery</p>
                <p className="mt-1 font-serif text-xl text-gold">
                  {new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 bg-gold text-obsidian hover:bg-cream px-5 py-2.5 text-[10px] uppercase tracking-[0.28em] transition-colors print:hidden"
            >
              <Truck size={13} /> Track on courier site
            </a>
          )}
        </section>
      )}

      {/* Timeline */}
      <section className="border border-cream/10 bg-graphite/20 p-6 md:p-8">
        <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Shipment Journey</span>
        <h2 className="mt-2 font-serif text-2xl mb-6">Track your order</h2>

        {cancelled ? (
          <div className="border border-red-500/30 bg-red-500/5 p-5 flex items-start gap-3">
            <XCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-red-400">Order cancelled</p>
              <p className="text-sm text-cream/60 mt-1">
                This order was cancelled{order.cancelled_at ? ` on ${new Date(order.cancelled_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}` : ""} and will not be delivered.
              </p>
            </div>
          </div>
        ) : (
          <ol className="relative">
            {TIMELINE.map((step, i) => {
              const Icon = step.icon;
              const reached = i <= stepIndex;
              const current = i === stepIndex;
              const ts = (order as any)[step.tsKey] as string | null | undefined;
              return (
                <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                  {i < TIMELINE.length - 1 && (
                    <span
                      className={`absolute left-[19px] top-10 bottom-0 w-px ${reached && i < stepIndex ? "bg-gold" : "bg-cream/10"}`}
                    />
                  )}
                  <div
                    className={`relative z-10 h-10 w-10 shrink-0 grid place-items-center rounded-full border-2 transition-colors ${
                      current
                        ? "border-gold bg-gold/10 text-gold animate-pulse"
                        : reached
                          ? "border-gold bg-gold text-obsidian"
                          : "border-cream/15 bg-obsidian text-cream/30"
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="pt-2 min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <p className={`text-[11px] uppercase tracking-[0.28em] ${reached ? "text-gold" : "text-cream/40"}`}>
                        {step.label}
                      </p>
                      {reached && ts && (
                        <p className="text-[10px] uppercase tracking-[0.22em] text-cream/50">
                          {new Date(ts).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${reached ? "text-cream/80" : "text-cream/40"}`}>{step.desc}</p>
                    {current && (
                      <p className="text-[10px] uppercase tracking-[0.24em] text-gold/70 mt-1">Current stage</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>


      {/* Items + Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4">
        <div className="border border-cream/10 bg-graphite/20 p-6 md:p-8">
          <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Composition</span>
          <h2 className="mt-2 font-serif text-2xl mb-6">Items in this order</h2>
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex gap-4 border-b border-cream/5 pb-4 last:border-0 last:pb-0">
                <div className="h-20 w-20 shrink-0 border border-cream/10 bg-obsidian overflow-hidden">
                  {it.image_url ? (
                    <img src={it.image_url} alt={it.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-cream/30">
                      <Package size={18} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-lg truncate">{it.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 mt-1">
                    Qty {it.quantity} · {formatINR(it.price_inr)} each
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-serif text-lg">{formatINR(it.price_inr * it.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Summary */}
          <div className="border border-cream/10 bg-graphite/20 p-6">
            <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Summary</span>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Subtotal" value={formatINR(order.subtotal_inr ?? 0)} />
              {(order.discount_amount ?? 0) > 0 && (
                <Row
                  label={`Discount${order.coupon_code ? ` · ${order.coupon_code}` : ""}`}
                  value={`− ${formatINR(order.discount_amount ?? 0)}`}
                  accent="text-emerald-400"
                />
              )}
              {(order.points_redeemed ?? 0) > 0 && (
                <Row label={`Points redeemed`} value={`− ${formatINR(order.points_redeemed ?? 0)}`} accent="text-gold" />
              )}
              <Row label="Shipping" value={(order.shipping_inr ?? 0) === 0 ? "Complimentary" : formatINR(order.shipping_inr ?? 0)} />
              <div className="border-t border-cream/10 pt-3 mt-3 flex justify-between items-baseline">
                <span className="text-[11px] uppercase tracking-[0.28em] text-cream/60">Total</span>
                <span className="font-serif text-2xl text-gold">{formatINR(order.total_inr)}</span>
              </div>
              {(order.points_earned ?? 0) > 0 && (
                <p className="text-[10px] uppercase tracking-[0.24em] text-gold/70 pt-2">
                  + {order.points_earned} pts earned
                </p>
              )}
            </div>
          </div>

          {/* Shipping address */}
          <div className="border border-cream/10 bg-graphite/20 p-6">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-gold">
              <MapPin size={12} /> Shipping to
            </div>
            <div className="mt-3 text-sm text-cream/80 space-y-1">
              {addr.full_name && <p className="font-medium text-cream">{addr.full_name}</p>}
              {addr.address && <p>{addr.address}</p>}
              {(addr.city || addr.state || addr.pincode) && (
                <p>
                  {[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                </p>
              )}
              {addr.phone && <p className="text-cream/60 pt-1">☎ {addr.phone}</p>}
              {addr.email && <p className="text-cream/60 truncate">{addr.email}</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-cream/60">{label}</span>
      <span className={accent ?? "text-cream"}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: "Placed", className: "border-cream/30 text-cream/70" },
    confirmed: { label: "Confirmed", className: "border-gold/40 text-gold bg-gold/5" },
    shipped: { label: "Shipped", className: "border-gold/40 text-gold bg-gold/5" },
    out_for_delivery: { label: "Out for Delivery", className: "border-gold/60 text-gold bg-gold/10" },
    delivered: { label: "Delivered", className: "border-emerald-500/40 text-emerald-400 bg-emerald-500/5" },
    cancelled: { label: "Cancelled", className: "border-red-500/40 text-red-400 bg-red-500/5" },
  };
  const s = map[status] ?? { label: status, className: "border-cream/20 text-cream/60" };
  return (
    <span className={`inline-flex items-center border px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] ${s.className}`}>
      {s.label}
    </span>
  );
}

