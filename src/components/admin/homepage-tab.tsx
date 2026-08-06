import { Home } from "lucide-react";

export function HomepageTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Homepage hero banners, announcements, and featured sections.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Home className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Hero & Story Banners</h3>
        <p className="text-xs text-cream/60">Manage main carousel, announcement bar, and featured collection spotlights.</p>
      </div>
    </div>
  );
}
