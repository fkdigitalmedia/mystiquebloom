import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/product-card";

export const Route = createFileRoute("/_authenticated/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist · Mystique Blends" },
      { name: "description", content: "Your saved Mystique Blends fragrances." },
      { property: "og:title", content: "Wishlist · Mystique Blends" },
      { property: "og:description", content: "Your saved Mystique Blends fragrances." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["wishlist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("wishlist")
        .select("product:products(id, slug, name, subtitle, fragrance_family, price_inr, compare_at_price_inr, image_url, rating, review_count, is_bestseller, is_new)");
      return (data?.map((w: any) => w.product).filter(Boolean) ?? []) as Product[];
    },
  });

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <h1 className="font-serif text-4xl md:text-5xl mb-10">Your Wishlist</h1>
        {(!data || data.length === 0) ? (
          <div className="text-center py-24 text-cream/50">
            <p>You haven't saved any fragrances yet.</p>
            <Link to="/shop" className="mt-4 inline-block text-gold gold-underline">Explore fragrances</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {data.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
