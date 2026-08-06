import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const RECENTLY_VIEWED_KEY = "mb_recently_viewed_slugs";
const MAX_RECENT_ITEMS = 10;

export function useRecentlyViewed(currentSlug?: string) {
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSlug) return;
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let slugs: string[] = stored ? JSON.parse(stored) : [];
      // Remove current slug if already present and add to front
      slugs = [currentSlug, ...slugs.filter((s) => s !== currentSlug)].slice(
        0,
        MAX_RECENT_ITEMS,
      );
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(slugs));
    } catch {
      // Ignore localStorage errors
    }
  }, [currentSlug]);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        let slugs: string[] = stored ? JSON.parse(stored) : [];
        // Filter out current slug for display
        if (currentSlug) {
          slugs = slugs.filter((s) => s !== currentSlug);
        }
        if (slugs.length === 0) {
          setRecentProducts([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select(
            "id, slug, name, subtitle, fragrance_family, price_inr, compare_at_price_inr, image_url, rating, review_count",
          )
          .in("slug", slugs)
          .eq("is_published", true);

        if (error) throw error;

        // Preserve order as in slugs list
        const ordered = slugs
          .map((s) => data?.find((p) => p.slug === s))
          .filter(Boolean);

        setRecentProducts(ordered);
      } catch (err) {
        console.error("Failed to load recently viewed products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecent();
  }, [currentSlug]);

  return { recentProducts, loading };
}
