import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = `${url.protocol}//${url.host}`;
        const now = new Date().toISOString();

        const supabase = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false, storage: undefined } },
        );

        const staticPaths = ["", "/shop", "/search", "/compare", "/gift-builder", "/blog", "/auth"];

        const [products, collections, posts] = await Promise.all([
          supabase.from("products").select("slug").eq("is_published", true),
          supabase.from("collections").select("slug").eq("is_published", true),
          supabase.from("blog_posts").select("slug").eq("published", true),
        ]);

        const urls: Array<{ loc: string; priority: string }> = [];
        for (const p of staticPaths) {
          urls.push({ loc: `${origin}${p || "/"}`, priority: p === "" ? "1.0" : "0.7" });
        }
        for (const p of products.data ?? []) urls.push({ loc: `${origin}/product/${p.slug}`, priority: "0.9" });
        for (const c of collections.data ?? []) urls.push({ loc: `${origin}/shop/${c.slug}`, priority: "0.8" });
        for (const b of posts.data ?? []) urls.push({ loc: `${origin}/blog/${b.slug}`, priority: "0.6" });

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${now}</lastmod><priority>${u.priority}</priority></url>`)
  .join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
