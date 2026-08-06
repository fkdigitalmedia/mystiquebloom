import { Megaphone } from "lucide-react";

export function MarketingTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">SMS & WhatsApp promotional broadcasts.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Megaphone className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Customer Broadcasts</h3>
        <p className="text-xs text-cream/60">Connect Interakt or LimeChat in Integrations tab to send automated WhatsApp broadcasts.</p>
      </div>
    </div>
  );
}
