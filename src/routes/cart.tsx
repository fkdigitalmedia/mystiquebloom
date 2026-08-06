import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { useCart } from "@/context/app-context";
import { formatINR, resolveImg } from "@/lib/format";
import { useShippingSettings } from "@/lib/use-site-settings";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart · Mystique Blends" },
      { name: "description", content: "Review your Mystique Blends selections before checkout." },
      { property: "og:title", content: "Your Cart · Mystique Blends" },
      { property: "og:description", content: "Review your Mystique Blends selections." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, updateQty, removeItem } = useCart();
  const { data: shipCfg } = useShippingSettings();
  const freeThreshold = shipCfg?.freeShippingThreshold ?? 8500;
  const expressRate = shipCfg?.expressRate ?? 250;
  const shipping = subtotal === 0 || subtotal >= freeThreshold ? 0 : expressRate;

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl mb-4">Nothing here yet</p>
            <Link to="/shop" className="inline-block bg-gold text-obsidian px-8 py-4 text-[11px] uppercase tracking-[0.28em] font-semibold">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 border-b border-cream/10 pb-6">
                  <img src={resolveImg(item.product?.image_url)} className="w-24 h-32 object-cover" />
                  <div className="flex-1">
                    <p className="font-serif text-xl">{item.product?.name}</p>
                    <p className="text-cream/50 text-sm">{item.product?.subtitle}</p>
                    <p className="text-gold mt-2">{formatINR(item.product?.price_inr ?? 0)}</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center border border-cream/20">
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 grid place-items-center"><Minus size={12} /></button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 grid place-items-center"><Plus size={12} /></button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-cream/40 hover:text-gold"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="font-serif text-xl text-cream">{formatINR((item.product?.price_inr ?? 0) * item.quantity)}</p>
                </div>
              ))}
            </div>

            <aside className="bg-graphite/40 border border-cream/10 p-6 h-fit">
              <h2 className="font-serif text-2xl mb-6">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-cream/60">Subtotal</span><span>{formatINR(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-cream/60">Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
                <div className="flex justify-between pt-3 border-t border-cream/10 font-serif text-lg text-gold"><span>Total</span><span>{formatINR(subtotal + shipping)}</span></div>
              </div>
              <Link to="/checkout" className="mt-6 block text-center bg-gold text-obsidian py-4 text-[11px] uppercase tracking-[0.28em] font-semibold hover:bg-cream">
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
