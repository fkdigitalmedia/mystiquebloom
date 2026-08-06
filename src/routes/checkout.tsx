import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { useAuth, useCart } from "@/context/app-context";
import { formatINR, resolveImg } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useLoyaltySettings,
  useShippingSettings,
  resolveShippingZone,
} from "@/lib/use-site-settings";
import {
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout · Mystique Blends" },
      {
        name: "description",
        content:
          "Complete your Mystique Blends order — secure mobile checkout with white-glove delivery.",
      },
      { property: "og:title", content: "Checkout · Mystique Blends" },
      { property: "og:description", content: "Complete your Mystique Blends order." },
    ],
  }),
  component: Checkout,
});

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Shipping", icon: Truck },
  { id: 3, label: "Payment", icon: CreditCard },
  { id: 4, label: "Review", icon: CheckCircle2 },
];

function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, refresh } = useCart();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
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
      supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
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
      setForm((f) => ({
        ...f,
        full_name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      }));
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
  const [coupon, setCoupon] = useState<{
    code: string;
    discount_type: string;
    discount_value: number;
    min_order_amount: number;
  } | null>(null);
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
  const effectiveFreeThreshold =
    matchedZone && zoneFreeAbove > 0 ? zoneFreeAbove : globalFreeThreshold;
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
  const maxRedeemable = Math.min(
    pointsBalance,
    Math.floor((subtotal * redeemCapPct) / 100 / pointValue),
  );
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
        .select(
          "code, discount_type, discount_value, min_order_amount, active, expires_at, usage_limit, times_used",
        )
        .eq("code", code)
        .maybeSingle();
      if (error) throw error;
      if (!data || !data.active) {
        toast.error("Invalid coupon code");
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error("This coupon has expired");
        return;
      }
      if (data.usage_limit && data.times_used >= data.usage_limit) {
        toast.error("Coupon usage limit reached");
        return;
      }
      if (subtotal < Number(data.min_order_amount)) {
        toast.error(`Minimum order ${formatINR(Number(data.min_order_amount))} required`);
        return;
      }
      setCoupon({
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        min_order_amount: Number(data.min_order_amount),
      });
      toast.success(`Coupon ${data.code} applied!`);
    } catch (err: any) {
      toast.error(err.message ?? "Could not apply coupon");
    } finally {
      setApplying(false);
    }
  }

  function validateStep(step: number): boolean {
    if (step === 1) {
      if (
        !form.full_name.trim() ||
        !form.phone.trim() ||
        !form.address.trim() ||
        !form.city.trim() ||
        !form.state.trim() ||
        !form.pincode.trim()
      ) {
        toast.error("Please fill in all required shipping address fields.");
        return false;
      }
    }
    return true;
  }

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function placeOrder() {
    if (!user || items.length === 0) return;
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
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
      toast.success(`Order #${order.order_number || order.id.slice(0, 8)} confirmed!`);
      navigate({ to: "/account" });
    } catch (err: any) {
      toast.error(err.message ?? "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans pb-safe">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 md:px-6 py-6 md:py-12">
        <h1 className="font-serif text-3xl md:text-5xl mb-6 text-cream">Checkout</h1>

        {/* Step-by-Step Mobile Wizard Indicator Bar */}
        <div className="mb-8 p-3 rounded-2xl bg-graphite/40 border border-cream/10 flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            return (
              <button
                key={step.id}
                onClick={() => isCompleted && setCurrentStep(step.id)}
                className={`flex-1 flex flex-col items-center gap-1 text-center relative ${
                  isCompleted ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full grid place-items-center transition-all ${
                    isActive
                      ? "bg-gold text-obsidian font-bold shadow-lg shadow-gold/30 ring-4 ring-gold/20"
                      : isCompleted
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "bg-obsidian border border-cream/20 text-cream/40"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-[10px] uppercase font-medium tracking-wider ${
                    isActive ? "text-gold font-bold" : isCompleted ? "text-cream" : "text-cream/40"
                  }`}
                >
                  {step.label}
                </span>

                {/* Connecting line */}
                {idx < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block absolute top-5 left-1/2 w-full h-[2px] -z-10 ${
                      isCompleted ? "bg-gold" : "bg-cream/10"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Form & Order Content Area */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Step Views */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: ADDRESS */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl text-cream flex items-center gap-2">
                      <MapPin size={20} className="text-gold" /> Step 1: Shipping Address
                    </h2>
                  </div>

                  {/* Saved Address Chips */}
                  {addresses.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-wider text-gold font-semibold">
                        Saved Addresses
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {addresses.map((a) => (
                          <button
                            type="button"
                            key={a.id}
                            onClick={() => selectAddress(a.id)}
                            className={`text-left p-4 rounded-xl border transition-all ${
                              selectedAddressId === a.id
                                ? "border-gold bg-gold/10 shadow-lg"
                                : "border-cream/15 bg-graphite/40 hover:border-cream/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold tracking-widest text-gold">
                                {a.label}
                                {a.is_default && " · Default"}
                              </span>
                              {selectedAddressId === a.id && (
                                <CheckCircle2 size={16} className="text-gold" />
                              )}
                            </div>
                            <p className="text-sm font-medium text-cream mt-1">{a.full_name}</p>
                            <p className="text-xs text-cream/60 mt-1">
                              {a.address}, {a.city}, {a.state} {a.pincode}
                            </p>
                            <p className="text-xs text-cream/50 mt-1">{a.phone}</p>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => selectAddress("new")}
                          className={`text-left p-4 rounded-xl border border-dashed transition-all ${
                            selectedAddressId === "new"
                              ? "border-gold bg-gold/10"
                              : "border-cream/20 bg-graphite/20 hover:border-cream/40"
                          }`}
                        >
                          <p className="text-xs uppercase font-semibold text-gold">
                            + Use New Address
                          </p>
                          <p className="text-xs text-cream/50 mt-1">
                            Enter a different delivery location below.
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Address input fields */}
                  <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-graphite/30 border border-cream/10">
                    <Input
                      label="Full Name"
                      value={form.full_name}
                      onChange={(v) => setForm({ ...form, full_name: v })}
                      required
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={form.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                      required
                      span
                    />
                    <Input
                      label="Street Address"
                      value={form.address}
                      onChange={(v) => setForm({ ...form, address: v })}
                      required
                      span
                    />
                    <Input
                      label="City"
                      value={form.city}
                      onChange={(v) => setForm({ ...form, city: v })}
                      required
                    />
                    <Input
                      label="State"
                      value={form.state}
                      onChange={(v) => setForm({ ...form, state: v })}
                      required
                    />
                    <Input
                      label="PIN Code"
                      value={form.pincode}
                      onChange={(v) => setForm({ ...form, pincode: v })}
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: SHIPPING */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-serif text-2xl text-cream flex items-center gap-2">
                    <Truck size={20} className="text-gold" /> Step 2: Shipping Option
                  </h2>

                  <div className="p-5 rounded-2xl bg-graphite/40 border border-gold/40 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs uppercase font-bold tracking-widest text-gold">
                          Express Fragrance Courier
                        </span>
                        <p className="text-sm font-serif text-cream mt-1">
                          Protected Velvet Packaging & Insured Shipping
                        </p>
                        <p className="text-xs text-cream/60 mt-1">
                          Delivery Location: {form.city || "India"}, {form.state} {form.pincode}
                        </p>
                      </div>
                      <span className="font-serif text-lg font-bold text-gold">
                        {shipping === 0 ? "FREE" : formatINR(shipping)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-obsidian border border-cream/10 text-xs text-cream/70 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-gold" />
                      <span>
                        {matchedZone
                          ? `Zone: ${matchedZone.name} (Estimated delivery in ${matchedZone.etaDays || "2-3"} business days)`
                          : "Pan-India Express Dispatch within 24 hours"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-serif text-2xl text-cream flex items-center gap-2">
                    <CreditCard size={20} className="text-gold" /> Step 3: Select Payment
                  </h2>

                  <label className="flex items-start gap-4 p-5 rounded-2xl bg-gold/10 border-2 border-gold cursor-pointer shadow-lg">
                    <input
                      type="radio"
                      name="payment"
                      checked
                      readOnly
                      className="mt-1 accent-gold h-5 w-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-serif text-lg font-bold text-gold">Cash on Delivery (COD)</p>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gold bg-gold/20 px-2.5 py-1 rounded-full border border-gold/40">
                          Available
                        </span>
                      </div>
                      <p className="text-xs text-cream/80 mt-2 leading-relaxed">
                        Pay in cash upon doorstep delivery. Verify your sealed Kannauj fragrance package
                        before handing cash to the courier.
                      </p>
                    </div>
                  </label>
                </motion.div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-serif text-2xl text-cream flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-gold" /> Step 4: Final Review
                  </h2>

                  <div className="p-5 rounded-2xl bg-graphite/40 border border-cream/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-cream/10 pb-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-cream/50">
                          Deliver To
                        </span>
                        <p className="text-sm font-semibold text-cream">{form.full_name}</p>
                        <p className="text-xs text-cream/60">
                          {form.address}, {form.city}, {form.state} {form.pincode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs text-gold underline"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-cream/50">
                          Payment Method
                        </span>
                        <p className="text-sm font-semibold text-gold">Cash on Delivery (COD)</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs text-gold underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Step Navigation Control Buttons */}
            <div className="pt-4 flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="py-3.5 px-5 rounded-xl border border-cream/20 text-cream text-xs uppercase font-bold tracking-widest flex items-center gap-1.5 hover:border-gold hover:text-gold"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-1 py-4 rounded-xl bg-gold text-obsidian text-xs uppercase font-bold tracking-[0.25em] flex items-center justify-center gap-2 shadow-xl hover:bg-cream active:scale-[0.98] transition-all"
                >
                  <span>Continue to {STEPS[currentStep].label}</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={placing || items.length === 0}
                  className="flex-1 py-4 rounded-xl bg-gold text-obsidian text-xs uppercase font-bold tracking-[0.25em] flex items-center justify-center gap-2 shadow-xl hover:bg-cream disabled:opacity-40 active:scale-[0.98] transition-all"
                >
                  <ShoppingBag size={16} />
                  <span>{placing ? "Placing Order..." : "Confirm & Place Order"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Summary Sidebar / Bottom Card */}
          <aside className="bg-graphite/40 border border-cream/10 p-6 rounded-2xl h-fit space-y-6">
            <h2 className="font-serif text-2xl text-cream flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-mono text-gold">{items.length} items</span>
            </h2>

            {/* Line items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex items-center gap-3 text-sm">
                  <img
                    src={resolveImg(i.product?.image_url)}
                    alt={i.product?.name ?? ""}
                    className="w-12 h-14 object-cover rounded-lg bg-obsidian shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-serif text-cream">{i.product?.name}</p>
                    <p className="text-cream/50 text-xs">Qty {i.quantity}</p>
                  </div>
                  <p className="text-gold font-serif font-semibold">
                    {formatINR((i.product?.price_inr ?? 0) * i.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Coupon Code section */}
            <div className="border-t border-cream/10 pt-4 space-y-2">
              {coupon ? (
                <div className="flex items-center justify-between text-xs bg-gold/10 p-2.5 rounded-lg border border-gold/30">
                  <div>
                    <span className="text-gold font-bold tracking-widest uppercase">
                      {coupon.code}
                    </span>
                    <p className="text-cream/50 text-[10px]">Coupon Discount Applied</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCoupon(null);
                      setCouponInput("");
                    }}
                    className="text-cream/60 hover:text-gold text-[10px] uppercase font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="COUPON CODE"
                    className="flex-1 bg-obsidian border border-cream/15 rounded-lg focus:border-gold outline-none px-3 py-2.5 text-xs text-cream uppercase tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={applying || !couponInput.trim()}
                    className="border border-gold text-gold rounded-lg px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-obsidian disabled:opacity-40 transition-colors"
                  >
                    {applying ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Price Calculations breakdown */}
            <div className="border-t border-cream/10 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-cream/70">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-gold font-semibold">
                  <span>Coupon Discount</span>
                  <span>−{formatINR(couponDiscount)}</span>
                </div>
              )}
              {pointsUsed > 0 && (
                <div className="flex justify-between text-gold font-semibold">
                  <span>Points ({pointsUsed})</span>
                  <span>−{formatINR(pointsUsed * pointValue)}</span>
                </div>
              )}
              <div className="flex justify-between text-cream/70">
                <span>Shipping</span>
                <span className="font-semibold text-cream">
                  {shipping === 0 ? "FREE" : formatINR(shipping)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-cream/10 font-serif text-xl text-gold font-bold">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  span,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  span?: boolean;
}) {
  return (
    <label className={`block ${span ? "col-span-2" : ""}`}>
      <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-cream/60">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{ fontSize: "16px" }}
        className="mt-1.5 w-full bg-obsidian border border-cream/15 rounded-xl focus:border-gold outline-none px-4 py-3.5 text-cream placeholder-cream/30 min-h-[48px] transition-colors"
      />
    </label>
  );
}
