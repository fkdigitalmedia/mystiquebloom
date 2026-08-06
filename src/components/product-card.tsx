import { Link } from "@tanstack/react-router";
import { Heart, Star, GitCompareArrows } from "lucide-react";
import { formatINR, resolveImg } from "@/lib/format";
import { useCart, useWishlist } from "@/context/app-context";
import { useCompare } from "@/lib/use-compare";

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  fragrance_family: string | null;
  price_inr: number;
  compare_at_price_inr: number | null;
  image_url: string | null;
  rating: number | null;
  review_count: number | null;
  is_bestseller?: boolean;
  is_new?: boolean;
};

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { ids, toggle } = useWishlist();
  const { ids: compareIds, toggle: toggleCompare } = useCompare();
  const wished = ids.has(product.id);
  const inCompare = compareIds.includes(product.id);

  return (
    <div className="group relative">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block relative overflow-hidden bg-graphite">
        <img
          src={resolveImg(product.image_url)}
          alt={product.name}
          loading="lazy"
          className="w-full aspect-[3/4] object-cover transition-transform duration-[900ms] group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.is_new && (
            <span className="bg-gold text-obsidian text-[9px] uppercase tracking-[0.25em] px-2 py-1">New</span>
          )}
          {product.is_bestseller && (
            <span className="bg-cream text-obsidian text-[9px] uppercase tracking-[0.25em] px-2 py-1">Bestseller</span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            aria-label="Wishlist"
            className={`h-9 w-9 grid place-items-center border ${wished ? "bg-gold text-obsidian border-gold" : "border-cream/30 text-cream bg-obsidian/40 hover:bg-obsidian/80"}`}
          >
            <Heart size={14} fill={wished ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(product.id);
            }}
            aria-label="Compare"
            title={inCompare ? "Remove from compare" : "Add to compare"}
            className={`h-9 w-9 grid place-items-center border ${inCompare ? "bg-gold text-obsidian border-gold" : "border-cream/30 text-cream bg-obsidian/40 hover:bg-obsidian/80"}`}
          >
            <GitCompareArrows size={14} />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product.id);
            }}
            className="w-full bg-gold text-obsidian py-3 text-[10px] uppercase tracking-[0.28em] font-semibold hover:bg-cream"
          >
            Quick Add
          </button>
        </div>
      </Link>
      <div className="mt-4 space-y-1">
        <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{product.fragrance_family}</p>
        <Link to="/product/$slug" params={{ slug: product.slug }} className="font-serif text-lg text-cream block">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 text-xs text-cream/60">
          <div className="flex items-center gap-0.5 text-gold">
            <Star size={11} fill="currentColor" />
            <span>{product.rating}</span>
          </div>
          <span>· {product.review_count} reviews</span>
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-cream">{formatINR(product.price_inr)}</span>
          {product.compare_at_price_inr && (
            <span className="text-cream/40 line-through text-sm">{formatINR(product.compare_at_price_inr)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
