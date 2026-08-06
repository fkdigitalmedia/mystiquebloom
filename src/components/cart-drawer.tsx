import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/app-context";
import { formatINR, resolveImg } from "@/lib/format";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CartDrawer() {
  const { items, subtotal, cartOpen, setCartOpen, updateQty, removeItem } = useCart();

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="bg-obsidian text-cream border-l border-cream/10 w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl text-cream flex items-center gap-2">
            <ShoppingBag size={18} className="text-gold" /> Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-4">
          {items.length === 0 && (
            <div className="text-center py-16 text-cream/50">
              <p className="font-serif text-xl mb-2">Your cart is empty</p>
              <p className="text-sm">Discover our fragrances</p>
              <Link
                to="/shop"
                onClick={() => setCartOpen(false)}
                className="mt-6 inline-block bg-gold text-obsidian px-6 py-3 text-[10px] uppercase tracking-[0.28em]"
              >
                Shop Now
              </Link>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 border-b border-cream/10 pb-4">
              <img
                src={resolveImg(item.product?.image_url)}
                alt={item.product?.name ?? ""}
                className="w-20 h-24 object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-serif text-base truncate">{item.product?.name}</p>
                <p className="text-xs text-cream/50 mt-0.5">{item.product?.subtitle}</p>
                <p className="text-gold text-sm mt-2">{formatINR((item.product?.price_inr ?? 0) * item.quantity)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-cream/20">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 grid place-items-center hover:text-gold"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 grid place-items-center hover:text-gold"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-cream/40 hover:text-gold"
                    aria-label="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-cream/10 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-cream/60">Subtotal</span>
              <span className="font-serif text-lg text-gold">{formatINR(subtotal)}</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cream/40">
              Shipping calculated at checkout
            </p>
            <Link
              to="/checkout"
              onClick={() => setCartOpen(false)}
              className="block text-center bg-gold text-obsidian py-4 text-[11px] uppercase tracking-[0.28em] font-semibold hover:bg-cream transition-colors"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              onClick={() => setCartOpen(false)}
              className="block text-center border border-cream/20 py-3 text-[11px] uppercase tracking-[0.28em] hover:border-gold hover:text-gold"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
