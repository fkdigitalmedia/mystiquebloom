import { Plug } from "lucide-react";

export function IntegrationsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Third-party services (Razorpay, Shiprocket, Twilio, Google Analytics).</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Plug className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Active Integrations</h3>
        <p className="text-xs text-cream/60">Razorpay Payment Gateway, Supabase Auth, Vercel Blob Storage, Shiprocket Courier API.</p>
      </div>
    </div>
  );
}
