import { Ticket } from "lucide-react";

export function CouponsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Discount codes and promo offers.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Ticket className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">WELCOME10 Active</h3>
        <p className="text-xs text-cream/60">10% discount auto-applied on first luxury perfume purchase.</p>
      </div>
    </div>
  );
}
