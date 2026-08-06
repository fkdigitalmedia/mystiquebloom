import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useCart } from "@/context/app-context";
import { formatINR, resolveImg } from "@/lib/format";
import { toast } from "sonner";
import giftBox from "@/assets/gift-box.jpg";


export const Route = createFileRoute("/gift-builder")({
  head: () => ({
    meta: [
      { title: "Build a Gift Box · Mystique Blends" },
      { name: "description", content: "Compose a bespoke fragrance gift box — choose two or three bottles, add a hand-written note, and we hand-finish it in our atelier." },
      { property: "og:title", content: "Build a Gift Box · Mystique Blends" },
      { property: "og:description", content: "A bespoke gift box, hand-finished in the Mystique atelier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GiftBuilderPage,
});

const BOX_STYLES = [
  { id: "signature", label: "Signature", note: "Black lacquer, gold monogram", price: 0 },
  { id: "heritage", label: "Heritage", note: "Walnut wood, brass inlay", price: 1200 },
  { id: "atelier", label: "Atelier Reserve", note: "Handbound leather portfolio", price: 2800 },
];

const OCCASIONS = ["Anniversary", "Wedding", "Diwali", "Birthday", "Corporate", "For Him", "For Her"];

function GiftBuilderPage() {
  const { user } = useAuth();
  const { addToCart, setCartOpen } = useCart();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [boxStyle, setBoxStyle] = useState("signature");
  const [occasion, setOccasion] = useState<string>("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [ordering, setOrdering] = useState(false);


  const { data: products } = useQuery({
    queryKey: ["gift", "products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, subtitle, price_inr, image_url, fragrance_family")
        .eq("is_published", true)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const box = BOX_STYLES.find((b) => b.id === boxStyle)!;
  const productMap = useMemo(
    () => new Map((products ?? []).map((p) => [p.id, p])),
    [products],
  );
  const productsTotal = selected.reduce(
    (s, id) => s + (productMap.get(id)?.price_inr ?? 0),
    0,
  );
  const total = productsTotal + box.price;

  function toggle(id: string) {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 4) {
        toast.error("A gift box holds up to four bottles");
        return cur;
      }
      return [...cur, id];
    });
  }

  function validate(): boolean {
    if (!user) {
      toast.error("Sign in to continue with your gift box");
      navigate({ to: "/auth" });
      return false;
    }
    if (selected.length < 2) {
      toast.error("Choose at least two fragrances");
      return false;
    }
    return true;
  }

  async function saveBox(status: "saved" | "ordered") {
    const { data, error } = await supabase
      .from("gift_boxes")
      .insert({
        user_id: user!.id,
        recipient_name: recipient || null,
        message: message || null,
        box_style: boxStyle,
        occasion: occasion || null,
        product_ids: selected,
        total,
        status,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async function saveForLater() {
    if (!validate()) return;
    setSaving(true);
    try {
      await saveBox("saved");
      toast.success("Gift box saved to your account");
      navigate({ to: "/account/gifts" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function orderNow() {
    if (!validate()) return;
    setOrdering(true);
    try {
      await saveBox("ordered");
      for (const pid of selected) {
        await addToCart(pid, 1);
      }
      setCartOpen(false);
      toast.success("Gift box added to your cart");
      navigate({ to: "/checkout" });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setOrdering(false);
    }
  }


  const step = selected.length < 2 ? 1 : selected.length < 4 ? 2 : 3;

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main>
        <section className="relative border-b border-cream/10">
          <div className="absolute inset-0">
            <img src={giftBox} alt="" className="h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 to-obsidian" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-4">Bespoke Gifting</p>
            <h1 className="font-serif text-5xl md:text-6xl">Build Your Gift Box</h1>
            <p className="mt-6 max-w-2xl mx-auto text-cream/70">
              Choose two to four fragrances, select a vessel, and add a private inscription. Every box is hand-finished, sealed, and delivered with complimentary shipping across India.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 grid gap-12 lg:grid-cols-[1fr_400px]">
          <div>
            {/* Step 1: pick */}
            <div className="mb-14">
              <div className="flex items-baseline justify-between mb-6">
                <h2 className="font-serif text-3xl">
                  <span className="text-gold mr-3 text-lg align-middle">01</span>Choose Fragrances
                </h2>
                <span className="text-[11px] uppercase tracking-[0.3em] text-cream/50">
                  {selected.length}/4 selected
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products?.map((p) => {
                  const active = selected.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggle(p.id)}
                      className={`text-left group border transition-all ${
                        active
                          ? "border-gold bg-gold/5"
                          : "border-cream/10 hover:border-cream/30 bg-graphite/30"
                      }`}
                    >
                      <div className="aspect-square overflow-hidden bg-obsidian">
                        <img
                          src={resolveImg(p.image_url)}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-gold">
                          {p.fragrance_family}
                        </p>
                        <p className="font-serif text-lg mt-1">{p.name}</p>
                        <p className="text-xs text-cream/60 mt-1 line-clamp-1">{p.subtitle}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm">{formatINR(p.price_inr)}</span>
                          <span
                            className={`text-[10px] uppercase tracking-[0.3em] ${
                              active ? "text-gold" : "text-cream/40"
                            }`}
                          >
                            {active ? "✓ Chosen" : "Add"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: box style */}
            <div className="mb-14">
              <h2 className="font-serif text-3xl mb-6">
                <span className="text-gold mr-3 text-lg align-middle">02</span>Select the Vessel
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {BOX_STYLES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBoxStyle(b.id)}
                    className={`p-6 text-left border transition-colors ${
                      boxStyle === b.id
                        ? "border-gold bg-gold/5"
                        : "border-cream/10 hover:border-cream/30"
                    }`}
                  >
                    <p className="font-serif text-xl">{b.label}</p>
                    <p className="text-xs text-cream/60 mt-1">{b.note}</p>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-gold mt-3">
                      {b.price === 0 ? "Included" : `+ ${formatINR(b.price)}`}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: inscription */}
            <div className="mb-14">
              <h2 className="font-serif text-3xl mb-6">
                <span className="text-gold mr-3 text-lg align-middle">03</span>Inscribe the Card
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.28em] text-cream/60">
                    Occasion
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {OCCASIONS.map((o) => (
                      <button
                        key={o}
                        onClick={() => setOccasion(o === occasion ? "" : o)}
                        className={`px-3 py-1.5 text-xs uppercase tracking-[0.2em] border ${
                          occasion === o
                            ? "border-gold text-gold"
                            : "border-cream/15 text-cream/70 hover:border-cream/40"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.28em] text-cream/60">
                    Recipient's Name
                  </label>
                  <input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="For…"
                    className="mt-3 w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-2.5 font-serif"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="text-[10px] uppercase tracking-[0.28em] text-cream/60">
                  Private Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={280}
                  placeholder="A note handwritten by our atelier calligrapher…"
                  className="mt-3 w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-3 font-serif resize-none"
                />
                <p className="mt-2 text-[10px] uppercase tracking-[0.28em] text-cream/40">
                  {message.length}/280
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 self-start border border-cream/10 bg-graphite/30 p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">Your Composition</p>
            <h3 className="font-serif text-2xl mb-6">Gift Summary</h3>

            <div className="space-y-3 mb-6">
              {selected.length === 0 && (
                <p className="text-sm text-cream/50 italic">
                  Choose at least two fragrances to begin.
                </p>
              )}
              {selected.map((id) => {
                const p = productMap.get(id);
                if (!p) return null;
                return (
                  <div key={id} className="flex items-center justify-between text-sm">
                    <span className="font-serif">{p.name}</span>
                    <span className="text-cream/70">{formatINR(p.price_inr)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-cream/10 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-cream/70">
                <span>Vessel · {box.label}</span>
                <span>{box.price === 0 ? "Included" : formatINR(box.price)}</span>
              </div>
              <div className="flex justify-between font-serif text-lg pt-2 border-t border-cream/10">
                <span>Total</span>
                <span className="text-gold">{formatINR(total)}</span>
              </div>
            </div>

            <button
              onClick={orderNow}
              disabled={ordering || saving || selected.length < 2}
              className="mt-6 w-full bg-gold text-obsidian py-3.5 text-[11px] uppercase tracking-[0.32em] font-medium disabled:opacity-40 hover:bg-gold/90 transition-colors"
            >
              {ordering ? "Preparing…" : "Order Gift Box"}
            </button>
            <button
              onClick={saveForLater}
              disabled={saving || ordering || selected.length < 2}
              className="mt-3 w-full border border-cream/20 py-3 text-[11px] uppercase tracking-[0.32em] hover:border-gold hover:text-gold disabled:opacity-40 transition-colors"
            >
              {saving ? "Saving…" : "Save for later"}
            </button>
            <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-cream/40 text-center">
              Step {step} of 3 · Complimentary gift wrapping
            </p>

          </aside>
        </section>
      </main>
    </div>
  );
}
