import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { formatINR, resolveImg } from "@/lib/format";
import { useCart, useWishlist } from "@/context/app-context";
import { useCompare } from "@/lib/use-compare";
import { MobileProductGallery } from "@/components/mobile/mobile-product-gallery";
import { MobileProductNotes } from "@/components/mobile/mobile-product-notes";
import { MobileProductWhyLove } from "@/components/mobile/mobile-product-why-love";
import { MobileProductUsage } from "@/components/mobile/mobile-product-usage";
import { MobileProductFaq } from "@/components/mobile/mobile-product-faq";
import { MobileFrequentlyBought } from "@/components/mobile/mobile-frequently-bought";
import { MobileStickyPurchaseBar } from "@/components/mobile/mobile-sticky-purchase-bar";
import { ProductReviews } from "@/components/product-reviews";
import { RelatedProducts } from "@/components/related-products";
import logoImg from "@/assets/logo.png";
import {
  ArrowLeft,
  Search,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  Award,
  RotateCcw,
  Lock,
  Headphones,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Minus,
  Plus,
  Zap,
} from "lucide-react";

interface MobileProductPageProps {
  product: any;
  recentProducts: any[];
}

const BOTTLE_SIZES = [
  { id: "30ml", label: "30ml Spray", priceMultiplier: 0.7 },
  { id: "50ml", label: "50ml Spray", priceMultiplier: 1.0 },
  { id: "100ml", label: "100ml Spray", priceMultiplier: 1.6 },
  { id: "attar-12ml", label: "Attar (12ml)", priceMultiplier: 0.85 },
  { id: "gift-box", label: "Gift Box", priceMultiplier: 2.1 },
];

