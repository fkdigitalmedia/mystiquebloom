import { Truck } from "lucide-react";

export function ShippingTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Shipping rates and delivery zone configurations.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Truck className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Standard Nationwide Delivery</h3>
        <p className="text-xs text-cream/60">Flat ₹99 shipping across India. Free shipping on orders above ₹1,999.</p>
      </div>
    </div>
  );
}
