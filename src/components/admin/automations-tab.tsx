import { Zap } from "lucide-react";

export function AutomationsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Workflows for abandoned cart recovery and review requests.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Zap className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Cart Recovery & Post-Purchase Followups</h3>
        <p className="text-xs text-cream/60">Automated triggers active for 24h abandoned cart reminders & 7d review invitations.</p>
      </div>
    </div>
  );
}
