import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ProductReviews } from "@/components/product-reviews";
import { RelatedProducts } from "@/components/related-products";
import { formatINR, resolveImg } from "@/lib/format";
import { useCart, useWishlist } from "@/context/app-context";
import { useCompare } from "@/lib/use-compare";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import {
  GitCompareArrows,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
  RotateCcw,
  Award,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { MobileProductGallery } from "@/components/mobile/mobile-product-gallery";
import { MobileProductNotes } from "@/components/mobile/mobile-product-notes";
import { MobileProductWhyLove } from "@/components/mobile/mobile-product-why-love";
import { MobileFrequentlyBought } from "@/components/mobile/mobile-frequently-bought";
import { MobileStickyPurchaseBar } from "@/components/mobile/mobile-sticky-purchase-bar";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("products")
      .select("name, subtitle, description, seo_title, seo_description, og_image_url, image_url, slug")
      .eq("slug", params.slug)
      .eq("is_published", true)
      .maybeSingle();
    return { product: data };
  },
  head: ({ loaderData, params }) => {
    const p: any = loaderData?.product;
    const name = p?.name ?? titleCase(params.slug);
    const title = p?.seo_title || `${name} · Mystique Blends`;
    const desc =
      p?.seo_description ||
      p?.subtitle ||
      (p?.description
        ? String(p.description).slice(0, 155)
        : `Shop ${name} from Mystique Blends — hand-crafted luxury fragrance from Kannauj.`);
    const og = p?.og_image_url && /^https?:\/\//i.test(p.og_image_url) ? p.og_image_url : null;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:type", content: "product" },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { name: "twitter:card", content: og ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
    ];
    if (og) {
      meta.push({ property: "og:image", content: og });
      meta.push({ name: "twitter:image", content: og });
    }
    return { meta };
  },
  component: ProductPage,
  errorComponent: () => (
    <div className="min-h-screen bg-obsidian text-cream grid place-items-center">
      Unable to load fragrance details.
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-obsidian text-cream grid place-items-center">
      Fragrance not found.
    </div>
  ),
});

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

const BOTTLE_SIZES = [
  { id: "30ml", label: "30ml Spray", priceMultiplier: 0.7 },
  { id: "50ml", label: "50ml Spray", priceMultiplier: 1.0 },
  { id: "100ml", label: "100ml Spray", priceMultiplier: 1.6 },
  { id: "attar-12ml", label: "Attar (12ml)", priceMultiplier: 0.85 },
  { id: "gift-box", label: "Gift Box", priceMultiplier: 2.1 },
];

