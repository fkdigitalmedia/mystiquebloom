import { Search as SearchIcon } from "lucide-react";

export function SeoTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Global meta tags, OpenGraph images, and sitemap configuration.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <SearchIcon className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Search Engine Optimization</h3>
        <p className="text-xs text-cream/60">Dynamic meta tags, Schema.org structured data, and auto-generated XML sitemap.</p>
      </div>
    </div>
  );
}
