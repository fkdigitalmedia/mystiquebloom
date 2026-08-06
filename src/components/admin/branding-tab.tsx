import { Palette } from "lucide-react";

export function BrandingTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Brand colors, typography, logos, and favicon settings.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Palette className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Luxury Aesthetic System</h3>
        <p className="text-xs text-cream/60">Obsidian (#0B0B0B) & Gold (#D4AF37) palette applied globally across all storefront routes.</p>
      </div>
    </div>
  );
}
