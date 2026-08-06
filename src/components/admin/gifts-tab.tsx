import { Gift } from "lucide-react";

export function GiftsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Custom gift box builder configurations.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Gift className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Custom Atelier Gift Boxes</h3>
        <p className="text-xs text-cream/60">Configure 3-bottle and 5-bottle luxury discovery sets.</p>
      </div>
    </div>
  );
}