export function MobileProductPage({ product, recentProducts }: MobileProductPageProps) {
  const navigate = useNavigate();
  const { count, setCartOpen, addToCart } = useCart();
  const { ids: wishIds, toggle: toggleWish } = useWishlist();
  const wished = wishIds.has(product.id);

  const [selectedSize, setSelectedSize] = useState("50ml");
  const [qty, setQty] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);

  const currentSizeObj = BOTTLE_SIZES.find((s) => s.id === selectedSize) || BOTTLE_SIZES[1];
  const calculatedPrice = Math.round(product.price_inr * currentSizeObj.priceMultiplier);
  const calculatedComparePrice = product.compare_at_price_inr
    ? Math.round(product.compare_at_price_inr * currentSizeObj.priceMultiplier)
    : null;

  const discountPercent = calculatedComparePrice
    ? Math.round(((calculatedComparePrice - calculatedPrice) / calculatedComparePrice) * 100)
    : 0;

  const activeProductState = {
    ...product,
    price_inr: calculatedPrice,
    compare_at_price_inr: calculatedComparePrice,
  };

  const advancePaymentAmount = Math.round(calculatedPrice * 0.1);
  const remainingCodAmount = calculatedPrice - advancePaymentAmount;

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans pb-safe-nav w-full max-w-full overflow-x-hidden">
      {/* 1. STICKY MOBILE HEADER */}
      <header className="sticky top-0 z-40 bg-obsidian/95 backdrop-blur-xl border-b border-cream/10 flex items-center justify-between px-3.5 h-14 w-full max-w-full">
        <button
          onClick={() => navigate({ to: "/shop" })}
          className="text-cream hover:text-gold touch-target p-2"
          aria-label="Go Back"
        >
          <ArrowLeft size={20} />
        </button>

        <Link to="/" className="flex items-center leading-none" aria-label="Home">
          <img
            src={logoImg}
            alt="Mystique Blends"
            className="h-8 w-auto object-contain"
            style={{ filter: "invert(1) brightness(1.05)" }}
          />
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/search" aria-label="Search" className="text-cream/70 hover:text-gold p-2">
            <Search size={18} />
          </Link>

          <Link to="/wishlist" aria-label="Wishlist" className="relative text-cream/70 hover:text-gold p-2">
            <Heart size={18} fill={wished ? "currentColor" : "none"} className={wished ? "text-gold" : ""} />
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
            className="relative text-cream/70 hover:text-gold p-2"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 bg-gold text-obsidian text-[9px] font-bold grid place-items-center rounded-full leading-none">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 2 & 3. FULL WIDTH PRODUCT GALLERY & FLOATING OVERLAYS */}
      <div className="w-full">
        <MobileProductGallery
          product={product}
          isWished={wished}
          onToggleWishlist={() => toggleWish(product.id)}
        />
      </div>

      {/* MOBILE PAGE BODY CONTENT */}
      <div className="px-4 space-y-6 pt-4">
        {/* 4. PRODUCT INFORMATION & BADGES */}
        <div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-bold bg-gold/15 px-2 py-0.5 rounded-full border border-gold/30">
              {product.fragrance_family || "Luxury Collection"}
            </span>
            {product.is_bestseller && (
              <span className="text-[9px] uppercase tracking-wider text-obsidian font-bold bg-gold px-2 py-0.5 rounded-full">
                Bestseller
              </span>
            )}
            <span className="text-[9px] uppercase tracking-wider text-cream/80 bg-graphite border border-cream/20 px-2 py-0.5 rounded-full">
              100% Authentic
            </span>
          </div>

          <h1 className="font-serif text-3xl leading-tight text-cream">{product.name}</h1>
          <p className="mt-1 text-cream/60 text-xs leading-relaxed">{product.subtitle}</p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-graphite/60 border border-gold/30 px-2.5 py-1 rounded-full text-gold text-xs">
              <Star size={13} fill="currentColor" />
              <span className="font-bold">{product.rating || 4.9}</span>
              <span className="text-cream/40 text-[10px]">
                ({product.review_count || 38} reviews)
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 font-medium text-[11px]">
                {product.stock > 5
                  ? "In Stock & Ready to Ship"
                  : product.stock > 0
                    ? `Only ${product.stock} bottles left!`
                    : "Sold Out"}
              </span>
            </div>
          </div>
        </div>

        {/* 5. PRICING CARD & PARTIAL PAYMENT COD OPTION */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-graphite/60 via-graphite/40 to-obsidian border border-gold/30 shadow-xl space-y-3.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-cream/50 block">
                Offer Price ({currentSizeObj.label})
              </span>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="font-serif text-3xl text-gold font-bold">
                  {formatINR(calculatedPrice)}
                </span>
                {calculatedComparePrice && (
                  <span className="line-through text-cream/40 text-xs">
                    {formatINR(calculatedComparePrice)}
                  </span>
                )}
              </div>
            </div>

            {discountPercent > 0 && (
              <span className="bg-gold text-obsidian px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Partial Payment 10% Advance COD Banner */}
          <div className="p-3 rounded-xl bg-gold/10 border border-gold/30 text-xs text-cream/90 space-y-1">
            <div className="flex items-center justify-between font-semibold text-gold">
              <span className="flex items-center gap-1.5">
                <Zap size={14} fill="currentColor" /> Partial COD Payment Option
              </span>
              <span>10% Advance</span>
            </div>
            <p className="text-[11px] text-cream/70 leading-normal">
              Pay <strong className="text-gold">{formatINR(advancePaymentAmount)}</strong> now to reserve, rest <strong className="text-gold">{formatINR(remainingCodAmount)}</strong> on delivery.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-cream/70 border-t border-cream/10 pt-2.5">
            <span className="flex items-center gap-1">
              <Truck size={13} className="text-gold" /> ETA: 2-3 Business Days
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-gold" /> Free COD Available
            </span>
          </div>
        </div>

        {/* 6. VARIANT SELECTION (BOTTLE SIZE CHIPS) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
              Select Bottle Size
            </span>
            <span className="text-[10px] text-cream/50">Tap chip to select</span>
          </div>
          <div className="flex flex-wrap gap-2 w-full max-w-full">
            {BOTTLE_SIZES.map((size) => {
              const isSelected = size.id === selectedSize;
              return (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? "bg-gold text-obsidian border-gold font-bold shadow-md scale-[1.02]"
                      : "bg-graphite/40 border-cream/15 text-cream hover:border-gold/50"
                  }`}
                >
                  {size.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. QUANTITY SELECTOR */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-graphite/40 border border-cream/10">
          <span className="text-xs uppercase tracking-wider text-cream/70 font-medium">Quantity</span>
          <div className="flex items-center border border-cream/20 rounded-full bg-obsidian overflow-hidden">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-10 grid place-items-center text-cream/80 hover:text-gold active:bg-gold/10"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-xs font-bold text-cream">
              {qty}
            </span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-10 h-10 grid place-items-center text-cream/80 hover:text-gold active:bg-gold/10"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* 8. WHY YOU'LL LOVE IT */}
        <MobileProductWhyLove />

        {/* 9. FRAGRANCE PYRAMID */}
        <MobileProductNotes
          topNotes={product.notes_top}
          heartNotes={product.notes_heart}
          baseNotes={product.notes_base}
        />

        {/* 10. DESCRIPTION (EXPANDABLE) */}
        <div className="py-4 border-t border-cream/10">
          <h3 className="font-serif text-2xl text-cream tracking-wide mb-2">Description & Story</h3>
          <div
            className={`text-cream/80 text-xs leading-relaxed space-y-2.5 transition-all ${
              !descExpanded ? "line-clamp-3" : ""
            }`}
          >
            <p>{product.description || product.subtitle}</p>
            <p>
              Hand-distilled in traditional deg-bhapka copper stills in Kannauj using 100% natural hydro-distillation. Blended with organic jojoba and sandalwood base for luxurious skin feel and projection.
            </p>
          </div>
          <button
            onClick={() => setDescExpanded(!descExpanded)}
            className="mt-2 text-xs font-semibold uppercase tracking-wider text-gold hover:text-cream flex items-center gap-1"
          >
            <span>{descExpanded ? "Read Less" : "Read More"}</span>
            {descExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* 11. USAGE INSTRUCTIONS */}
        <MobileProductUsage />

        {/* 12. CUSTOMER REVIEWS */}
        <div className="py-4 border-t border-cream/10">
          <ProductReviews productId={product.id} />
        </div>

        {/* 13. RELATED PRODUCTS */}
        <div className="py-4 border-t border-cream/10">
          <RelatedProducts
            productId={product.id}
            collectionId={product.collection_id ?? null}
            family={product.fragrance_family ?? null}
          />
        </div>

        {/* 14. FREQUENTLY BOUGHT TOGETHER */}
        <MobileFrequentlyBought currentProduct={activeProductState} />

        {/* 15. RECENTLY VIEWED */}
        {recentProducts.length > 0 && (
          <div className="py-6 border-t border-cream/10 w-full max-w-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-gold" />
                <h3 className="font-serif text-2xl text-cream tracking-wide">Recently Viewed</h3>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 w-full max-w-full">
              {recentProducts.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="flex-[0_0_150px] bg-graphite/40 border border-cream/10 rounded-xl p-3 hover:border-gold/50 transition-all group"
                >
                  <img
                    src={resolveImg(p.image_url)}
                    alt={p.name}
                    className="w-full aspect-[3/4] object-cover rounded-lg bg-obsidian mb-2 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[9px] uppercase tracking-wider text-gold block truncate">
                    {p.fragrance_family}
                  </span>
                  <p className="font-serif text-xs text-cream truncate group-hover:text-gold">
                    {p.name}
                  </p>
                  <p className="text-xs font-serif text-gold font-semibold mt-1">
                    {formatINR(p.price_inr)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 16. TRUST & GUARANTEE SECTION */}
        <div className="py-6 border-t border-cream/10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-3">
            Mystique Guarantee
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2 text-xs text-cream/80 bg-graphite/30 p-2.5 rounded-lg border border-cream/10">
              <Award size={16} className="text-gold shrink-0" />
              <span>100% Authentic Product</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-cream/80 bg-graphite/30 p-2.5 rounded-lg border border-cream/10">
              <RotateCcw size={16} className="text-gold shrink-0" />
              <span>30-Day Easy Returns</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-cream/80 bg-graphite/30 p-2.5 rounded-lg border border-cream/10">
              <Truck size={16} className="text-gold shrink-0" />
              <span>Express 24h Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-cream/80 bg-graphite/30 p-2.5 rounded-lg border border-cream/10">
              <Lock size={16} className="text-gold shrink-0" />
              <span>256-Bit Secure Payment</span>
            </div>
            <div className="col-span-2 flex items-center gap-2 text-xs text-cream/80 bg-graphite/30 p-2.5 rounded-lg border border-cream/10 justify-center">
              <Headphones size={16} className="text-gold shrink-0" />
              <span>24/7 Dedicated Concierge Support</span>
            </div>
          </div>
        </div>

        {/* 17. FAQ ACCORDION */}
        <MobileProductFaq />
      </div>

      {/* 18. STICKY BOTTOM PURCHASE BAR */}
      <MobileStickyPurchaseBar product={activeProductState} selectedSize={currentSizeObj.label} />
    </div>
  );
}
