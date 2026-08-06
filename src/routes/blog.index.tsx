import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { resolveImg } from "@/lib/format";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Journal · Mystique Blends" },
      { name: "description", content: "Essays on oud, layering, and the craft of luxury perfumery from the Mystique atelier." },
      { property: "og:title", content: "The Mystique Journal" },
      { property: "og:description", content: "Essays on oud, layering, and the craft of luxury perfumery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogListPage,
});

function BlogListPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, cover_image, tags, author, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main>
        <section className="border-b border-cream/10 bg-graphite/40">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-4">The Journal</p>
            <h1 className="font-serif text-5xl md:text-6xl">Notes from the Atelier</h1>
            <p className="mt-6 max-w-2xl mx-auto text-cream/60">
              Essays on rare ingredients, the discipline of composition, and the quiet rituals that
              shape every Mystique fragrance.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          {isLoading ? (
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-cream/5" />
                  <div className="mt-4 h-4 bg-cream/5 w-3/4" />
                  <div className="mt-2 h-3 bg-cream/5 w-1/2" />
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-graphite">
                    <img
                      src={resolveImg(p.cover_image)}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-5">
                    {p.tags && p.tags.length > 0 && (
                      <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">
                        {p.tags[0]}
                      </p>
                    )}
                    <h2 className="font-serif text-2xl leading-tight group-hover:text-gold transition-colors">
                      {p.title}
                    </h2>
                    {p.excerpt && (
                      <p className="mt-3 text-sm text-cream/60 line-clamp-3">{p.excerpt}</p>
                    )}
                    <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-cream/40">
                      {p.author} ·{" "}
                      {p.published_at
                        ? new Date(p.published_at).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-cream/50">No stories yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
