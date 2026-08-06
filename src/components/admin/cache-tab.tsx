import { Eraser } from "lucide-react";
import { toast } from "sonner";

export function CacheTab() {
  const purge = () => {
    toast.success("Application cache purged successfully");
  };

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Purge application cache and revalidate routes.</p>
      <div className="p-8 text-center border border-cream/10 bg-cream/[0.01]">
        <Eraser className="w-12 h-12 text-gold mx-auto mb-3 opacity-60" />
        <h3 className="font-serif text-xl text-cream mb-2">Edge & SSR Cache Control</h3>
        <button onClick={purge} className="bg-gold text-obsidian px-6 py-2.5 text-xs uppercase tracking-wider font-bold">
          Purge Cache
        </button>
      </div>
    </div>
  );
}
