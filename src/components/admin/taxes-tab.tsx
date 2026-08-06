import { Receipt } from "lucide-react";

export function TaxesTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">GST rate settings and tax invoices.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Receipt className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">18% Luxury Fragrance GST</h3>
        <p className="text-xs text-cream/60">All product prices listed in the catalog are inclusive of 18% GST.</p>
      </div>
    </div>
  );
}
