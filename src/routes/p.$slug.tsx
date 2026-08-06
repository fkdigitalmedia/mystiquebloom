import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";

type Page = { slug: string; title: string; body: string; showInFooter?: boolean };

async function fetchPages(): Promise<Page[]> {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "pages")
    .maybeSingle();
  const v = (data?.value as { items?: Page[] }) ?? {};
  return v.items ?? [];
}

export const Route = createFileRoute("/p/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${prettify(params.slug)} · Mystique Blends` },
      { name: "description", content: `${prettify(params.slug)} — Mystique Blends.` },
    ],
  }),
  component: PageView,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-obsidian text-cream grid place-items-center px-6 text-center">
      <p className="text-cream/70">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-obsidian text-cream grid place-items-center px-6 text-center">
      <div>
        <p className="text-[0.7rem] uppercase tracking-[0.4em] text-gold">404</p>
        <h1 className="mt-4 font-display text-4xl">Page not found</h1>
        <Link to="/" className="mt-6 inline-block text-gold underline underline-offset-4">Return home</Link>
      </div>
    </div>
  ),
});

function prettify(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function PageView() {
  const { slug } = Route.useParams();
  const { data: pages, isLoading } = useQuery({
    queryKey: ["site_settings", "pages"],
    queryFn: fetchPages,
    staleTime: 60_000,
  });

  const page = pages?.find((p) => p.slug === slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian text-cream">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center text-cream/60">Loading…</div>
      </div>
    );
  }

  if (!page) throw notFound();

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main>
        <section className="border-b border-cream/10 bg-graphite/40">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
            <p className="text-[0.7rem] uppercase tracking-[0.5em] text-gold">Mystique Blends</p>
            <h1 className="mt-6 font-display text-5xl md:text-6xl">{page.title}</h1>
          </div>
        </section>
        <article className="mx-auto max-w-3xl px-6 py-20">
          <div className="prose-luxury text-cream/80 leading-relaxed whitespace-pre-wrap">
            {page.body}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
