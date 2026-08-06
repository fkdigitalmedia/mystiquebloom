import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { ProductCard, type Product } from "@/components/product-card";

export const Route = createFileRoute("/shop/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${titleCase(params.slug)} Collection · Mystique Blends` },
      { name: "description", content: `Discover the ${titleCase(params.slug)} collection — hand-crafted fragrances from Mystique Blends.` },
      { property: "og:title", content: `${titleCase(params.slug)} · Mystique Blends` },
      { property: "og:description", content: `Discover the ${titleCase(params.slug)} collection.` },
    ],
  }),
  component: CollectionPage,
});

function titleCase(slug: string) {
  return slug.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join(" ");
}

function CollectionPage() {
  const { slug } = Route.useParams();

  const { data } = useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      const { data: coll } = await supabase.from("collections").select("*").eq("slug", slug).maybeSingle();
      const { data: products } = await supabase
        .from("products")
        .select("id, slug, name, subtitle, fragrance_family, price_inr, compare_at_price_inr, image_url, rating, review_count, is_bestseller, is_new")
        .eq("is_published", true)
        .eq("collection_id", coll?.id ?? "00000000-0000-0000-0000-000000000000");
      return { coll, products: (products ?? []) as Product[] };
    },
  });

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main>
        <section className="border-b border-cream/5">
          <div className="mx-auto max-w-4xl px-6 py-20 md:py-28 text-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">Collection</span>
            <h1 className="mt-4 font-serif text-5xl md:text-7xl">{data?.coll?.name ?? titleCase(slug)}</h1>
            {data?.coll?.tagline && (
              <p className="mt-6 font-serif italic text-xl text-gold">{data.coll.tagline}</p>
            )}
            {data?.coll?.description && (
              <p className="mt-6 text-cream/60 max-w-xl mx-auto">{data.coll.description}</p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {data?.products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {data && data.products.length === 0 && (
            <p className="text-center text-cream/50 py-24">No fragrances in this collection yet.</p>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
