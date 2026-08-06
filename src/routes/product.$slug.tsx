import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ProductReviews } from "@/components/product-reviews";
import { RelatedProducts } from "@/components/related-products";
import { formatINR, resolveImg } from "@/lib/format";
import { useCart, useWishlist } from "@/context/app-context";
import { useCompare } from "@/lib/use-compare";
import { GitCompareArrows, Heart, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { useState } from "react";

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
    const desc = p?.seo_description || p?.subtitle || (p?.description ? String(p.description).slice(0, 155) : `Shop ${name} from Mystique Blends — hand-crafted luxury fragrance from Kannauj.`);
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
  errorComponent: () => <div className="min-h-screen bg-obsidian text-cream grid place-items-center">Unable to load product.</div>,
  notFoundComponent: () => <div className="min-h-screen bg-obsidian text-cream grid place-items-center">Product not found.</div>,
});

function titleCase(slug: string) {
  return slug.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join(" ");
}

function ProductPage() {
  const { slug } = Route.useParams();
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { ids, toggle } = useWishlist();
  const { ids: compareIds, toggle: toggleCompare } = useCompare();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen bg-obsidian text-cream flex items-center justify-center">Loading…</div>;
  if (!product) throw notFound();


  const wished = ids.has(product.id);
  const inCompare = compareIds.includes(product.id);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.subtitle ?? "",
    image: resolveImg(product.image_url),
    sku: product.sku ?? product.slug,
    brand: { "@type": "Brand", name: "Mystique Blends" },
    aggregateRating: product.review_count
      ? { "@type": "AggregateRating", ratingValue: product.rating ?? 5, reviewCount: product.review_count }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price_inr,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const breadcrumbLd = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${origin}/shop` },
      { "@type": "ListItem", position: 3, name: product.name, item: `${origin}/product/${product.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <nav className="text-xs uppercase tracking-[0.2em] text-cream/40 mb-8">
          <Link to="/">Home</Link> <span className="mx-2">/</span>
          <Link to="/shop">Shop</Link> <span className="mx-2">/</span>
          <span className="text-cream/70">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="relative bg-graphite">
            <img
              src={resolveImg(product.image_url)}
              alt={product.name}
              className="w-full aspect-[3/4] object-cover"
            />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-gold">{product.fragrance_family}</p>
            <h1 className="mt-3 font-serif text-4xl md:text-6xl leading-tight">{product.name}</h1>
            <p className="mt-3 text-cream/60">{product.subtitle}</p>

            <div className="mt-4 flex items-center gap-3 text-sm text-cream/70">
              <div className="flex items-center gap-1 text-gold">
                <Star size={14} fill="currentColor" />
                <span>{product.rating}</span>
              </div>
              <span>· {product.review_count} reviews</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-serif text-3xl text-gold">{formatINR(product.price_inr)}</span>
              {product.compare_at_price_inr && (
                <span className="line-through text-cream/40">{formatINR(product.compare_at_price_inr)}</span>
              )}
            </div>

            <p className="mt-8 text-cream/70 leading-relaxed">{product.description}</p>

            {product.notes_top?.length ? (
              <div className="mt-8 grid grid-cols-3 gap-6">
                <NoteBlock title="Top" notes={product.notes_top} />
                <NoteBlock title="Heart" notes={product.notes_heart} />
                <NoteBlock title="Base" notes={product.notes_base} />
              </div>
            ) : null}

            <div className="mt-10 flex items-center gap-4">
              <div className="flex items-center border border-cream/20">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 grid place-items-center hover:text-gold"><Minus size={14} /></button>
                <span className="w-12 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-11 h-11 grid place-items-center hover:text-gold"><Plus size={14} /></button>
              </div>
              <button
                onClick={() => addToCart(product.id, qty)}
                disabled={product.stock <= 0}
                className="flex-1 bg-gold text-obsidian py-4 text-[11px] uppercase tracking-[0.28em] font-semibold hover:bg-cream disabled:opacity-40"
              >
                {product.stock > 0 ? "Add to Cart" : "Sold Out"}
              </button>
              <button
                onClick={() => toggle(product.id)}
                aria-label="Wishlist"
                className={`h-14 w-14 grid place-items-center border ${wished ? "bg-gold border-gold text-obsidian" : "border-cream/20 hover:border-gold hover:text-gold"}`}
              >
                <Heart size={16} fill={wished ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => toggleCompare(product.id)}
                aria-label="Compare"
                title={inCompare ? "Remove from compare" : "Add to compare"}
                className={`h-14 w-14 grid place-items-center border ${inCompare ? "bg-gold border-gold text-obsidian" : "border-cream/20 hover:border-gold hover:text-gold"}`}
              >
                <GitCompareArrows size={16} />
              </button>
            </div>

            {compareIds.length > 0 && (
              <Link to="/compare" className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold hover:text-cream">
                <GitCompareArrows size={12} /> View compare tray · {compareIds.length}
              </Link>
            )}

            <div className="mt-10 pt-8 border-t border-cream/10 space-y-3 text-sm text-cream/70">
              <div className="flex items-center gap-3"><Truck size={16} className="text-gold" /> Free express shipping across India</div>
              <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-gold" /> IFRA-compliant, dermatologist reviewed</div>
              <div className="flex items-center gap-3"><Star size={16} className="text-gold" /> 30-day return on unopened bottles</div>
            </div>
          </div>
        </div>

        <ProductReviews productId={product.id} />
        <RelatedProducts productId={product.id} collectionId={product.collection_id ?? null} family={product.fragrance_family ?? null} />
      </main>
      <SiteFooter />
    </div>
  );
}

function NoteBlock({ title, notes }: { title: string; notes: string[] | null }) {
  if (!notes?.length) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-gold mb-2">{title}</p>
      <ul className="text-sm text-cream/80 space-y-1">
        {notes.map((n) => <li key={n}>{n}</li>)}
      </ul>
    </div>
  );
}