function ProductPage() {
  const { slug } = Route.useParams();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("50ml");
  const [descExpanded, setDescExpanded] = useState(false);

  const { addToCart } = useCart();
  const { ids: wishIds, toggle: toggleWish } = useWishlist();
  const { ids: compareIds, toggle: toggleCompare } = useCompare();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Track recently viewed products
  const { recentProducts } = useRecentlyViewed(product?.slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian text-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-widest text-gold font-serif">
            Distilling fragrance details...
          </span>
        </div>
      </div>
    );
  }

  if (!product) throw notFound();

  const wished = wishIds.has(product.id);
  const inCompare = compareIds.includes(product.id);

  // Variant size calculation logic
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

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.subtitle ?? "",
    image: resolveImg(product.image_url),
    sku: product.sku ?? product.slug,
    brand: { "@type": "Brand", name: "Mystique Blends" },
    aggregateRating: product.review_count
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating ?? 5,
          reviewCount: product.review_count,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: calculatedPrice,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const breadcrumbLd = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${origin}/shop` },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${origin}/product/${product.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans pb-safe-nav md:pb-0">
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Main product container */}
      <main className="mx-auto max-w-7xl px-0 md:px-6 py-0 md:py-12">
        {/* Desktop Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden md:block text-xs uppercase tracking-[0.2em] text-cream/40 mb-8 px-6">
          <Link to="/">Home</Link> <span className="mx-2">/</span>
          <Link to="/shop">Shop</Link> <span className="mx-2">/</span>
          <span className="text-cream/70">{product.name}</span>
        </nav>

        {/* Product Details Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Mobile Touch Gallery & Lightbox */}
          <div className="w-full">
            <MobileProductGallery
              product={product}
              isWished={wished}
              onToggleWishlist={() => toggleWish(product.id)}
            />
          </div>

          {/* Right: Product Details & Options */}
          <div className="px-5 md:px-0 space-y-6">
            {/* Fragrance Family & Name */}
            <div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-gold font-bold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/30 inline-block mb-2">
                {product.fragrance_family || "Luxury Collection"}
              </span>
              <h1 className="font-serif text-3xl md:text-5xl leading-tight text-cream">
                {product.name}
              </h1>
              <p className="mt-2 text-cream/60 text-sm md:text-base">{product.subtitle}</p>

              {/* Rating & Stock Status */}
              <div className="mt-3 flex items-center gap-3 text-xs text-cream/70">
                <div className="flex items-center gap-1.5 bg-graphite/60 border border-gold/30 px-2.5 py-1 rounded-full text-gold">
                  <Star size={13} fill="currentColor" />
                  <span className="font-bold">{product.rating || 4.9}</span>
                  <span className="text-cream/40 text-[10px]">
                    ({product.review_count || 38} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-medium">
                    {product.stock > 5
                      ? "In Stock"
                      : product.stock > 0
                        ? `Only ${product.stock} left!`
                        : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>

            {/* Price & Discount display */}
            <div className="p-4 rounded-xl bg-graphite/40 border border-cream/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-cream/50 block">
                  Price ({currentSizeObj.label})
                </span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="font-serif text-3xl text-gold font-bold">
                    {formatINR(calculatedPrice)}
                  </span>
                  {calculatedComparePrice && (
                    <span className="line-through text-cream/40 text-sm font-sans">
                      {formatINR(calculatedComparePrice)}
                    </span>
                  )}
                </div>
              </div>

              {discountPercent > 0 && (
                <span className="bg-gold text-obsidian px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Delivery Badge */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gold/5 border border-gold/20 text-xs text-cream/80">
              <Truck size={18} className="text-gold shrink-0" />
              <div>
                <span className="font-semibold text-gold">Free Express Shipping</span>
                <p className="text-cream/50 text-[11px]">
                  Delivered in 2-3 business days across India
                </p>
              </div>
            </div>

            {/* Variant Selector - Bottle Sizes */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                  Select Size / Variant
                </span>
                <span className="text-[10px] text-cream/50">Touch chip to swap</span>
              </div>
              <div className="flex flex-wrap gap-2">
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

            {/* Fragrance Accord Notes Cards */}
            <MobileProductNotes
              topNotes={product.notes_top}
              heartNotes={product.notes_heart}
              baseNotes={product.notes_base}
            />

            {/* Why You'll Love It */}
            <MobileProductWhyLove />

            {/* Expandable Product Description */}
            <div className="py-4 border-t border-cream/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-2xl text-cream tracking-wide">
                  Description & Story
                </h3>
              </div>
              <div
                className={`text-cream/80 text-sm leading-relaxed space-y-3 transition-all ${
                  !descExpanded ? "line-clamp-3" : ""
                }`}
              >
                <p>{product.description || product.subtitle}</p>
                <p>
                  Hand-distilled in traditional deg-bhapka copper stills in Kannauj using 100%
                  natural hydro-distillation. Blended with organic jojoba and sandalwood base for
                  luxurious skin feel and projection.
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

            {/* Desktop Quick Quantity & Cart Button */}
            <div className="hidden md:flex items-center gap-4 pt-4 border-t border-cream/10">
              <div className="flex items-center border border-cream/20 rounded-lg">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-11 h-11 grid place-items-center hover:text-gold"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-11 h-11 grid place-items-center hover:text-gold"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={() => addToCart(product.id, qty)}
                disabled={product.stock <= 0}
                className="flex-1 bg-gold text-obsidian py-4 rounded-xl text-xs uppercase tracking-[0.28em] font-bold hover:bg-cream disabled:opacity-40 transition-colors shadow-xl"
              >
                {product.stock > 0 ? "Add to Cart" : "Sold Out"}
              </button>

              <button
                onClick={() => toggleWish(product.id)}
                aria-label="Wishlist"
                className={`h-14 w-14 rounded-xl grid place-items-center border ${
                  wished
                    ? "bg-gold border-gold text-obsidian"
                    : "border-cream/20 hover:border-gold hover:text-gold"
                }`}
              >
                <Heart size={18} fill={wished ? "currentColor" : "none"} />
              </button>

              <button
                onClick={() => toggleCompare(product.id)}
                aria-label="Compare"
                title={inCompare ? "Remove from compare" : "Add to compare"}
                className={`h-14 w-14 rounded-xl grid place-items-center border ${
                  inCompare
                    ? "bg-gold border-gold text-obsidian"
                    : "border-cream/20 hover:border-gold hover:text-gold"
                }`}
              >
                <GitCompareArrows size={18} />
              </button>
            </div>

            {/* Frequently Bought Together Bundle */}
            <MobileFrequentlyBought currentProduct={activeProductState} />

            {/* Luxury Trust Badges */}
            <div className="py-6 border-t border-cream/10">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold block mb-3">
                Mystique Promise
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2.5 text-xs text-cream/80 bg-graphite/30 p-2.5 rounded-lg border border-cream/10">
                  <Lock size={16} className="text-gold shrink-0" />
                  <span>256-Bit Secure Payment</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-cream/80 bg-graphite/30 p-2.5 rounded-lg border border-cream/10">
                  <RotateCcw size={16} className="text-gold shrink-0" />
                  <span>30-Day Easy Returns</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-cream/80 bg-graphite/30 p-2.5 rounded-lg border border-cream/10">
                  <Truck size={16} className="text-gold shrink-0" />
                  <span>Express Dispatch in 24h</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-cream/80 bg-graphite/30 p-2.5 rounded-lg border border-cream/10">
                  <Award size={16} className="text-gold shrink-0" />
                  <span>100% Authentic Product</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="px-5 md:px-0 mt-8">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Fragrances Horizontal Scroll */}
        <div className="px-5 md:px-0 mt-12">
          <RelatedProducts
            productId={product.id}
            collectionId={product.collection_id ?? null}
            family={product.fragrance_family ?? null}
          />
        </div>

        {/* Recently Viewed Horizontal Scroll */}
        {recentProducts.length > 0 && (
          <div className="px-5 md:px-0 mt-12 py-8 border-t border-cream/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-gold" />
                <h3 className="font-serif text-2xl text-cream tracking-wide">Recently Viewed</h3>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                Archive History
              </span>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5 md:mx-0 md:px-0">
              {recentProducts.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$slug"
                  params={{ slug: p.slug }}
                  className="flex-[0_0_160px] md:flex-[0_0_200px] bg-graphite/40 border border-cream/10 rounded-xl p-3 hover:border-gold/50 transition-all group"
                >
                  <img
                    src={resolveImg(p.image_url)}
                    alt={p.name}
                    className="w-full aspect-[3/4] object-cover rounded-lg bg-obsidian mb-2.5 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[9px] uppercase tracking-wider text-gold block truncate">
                    {p.fragrance_family}
                  </span>
                  <p className="font-serif text-sm text-cream truncate group-hover:text-gold">
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
      </main>

      {/* Mobile Sticky Bottom Purchase Bar */}
      <MobileStickyPurchaseBar product={activeProductState} selectedSize={currentSizeObj.label} />

      <SiteFooter />
    </div>
  );
}
