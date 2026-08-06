import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ProductCard, type Product } from "@/components/product-card";
import { useState } from "react";

export const Route = createFileRoute("/shop/")({
  head: () => ({
    meta: [
      { title: "Shop All Fragrances · Mystique Blends" },
      { name: "description", content: "Browse the complete Mystique Blends catalog — rare oud, hand-distilled attars, and modern parfums crafted in Kannauj." },
      { property: "og:title", content: "Shop All Fragrances · Mystique Blends" },
      { property: "og:description", content: "The full Mystique Blends collection of luxury Indian fragrances." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "new">("featured");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "all", sort],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id, slug, name, subtitle, fragrance_family, price_inr, compare_at_price_inr, image_url, rating, review_count, is_bestseller, is_new")
        .eq("is_published", true);
      if (sort === "price-asc") q = q.order("price_inr", { ascending: true });
      else if (sort === "price-desc") q = q.order("price_inr", { ascending: false });
      else if (sort === "new") q = q.order("is_new", { ascending: false }).order("created_at", { ascending: false });
      else q = q.order("is_bestseller", { ascending: false }).order("created_at", { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main>
        <section className="border-b border-cream/5">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 text-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">The House Catalog</span>
            <h1 className="mt-4 font-serif text-5xl md:text-6xl">All Fragrances</h1>
            <p className="mt-5 text-cream/60 max-w-xl mx-auto">
              Every parfum, attar and extrait we craft — assembled in one place.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-cream/10">
            <p className="text-xs uppercase tracking-[0.2em] text-cream/60">
              {products?.length ?? 0} fragrances
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-transparent border border-cream/15 text-cream text-xs uppercase tracking-[0.2em] px-3 py-2 focus:border-gold outline-none"
            >
              <option value="featured" className="bg-obsidian">Featured</option>
              <option value="new" className="bg-obsidian">Newest</option>
              <option value="price-asc" className="bg-obsidian">Price: Low → High</option>
              <option value="price-desc" className="bg-obsidian">Price: High → Low</option>
            </select>
          </div>

          {isLoading && <p className="text-cream/50 py-24 text-center">Loading…</p>}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products?.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
