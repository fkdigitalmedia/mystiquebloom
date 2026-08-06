import { RotateCcw } from "lucide-react";

export function ReturnsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Process return and exchange requests.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <RotateCcw className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Return & Refund Requests</h3>
        <p className="text-xs text-cream/60">Review customer return tickets and generate reverse pickup labels.</p>
      </div>
    </div>
  );
}
