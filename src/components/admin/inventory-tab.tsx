import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function InventoryTab() {
  const { data: items } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, sku, stock").order("stock");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Catalog stock levels and inventory alerts.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {items?.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base text-cream">{item.name}</h3>
              <p className="text-xs text-cream/40 font-mono">SKU: {item.sku || "N/A"}</p>
            </div>
            <span className={`text-sm font-mono font-bold px-3 py-1 border ${item.stock < 5 ? "border-rose-500/40 text-rose-400 bg-rose-500/10" : "border-cream/20 text-cream"}`}>
              {item.stock} in stock
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
