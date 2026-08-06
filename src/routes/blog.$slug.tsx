import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { resolveImg } from "@/lib/format";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${titleize(params.slug)} · Mystique Journal` },
      { name: "description", content: "A story from the Mystique atelier." },
      { property: "og:title", content: `${titleize(params.slug)} · Mystique Journal` },
      { property: "og:description", content: "A story from the Mystique atelier." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogPostPage,
});

function titleize(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function renderMarkdown(md: string) {
  // Minimal markdown → HTML (headings, blockquotes, bold, paragraphs).
  const blocks = md.split(/\n\n+/).map((block) => {
    const t = block.trim();
    if (t.startsWith("# ")) return `<h1>${escape(t.slice(2))}</h1>`;
    if (t.startsWith("## ")) return `<h2>${escape(t.slice(3))}</h2>`;
    if (t.startsWith("### ")) return `<h3>${escape(t.slice(4))}</h3>`;
    if (t.startsWith("> ")) return `<blockquote>${inline(t.slice(2))}</blockquote>`;
    return `<p>${inline(t)}</p>`;
  });
  return blocks.join("\n");
}
function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inline(s: string) {
  return escape(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({
    queryKey: ["blog", "post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main>
        {isLoading || !post ? (
          <div className="mx-auto max-w-3xl px-6 py-24">
            <div className="h-8 w-3/4 bg-cream/5 animate-pulse" />
          </div>
        ) : (
          <>
            <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
              <img
                src={resolveImg(post.cover_image)}
                alt={post.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-obsidian/20 to-obsidian" />
              <div className="relative z-10 mx-auto max-w-3xl h-full flex flex-col justify-end px-6 pb-12">
                {post.tags && post.tags.length > 0 && (
                  <p className="text-[11px] uppercase tracking-[0.4em] text-gold mb-4">
                    {post.tags[0]}
                  </p>
                )}
                <h1 className="font-serif text-4xl md:text-6xl leading-tight max-w-3xl">
                  {post.title}
                </h1>
                <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-cream/60">
                  {post.author} ·{" "}
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                </p>
              </div>
            </div>

            <article
              className="mx-auto max-w-3xl px-6 py-20 prose-mystique"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
            />

            <div className="mx-auto max-w-3xl px-6 pb-24">
              <Link
                to="/blog"
                className="inline-block text-[11px] uppercase tracking-[0.28em] text-gold border-b border-gold/40 pb-1"
              >
                ← Back to the Journal
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
