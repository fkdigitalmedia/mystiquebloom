import { Mail } from "lucide-react";

export function EmailTemplatesTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Transactional email templates (Order Confirmation, Shipping, Password Reset).</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Mail className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Branded HTML Emails Active</h3>
        <p className="text-xs text-cream/60">Automated dispatch via Resend / Supabase Auth SMTP.</p>
      </div>
    </div>
  );
}
