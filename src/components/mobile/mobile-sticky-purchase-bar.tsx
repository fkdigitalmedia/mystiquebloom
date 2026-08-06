import { useState } from "react";
import { formatINR } from "@/lib/format";
import { useCart } from "@/context/app-context";
import { Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";

interface MobileStickyPurchaseBarProps {
  product: {
    id: string;
    name: string;
    price_inr: number;
    compare_at_price_inr?: number | null;
    stock: number;
  };
  selectedSize?: string;
}

export function MobileStickyPurchaseBar({
  product,
  selectedSize,
}: MobileStickyPurchaseBarProps) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const isOutOfStock = product.stock <= 0;
  const discountPct =
    product.compare_at_price_inr && product.compare_at_price_inr > product.price_inr
      ? Math.round(
          ((product.compare_at_price_inr - product.price_inr) /
            product.compare_at_price_inr) *
            100,
        )
      : 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setAdding(true);
    try {
      await addToCart(product.id, qty);
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      navigate({ to: "/checkout" });
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-obsidian/95 backdrop-blur-2xl border-t border-cream/15 px-4 pt-3 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      {/* Top summary row: Size selection indicator & Qty selector */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg font-bold text-gold">
            {formatINR(product.price_inr * qty)}
          </span>
          {discountPct > 0 && (
            <span className="text-[10px] uppercase font-bold text-gold bg-gold/15 px-1.5 py-0.5 rounded border border-gold/30">
              {discountPct}% OFF
            </span>
          )}
          {selectedSize && (
            <span className="text-xs text-cream/60">· {selectedSize}</span>
          )}
        </div>

        {/* Touch friendly Quantity Adjuster */}
        <div className="flex items-center border border-cream/20 rounded-full bg-graphite/60 overflow-hidden">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-8 h-8 grid place-items-center text-cream/70 hover:text-gold active:bg-gold/10"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-7 text-center text-xs font-semibold text-cream">
            {qty}
          </span>
          <button
            onClick={() => setQty(qty + 1)}
            className="w-8 h-8 grid place-items-center text-cream/70 hover:text-gold active:bg-gold/10"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Action Buttons: Add To Cart & Buy Now */}
      <div className="flex gap-2.5">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          className="flex-1 py-3.5 rounded-xl border border-gold text-gold font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-gold hover:text-obsidian disabled:opacity-40 transition-colors shadow-md"
        >
          <ShoppingBag size={16} />
          <span>{adding ? "Adding..." : "Add to Cart"}</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleBuyNow}
          disabled={isOutOfStock || adding}
          className="flex-1 py-3.5 rounded-xl bg-gold text-obsidian font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-cream disabled:opacity-40 transition-colors shadow-xl"
        >
          <Zap size={16} fill="currentColor" />
          <span>{isOutOfStock ? "Sold Out" : "Buy Now"}</span>
        </motion.button>
      </div>
    </div>
  );
}
