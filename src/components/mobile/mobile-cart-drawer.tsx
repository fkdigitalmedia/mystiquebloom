import { Drawer } from "vaul";
import { useCart } from "@/context/app-context";
import { formatINR, resolveImg } from "@/lib/format";
import { Minus, Plus, Trash2, ShoppingBag, Truck, Tag, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useShippingSettings } from "@/lib/use-site-settings";

export function MobileCartDrawer() {
  const { items, subtotal, cartOpen, setCartOpen, updateQty, removeItem } = useCart();
  const { data: shipCfg } = useShippingSettings();
  const freeThreshold = shipCfg?.freeShippingThreshold ?? 8500;

  const amountNeededForFreeShipping = Math.max(0, freeThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <Drawer.Root open={cartOpen} onOpenChange={setCartOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-obsidian text-cream rounded-t-[28px] max-h-[90vh] border-t border-gold/30 pt-3 pb-safe shadow-2xl">
          {/* Pull bar handle */}
          <div className="mx-auto w-12 h-1.5 rounded-full bg-cream/20 mb-3" />

          {/* Header */}
          <div className="px-6 py-2 border-b border-cream/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-gold" />
              <h2 className="font-serif text-xl text-cream tracking-wide">Your Bag</h2>
            </div>
            <span className="text-xs font-semibold text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">
              {items.reduce((acc, i) => acc + i.quantity, 0)} Items
            </span>
          </div>

          {/* Free Shipping Progress Meter */}
          {items.length > 0 && (
            <div className="bg-graphite/60 px-6 py-3 border-b border-cream/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-cream/70 flex items-center gap-1.5 font-medium">
                  <Truck size={14} className="text-gold" />
                  {amountNeededForFreeShipping === 0
                    ? "Unlocked Free Express Shipping!"
                    : `Add ${formatINR(amountNeededForFreeShipping)} more for Free Shipping`}
                </span>
                <span className="text-gold font-semibold">{freeShippingProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-obsidian rounded-full overflow-hidden border border-cream/10">
                <div
                  className="h-full bg-gradient-to-r from-gold/70 to-gold rounded-full transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-cream/50">
                <ShoppingBag size={48} className="mx-auto text-gold/30 mb-3" />
                <p className="font-serif text-2xl mb-2 text-cream">Your cart is empty</p>
                <p className="text-sm text-cream/60 max-w-xs mx-auto">
                  Explore our hand-distilled Kannauj attars and luxury parfums.
                </p>
                <Link
                  to="/shop"
                  onClick={() => setCartOpen(false)}
                  className="mt-6 inline-flex items-center gap-2 bg-gold text-obsidian px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-cream"
                >
                  <span>Explore Fragrances</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-graphite/40 border border-cream/10"
                >
                  <img
                    src={resolveImg(item.product?.image_url)}
                    alt={item.product?.name ?? ""}
                    className="w-20 h-24 object-cover rounded-lg bg-obsidian shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-serif text-base text-cream truncate">
                          {item.product?.name}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-cream/40 hover:text-gold p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-cream/50 truncate mt-0.5">
                        {item.product?.subtitle}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-cream/20 rounded-lg overflow-hidden bg-obsidian">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="w-8 h-8 grid place-items-center hover:text-gold text-cream/70"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="w-8 h-8 grid place-items-center hover:text-gold text-cream/70"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="text-gold font-serif text-base font-semibold">
                        {formatINR((item.product?.price_inr ?? 0) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-cream/10 px-6 pt-4 pb-2 bg-graphite/50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-cream/70 font-medium">Subtotal</span>
                <span className="font-serif text-xl font-bold text-gold">
                  {formatINR(subtotal)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-cream/50">
                <Tag size={12} className="text-gold" />
                <span>Taxes & Shipping calculated at checkout</span>
              </div>

              <Link
                to="/checkout"
                onClick={() => setCartOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-gold text-obsidian py-4 rounded-xl text-xs font-bold uppercase tracking-[0.25em] shadow-xl hover:bg-cream transition-all active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
