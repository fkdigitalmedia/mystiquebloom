import { useState } from "react";
import { formatINR, resolveImg } from "@/lib/format";
import { useCart } from "@/context/app-context";
import { Plus, Check, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface MobileFrequentlyBoughtProps {
  currentProduct: {
    id: string;
    name: string;
    price_inr: number;
    image_url: string | null;
  };
  bundleProduct?: {
    id: string;
    name: string;
    price_inr: number;
    image_url: string | null;
  } | null;
}

export function MobileFrequentlyBought({
  currentProduct,
  bundleProduct,
}: MobileFrequentlyBoughtProps) {
  const { addToCart } = useCart();
  const [includeBundle, setIncludeBundle] = useState(true);
  const [adding, setAdding] = useState(false);

  // Fallback complimentary product if database item not explicitly passed
  const companion = bundleProduct || {
    id: "attar-pocket-spray",
    name: "Royal Oud Pocket Attar (12ml)",
    price_inr: 899,
    image_url: currentProduct.image_url,
  };

  const totalPrice = currentProduct.price_inr + (includeBundle ? companion.price_inr : 0);
  const discountAmount = includeBundle ? Math.round(companion.price_inr * 0.15) : 0;
  const finalBundlePrice = totalPrice - discountAmount;

  const handleAddBundle = async () => {
    setAdding(true);
    try {
      await addToCart(currentProduct.id, 1);
      if (includeBundle && companion.id !== "attar-pocket-spray") {
        await addToCart(companion.id, 1);
      }
      toast.success("Added bundle to cart with 15% discount!");
    } catch {
      // Handled in addToCart
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="py-6 border-t border-cream/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-gold" />
          <h3 className="font-serif text-2xl text-cream tracking-wide">
            Frequently Bought Together
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-gold font-bold bg-gold/10 px-2 py-0.5 rounded border border-gold/30">
          Save 15%
        </span>
      </div>

      <div className="p-4 rounded-xl bg-graphite/40 border border-gold/25 space-y-4">
        {/* Images comparison & plus sign */}
        <div className="flex items-center justify-around gap-2">
          <div className="flex flex-col items-center">
            <img
              src={resolveImg(currentProduct.image_url)}
              alt={currentProduct.name}
              className="w-20 h-24 object-cover rounded-lg border border-cream/20 bg-obsidian"
            />
            <span className="text-[10px] text-cream/70 mt-1 truncate max-w-[90px]">
              This Item
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-gold/10 text-gold grid place-items-center border border-gold/30 shrink-0">
            <Plus size={16} />
          </div>

          <div className="flex flex-col items-center">
            <img
              src={resolveImg(companion.image_url)}
              alt={companion.name}
              className="w-20 h-24 object-cover rounded-lg border border-cream/20 bg-obsidian"
            />
            <span className="text-[10px] text-gold font-medium mt-1 truncate max-w-[90px]">
              Companion Scent
            </span>
          </div>
        </div>

        {/* Checkbox item selections */}
        <div className="space-y-2 pt-2 border-t border-cream/10 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer text-cream/80">
            <input type="checkbox" checked disabled className="accent-gold rounded" />
            <span className="flex-1 truncate font-serif text-sm text-cream">
              {currentProduct.name}
            </span>
            <span className="text-gold font-semibold">
              {formatINR(currentProduct.price_inr)}
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-cream/80">
            <input
              type="checkbox"
              checked={includeBundle}
              onChange={(e) => setIncludeBundle(e.target.checked)}
              className="accent-gold rounded h-4 w-4"
            />
            <span className="flex-1 truncate font-serif text-sm text-cream">
              {companion.name}
            </span>
            <span className="text-gold font-semibold">
              {formatINR(companion.price_inr)}
            </span>
          </label>
        </div>

        {/* Total calculation and add bundle CTA */}
        <div className="pt-3 border-t border-cream/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-cream/50">Bundle Total</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl font-bold text-gold">
                {formatINR(finalBundlePrice)}
              </span>
              {discountAmount > 0 && (
                <span className="line-through text-xs text-cream/40">
                  {formatINR(totalPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddBundle}
            disabled={adding}
            className="flex items-center gap-2 bg-gold text-obsidian px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-cream active:scale-[0.97] transition-all"
          >
            <ShoppingBag size={15} />
            <span>{adding ? "Adding..." : "Add Both"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
