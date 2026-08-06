import { Award } from "lucide-react";

export function LoyaltyTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Loyalty points and reward tiers.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Award className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Mystique Circle Rewards</h3>
        <p className="text-xs text-cream/60">Earn 5 points for every ₹100 spent. Redeem points for store discounts.</p>
      </div>
    </div>
  );
}
