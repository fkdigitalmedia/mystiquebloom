import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, resolveImg } from "@/lib/format";

export function RelatedProducts({
  productId,
  collectionId,
  family,
}: {
  productId: string;
  collectionId: string | null;
  family: string | null;
}) {
  const { data } = useQuery({
    queryKey: ["related", productId, collectionId, family],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id, slug, name, subtitle, image_url, price_inr, compare_at_price_inr, fragrance_family")
        .eq("is_published", true)
        .neq("id", productId)
        .limit(4);
      if (collectionId) q = q.eq("collection_id", collectionId);
      else if (family) q = q.eq("fragrance_family", family);
      const { data } = await q;
      if (data && data.length >= 4) return data;
      // fallback: fill with other published products
      const { data: extra } = await supabase
        .from("products")
        .select("id, slug, name, subtitle, image_url, price_inr, compare_at_price_inr, fragrance_family")
        .eq("is_published", true)
        .neq("id", productId)
        .limit(8);
      const combined = [...(data ?? [])];
      for (const p of extra ?? []) {
        if (combined.length >= 4) break;
        if (!combined.find((c) => c.id === p.id)) combined.push(p);
      }
      return combined;
    },
  });

  if (!data || data.length === 0) return null;

  return (
    <section className="mt-20 pt-14 border-t border-cream/10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Also Discover</p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">You May Also Love</h2>
        </div>
        <Link to="/shop" className="text-[11px] uppercase tracking-[0.28em] text-cream/60 hover:text-gold">View All →</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {data.map((p) => (
          <Link key={p.id} to="/product/$slug" params={{ slug: p.slug }} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-graphite">
              <img
                src={resolveImg(p.image_url)}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <div className="pt-4">
              <p className="text-[9px] uppercase tracking-[0.32em] text-gold">{p.fragrance_family}</p>
              <h3 className="mt-1.5 font-serif text-lg leading-snug group-hover:text-gold transition-colors">{p.name}</h3>
              {p.subtitle && <p className="text-xs text-cream/50 mt-0.5 line-clamp-1">{p.subtitle}</p>}
              <div className="mt-2 flex items-baseline gap-2 text-sm">
                <span className="text-gold">{formatINR(p.price_inr)}</span>
                {p.compare_at_price_inr && (
                  <span className="line-through text-cream/40 text-xs">{formatINR(p.compare_at_price_inr)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
