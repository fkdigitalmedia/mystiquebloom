import { Star } from "lucide-react";

export function ReviewsTab() {
  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Moderate customer product reviews and ratings.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Star className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-1">Verified Customer Reviews</h3>
        <p className="text-xs text-cream/60">Approve or reject customer fragrance ratings and testimonials.</p>
      </div>
    </div>
  );
}
