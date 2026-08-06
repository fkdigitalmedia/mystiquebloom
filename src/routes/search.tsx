import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ProductCard, type Product } from "@/components/product-card";
import { useEffect, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search Fragrances · Mystique Blends" },
      { name: "description", content: "Search the Mystique Blends catalog by name, note or family — oud, attar, rose, saffron and beyond." },
      { property: "og:title", content: "Search · Mystique Blends" },
      { property: "og:description", content: "Discover your signature scent from our archive of rare fragrances." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 220);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debounced],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("id, slug, name, subtitle, fragrance_family, price_inr, compare_at_price_inr, image_url, rating, review_count, is_bestseller, is_new")
        .eq("is_published", true)
        .limit(48);
      if (debounced) {
        const term = `%${debounced}%`;
        query = query.or(
          `name.ilike.${term},subtitle.ilike.${term},fragrance_family.ilike.${term}`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });

  const suggestions = ["Oud", "Rose", "Saffron", "Musk", "Amber", "Jasmine", "Vetiver"];

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main>
        <section className="border-b border-cream/5">
          <div className="mx-auto max-w-3xl px-6 py-16 md:py-24 text-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">The Archive</span>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl">Search</h1>
            <p className="mt-5 text-cream/60">
              Find a fragrance by name, note or family.
            </p>

            <div className="mt-10 relative">
              <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-cream/50" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Try 'oud', 'rose', or 'evening'"
                className="w-full bg-transparent border border-cream/15 text-cream placeholder-cream/30 pl-12 pr-12 py-4 focus:border-gold outline-none text-sm tracking-wide"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  aria-label="Clear"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cream/50 hover:text-gold"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="text-[10px] uppercase tracking-[0.25em] border border-cream/15 hover:border-gold hover:text-gold px-3 py-2"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-xs uppercase tracking-[0.2em] text-cream/60 mb-8">
            {isLoading ? "Searching…" : `${data?.length ?? 0} ${debounced ? "matches" : "fragrances"}`}
          </p>

          {!isLoading && data?.length === 0 && (
            <div className="text-center py-24 text-cream/50 font-serif italic">
              No fragrance matches "{debounced}". Try another note.
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {data?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
