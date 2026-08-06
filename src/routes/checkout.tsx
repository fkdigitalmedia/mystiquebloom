import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { useAuth, useCart } from "@/context/app-context";
import { formatINR, resolveImg } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLoyaltySettings, useShippingSettings, resolveShippingZone } from "@/lib/use-site-settings";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout · Mystique Blends" },
      { name: "description", content: "Complete your Mystique Blends order — secure checkout with white-glove delivery." },
      { property: "og:title", content: "Checkout · Mystique Blends" },
      { property: "og:description", content: "Complete your Mystique Blends order." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, refresh } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [pointsBalance, setPointsBalance] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
    if (user) {
      setForm((f) => ({ ...f, email: user.email ?? "" }));
      supabase.from("profiles").select("loyalty_points").eq("id", user.id).maybeSingle().then(({ data }) => {
        setPointsBalance(data?.loyalty_points ?? 0);
      });
      supabase
        .from("user_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          const list = data ?? [];
          setAddresses(list);
          const def = list.find((a: any) => a.is_default) ?? list[0];
          if (def) {
            setSelectedAddressId(def.id);
            setForm((f) => ({
              ...f,
              full_name: def.full_name ?? "",
              phone: def.phone ?? "",
              address: def.address ?? "",
              city: def.city ?? "",
              state: def.state ?? "",
              pincode: def.pincode ?? "",
              email: f.email || (user.email ?? ""),
            }));
          }
        });
    }
  }, [user, authLoading, navigate]);

  function selectAddress(id: string) {
    setSelectedAddressId(id);
    if (id === "new") {
      setForm((f) => ({ ...f, full_name: "", phone: "", address: "", city: "", state: "", pincode: "" }));
      return;
    }
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    setForm((f) => ({
      ...f,
      full_name: a.full_name ?? "",
      phone: a.phone ?? "",
      address: a.address ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
      pincode: a.pincode ?? "",
    }));
  }

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount_type: string; discount_value: number; min_order_amount: number } | null>(null);
  const [applying, setApplying] = useState(false);

  const { data: shipCfg } = useShippingSettings();
  const globalFreeThreshold = shipCfg?.freeShippingThreshold ?? 8500;
  const globalExpressRate = shipCfg?.expressRate ?? 250;
  const matchedZone = resolveShippingZone(shipCfg?.zones, {
    city: form.city,
    state: form.state,
    pincode: form.pincode,
  });
  const zoneFreeAbove = matchedZone ? Number(matchedZone.freeAbove) || 0 : 0;
  const zoneRate = matchedZone ? Number(matchedZone.rate) || 0 : globalExpressRate;
  const effectiveFreeThreshold = matchedZone && zoneFreeAbove > 0 ? zoneFreeAbove : globalFreeThreshold;
  const shipping = subtotal >= effectiveFreeThreshold ? 0 : zoneRate;
  const couponDiscount = coupon
    ? coupon.discount_type === "percent"
      ? Math.round((subtotal * Number(coupon.discount_value)) / 100)
      : Math.min(Number(coupon.discount_value), subtotal)
    : 0;
  const { data: loyalty } = useLoyaltySettings();
  const redeemCapPct = loyalty?.redeemCapPct ?? 20;
  const pointValue = loyalty?.pointValue ?? 1;
  const earnPerRupee = loyalty?.earnPerRupee ?? 100;
  const maxRedeemable = Math.min(pointsBalance, Math.floor((subtotal * redeemCapPct) / 100 / pointValue));
  const pointsUsed = Math.max(0, Math.min(redeemPoints, maxRedeemable));
  const discount = couponDiscount + pointsUsed * pointValue;
  const total = Math.max(0, subtotal - discount) + shipping;


  async function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setApplying(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("code, discount_type, discount_value, min_order_amount, active, expires_at, usage_limit, times_used")
        .eq("code", code)
        .maybeSingle();
      if (error) throw error;
      if (!data || !data.active) { toast.error("Invalid coupon code"); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("This coupon has expired"); return; }
      if (data.usage_limit && data.times_used >= data.usage_limit) { toast.error("Coupon usage limit reached"); return; }
      if (subtotal < Number(data.min_order_amount)) {
        toast.error(`Minimum order ${formatINR(Number(data.min_order_amount))} required`); return;
      }
      setCoupon({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        min_order_amount: Number(data.min_order_amount),
      });
      toast.success(`Coupon ${data.code} applied`);
    } catch (err: any) {
      toast.error(err.message ?? "Could not apply coupon");
    } finally {
      setApplying(false);
    }
  }

  function removeCoupon() {
    setCoupon(null);
    setCouponInput("");
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user || items.length === 0) return;
    setPlacing(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal_inr: subtotal,
          shipping_inr: shipping,
          total_inr: total,
          shipping_address: form,
          status: "confirmed",
          coupon_code: coupon?.code ?? null,
          discount_amount: discount,
          points_redeemed: pointsUsed,
        })
        .select()
        .single();
      if (error) throw error;


      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        name: i.product?.name ?? "Product",
        price_inr: i.product?.price_inr ?? 0,
        quantity: i.quantity,
        image_url: i.product?.image_url,
      }));
      await supabase.from("order_items").insert(orderItems);
      await supabase.from("cart_items").delete().eq("user_id", user.id);
      await refresh();
      toast.success(`Order ${order.order_number} confirmed`);
      navigate({ to: "/account" });
    } catch (err: any) {
      toast.error(err.message ?? "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Checkout</h1>

        <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_400px] gap-10">
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl">Shipping Address</h2>
                <a href="/account/addresses" className="text-[10px] uppercase tracking-[0.28em] text-gold/80 hover:text-gold">Manage</a>
              </div>
              {addresses.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3 mb-6">
                  {addresses.map((a) => (
                    <button
                      type="button"
                      key={a.id}
                      onClick={() => selectAddress(a.id)}
                      className={`text-left p-4 border transition ${selectedAddressId === a.id ? "border-gold bg-graphite/50" : "border-cream/15 hover:border-cream/30"}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{a.label}{a.is_default && " · Default"}</p>
                        {selectedAddressId === a.id && <span className="text-[10px] text-gold">✓</span>}
                      </div>
                      <p className="text-sm mt-2">{a.full_name}</p>
                      <p className="text-xs text-cream/60 mt-1">{a.address}, {a.city}, {a.state} {a.pincode}</p>
                      <p className="text-xs text-cream/50 mt-1">{a.phone}</p>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => selectAddress("new")}
                    className={`text-left p-4 border border-dashed transition ${selectedAddressId === "new" ? "border-gold bg-graphite/50" : "border-cream/20 hover:border-cream/40"}`}
                  >
                    <p className="text-[10px] uppercase tracking-[0.28em] text-cream/70">+ Use a new address</p>
                    <p className="text-xs text-cream/50 mt-2">Fill in the details below for a one-time delivery.</p>
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
                <Input label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
                <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required span />
                <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required span />
                <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />
                <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} required />
                <Input label="PIN Code" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} required />
              </div>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">Payment Method</h2>
              <label className="flex items-start gap-4 border border-gold/60 p-6 bg-graphite/30 cursor-pointer">
                <input type="radio" name="payment" checked readOnly className="mt-1 accent-gold" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-lg text-gold">Cash on Delivery</p>
                    <span className="text-[10px] uppercase tracking-[0.28em] text-gold/80 border border-gold/40 px-2 py-1">Available</span>
                  </div>
                  <p className="text-sm text-cream/70 mt-2">
                    Pay in cash when your fragrance arrives at your doorstep. No advance payment required.
                  </p>
                  <ul className="text-xs text-cream/50 mt-3 space-y-1">
                    <li>• Please keep exact change ready</li>
                    <li>• Verify the sealed package before payment</li>
                  </ul>
                </div>
              </label>
            </section>
          </div>

          <aside className="bg-graphite/40 border border-cream/10 p-6 h-fit">
            <h2 className="font-serif text-2xl mb-6">Your Order</h2>
            <div className="space-y-3 mb-6">
              {items.map((i) => (
                <div key={i.id} className="flex gap-3 text-sm">
                  <img src={resolveImg(i.product?.image_url)} className="w-14 h-16 object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{i.product?.name}</p>
                    <p className="text-cream/50 text-xs">Qty {i.quantity}</p>
                  </div>
                  <p className="text-gold">{formatINR((i.product?.price_inr ?? 0) * i.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-cream/10 pt-4 mb-4">
              {coupon ? (
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gold uppercase tracking-[0.2em] text-xs">{coupon.code}</p>
                    <p className="text-cream/50 text-xs mt-0.5">Discount applied</p>
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-cream/60 hover:text-gold text-xs uppercase tracking-[0.2em]">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-2.5 text-xs uppercase tracking-[0.2em]"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={applying || !couponInput.trim()}
                    className="border border-gold text-gold px-4 text-[10px] uppercase tracking-[0.28em] hover:bg-gold hover:text-obsidian disabled:opacity-40"
                  >
                    {applying ? "…" : "Apply"}
                  </button>
                </div>
              )}
            </div>
            {pointsBalance > 0 && (
              <div className="border-t border-cream/10 pt-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-gold">Loyalty Points</p>
                    <p className="text-xs text-cream/50 mt-0.5">Balance: {pointsBalance} · 1 pt = {formatINR(pointValue)}</p>
                  </div>
                  {pointsUsed > 0 && (
                    <button type="button" onClick={() => setRedeemPoints(0)} className="text-cream/60 hover:text-gold text-xs uppercase tracking-[0.2em]">Clear</button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    max={maxRedeemable}
                    value={redeemPoints || ""}
                    onChange={(e) => setRedeemPoints(Math.max(0, Math.min(maxRedeemable, Number(e.target.value) || 0)))}
                    placeholder={`Max ${maxRedeemable}`}
                    className="flex-1 bg-transparent border border-cream/15 focus:border-gold outline-none px-3 py-2.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setRedeemPoints(maxRedeemable)}
                    disabled={maxRedeemable === 0}
                    className="border border-gold text-gold px-4 text-[10px] uppercase tracking-[0.28em] hover:bg-gold hover:text-obsidian disabled:opacity-40"
                  >
                    Max
                  </button>
                </div>
              </div>
            )}
            <div className="border-t border-cream/10 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-cream/60">Subtotal</span><span>{formatINR(subtotal)}</span></div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-gold"><span>Coupon</span><span>−{formatINR(couponDiscount)}</span></div>
              )}
              {pointsUsed > 0 && (
                <div className="flex justify-between text-gold"><span>Points ({pointsUsed})</span><span>−{formatINR(pointsUsed * pointValue)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-cream/60">Shipping{matchedZone ? ` · ${matchedZone.name}${matchedZone.etaDays ? ` (${matchedZone.etaDays} days)` : ""}` : ""}</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
              {shipping > 0 && effectiveFreeThreshold > subtotal && (
                <div className="text-[11px] text-cream/40 -mt-1">Add {formatINR(effectiveFreeThreshold - subtotal)} more for free shipping</div>
              )}
              <div className="flex justify-between pt-3 border-t border-cream/10 font-serif text-lg text-gold">
                <span>Total</span><span>{formatINR(total)}</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 pt-2">You'll earn {Math.floor(total / earnPerRupee)} points on this order</p>
            </div>

            <button
              type="submit"
              disabled={placing || items.length === 0}
              className="mt-6 w-full bg-gold text-obsidian py-4 text-[11px] uppercase tracking-[0.28em] font-semibold hover:bg-cream disabled:opacity-40"
            >
              {placing ? "Placing…" : "Place Order"}
            </button>
          </aside>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required, span }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; span?: boolean;
}) {
  return (
    <label className={`block ${span ? "col-span-2" : ""}`}>
      <span className="text-[10px] uppercase tracking-[0.25em] text-cream/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1.5 w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-3 text-sm"
      />
    </label>
  );
}
