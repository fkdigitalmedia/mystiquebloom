import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { formatINR, resolveImg } from "@/lib/format";
import { useCompare } from "@/lib/use-compare";
import { useCart } from "@/context/app-context";
import { X, Star } from "lucide-react";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Fragrances · Mystique Blends" },
      { name: "description", content: "Compare Mystique Blends fragrances side by side — notes, family, longevity and price." },
      { property: "og:title", content: "Compare · Mystique Blends" },
      { property: "og:description", content: "Choose your signature scent — a side-by-side olfactory comparison." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { addToCart } = useCart();

  const { data: products } = useQuery({
    queryKey: ["compare", ids.join(",")],
    queryFn: async () => {
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", ids)
        .eq("is_published", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main>
        <section className="border-b border-cream/5">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20 text-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Side by Side</span>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl">Compare</h1>
            <p className="mt-5 text-cream/60 max-w-xl mx-auto">
              Weigh notes, family and character across up to four fragrances.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          {!ids.length ? (
            <div className="text-center py-24">
              <p className="text-cream/50 font-serif italic text-lg">Your comparison tray is empty.</p>
              <Link to="/shop" className="inline-block mt-6 border border-gold text-gold px-6 py-3 text-[10px] uppercase tracking-[0.28em] hover:bg-gold hover:text-obsidian">
                Browse Fragrances
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-xs uppercase tracking-[0.2em] text-cream/60">
                  {products?.length ?? 0} fragrances
                </p>
                <button onClick={clear} className="text-[10px] uppercase tracking-[0.25em] text-cream/60 hover:text-gold">
                  Clear all
                </button>
              </div>

              <div className="overflow-x-auto">
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${products?.length || 1}, minmax(240px, 1fr))` }}>
                  {products?.map((p) => (
                    <div key={p.id} className="border border-cream/10 relative">
                      <button
                        onClick={() => remove(p.id)}
                        aria-label="Remove"
                        className="absolute top-3 right-3 z-10 h-8 w-8 grid place-items-center bg-obsidian/70 border border-cream/20 text-cream hover:text-gold"
                      >
                        <X size={14} />
                      </button>
                      <Link to="/product/$slug" params={{ slug: p.slug }}>
                        <img src={resolveImg(p.image_url)} alt={p.name} className="w-full aspect-[3/4] object-cover" />
                      </Link>
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{p.fragrance_family}</p>
                          <Link to="/product/$slug" params={{ slug: p.slug }} className="font-serif text-xl block mt-1">{p.name}</Link>
                          <p className="text-cream/50 text-sm mt-1">{p.subtitle}</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-cream/60">
                          <Star size={12} className="text-gold" fill="currentColor" />
                          <span>{p.rating} · {p.review_count} reviews</span>
                        </div>

                        <Row label="Price" value={formatINR(p.price_inr)} accent />
                        <Row label="Top Notes" value={(p.notes_top ?? []).join(", ") || "—"} />
                        <Row label="Heart Notes" value={(p.notes_heart ?? []).join(", ") || "—"} />
                        <Row label="Base Notes" value={(p.notes_base ?? []).join(", ") || "—"} />
                        <Row label="Volume" value={p.volume_ml ? `${p.volume_ml} ml` : "—"} />
                        <Row label="Availability" value={p.stock > 0 ? "In Stock" : "Sold Out"} />

                        <button
                          onClick={() => addToCart(p.id)}
                          className="w-full bg-gold text-obsidian py-3 text-[10px] uppercase tracking-[0.28em] font-semibold hover:bg-cream mt-2"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="border-t border-cream/10 pt-3">
      <p className="text-[9px] uppercase tracking-[0.3em] text-cream/40">{label}</p>
      <p className={`text-sm mt-1 ${accent ? "font-serif text-gold text-lg" : "text-cream/80"}`}>{value}</p>
    </div>
  );
}
