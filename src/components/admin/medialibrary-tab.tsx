import { ImageIcon } from "lucide-react";

export function MediaLibraryTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Uploaded product images, banners, and media assets.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <ImageIcon className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Vercel Blob Storage Active</h3>
        <p className="text-xs text-cream/60">Optimized WebP fragrance bottle imagery hosted on CDN.</p>
      </div>
    </div>
  );
}
