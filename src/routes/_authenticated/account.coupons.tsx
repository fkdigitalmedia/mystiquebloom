import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Ticket, Copy, Check, Clock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/coupons")({
  head: () => ({
    meta: [
      { title: "Coupons · Mystique Blends" },
      { name: "description", content: "Your Mystique coupon wallet — active promotions ready to redeem at checkout." },
    ],
  }),
  component: CouponsPage,
});

function CouponsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["public-coupons"],
    queryFn: async () => {
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const now = Date.now();
  const active = coupons.filter((c: any) => !c.expires_at || new Date(c.expires_at).getTime() > now);
  const expired = coupons.filter((c: any) => c.expires_at && new Date(c.expires_at).getTime() <= now);

  async function copy(code: string) {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success(`Copied ${code}`);
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Concierge</p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl text-cream">Coupon Wallet</h1>
        <p className="mt-2 text-sm text-cream/60">Curated offers to layer with your next composition. Copy a code and paste it at checkout.</p>
      </header>

      {isLoading ? (
        <div className="text-center py-16 text-cream/40 text-sm">Loading offers…</div>
      ) : active.length === 0 ? (
        <div className="border border-cream/10 bg-graphite/20 p-12 text-center">
          <Ticket size={32} className="mx-auto text-gold/60" />
          <p className="mt-4 font-serif text-xl text-cream">No active offers</p>
          <p className="mt-2 text-sm text-cream/60">Watch this space — the Concierge curates new offers every season.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gold text-obsidian text-[10px] uppercase tracking-[0.28em] font-medium"
          >
            <ShoppingBag size={13} /> Browse the House
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {active.map((c: any) => (
            <CouponCard key={c.id} coupon={c} copied={copied === c.code} onCopy={() => copy(c.code)} />
          ))}
        </div>
      )}

      {expired.length > 0 && (
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/40">Expired</p>
          <div className="grid md:grid-cols-2 gap-4 opacity-50">
            {expired.map((c: any) => (
              <CouponCard key={c.id} coupon={c} copied={false} onCopy={() => {}} disabled />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CouponCard({
  coupon,
  copied,
  onCopy,
  disabled,
}: {
  coupon: any;
  copied: boolean;
  onCopy: () => void;
  disabled?: boolean;
}) {
  const discountLabel =
    coupon.discount_type === "percent"
      ? `${coupon.discount_value}% off`
      : `${formatINR(coupon.discount_value)} off`;

  const daysLeft = coupon.expires_at
    ? Math.max(0, Math.ceil((new Date(coupon.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="relative border border-gold/25 bg-gradient-to-br from-graphite/60 to-obsidian overflow-hidden group">
      {/* Notches */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-obsidian border border-gold/25" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-obsidian border border-gold/25" />

      <div className="p-6 flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{discountLabel}</p>
          <p className="mt-2 font-serif text-2xl text-cream truncate">{coupon.description || "Members-only offer"}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.24em] text-cream/50">
            {coupon.min_order_amount > 0 && <span>Min {formatINR(coupon.min_order_amount)}</span>}
            {daysLeft !== null && (
              <span className="flex items-center gap-1">
                <Clock size={11} /> {daysLeft} days left
              </span>
            )}
            {coupon.usage_limit && <span>Limit {coupon.usage_limit}</span>}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 shrink-0">
          <div className="border border-dashed border-gold/40 px-4 py-2 text-center font-mono text-sm text-gold tracking-widest">
            {coupon.code}
          </div>
          <button
            onClick={onCopy}
            disabled={disabled}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gold text-obsidian text-[10px] uppercase tracking-[0.24em] font-medium hover:bg-gold/90 disabled:opacity-50"
          >
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
      </div>
    </div>
  );
}
