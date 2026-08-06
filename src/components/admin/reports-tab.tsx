import { BarChart3 } from "lucide-react";

export function ReportsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Analytics and sales performance metrics.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <BarChart3 className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Sales & Revenue Reports</h3>
        <p className="text-xs text-cream/60">Track gross merchandise value, conversion rates, and average order value.</p>
      </div>
    </div>
  );
}
