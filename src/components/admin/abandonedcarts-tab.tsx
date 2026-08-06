import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";

export function AbandonedCartsTab() {
  const { data: carts } = useQuery({
    queryKey: ["admin", "abandoned_carts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cart_items").select("*, products(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">View abandoned customer carts and send recovery reminders.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {carts?.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base text-cream">{c.products?.name || "Cart Item"}</h3>
              <p className="text-xs text-cream/40 font-mono">Qty: {c.quantity} · Added {new Date(c.created_at).toLocaleDateString()}</p>
            </div>
            <span className="text-sm font-mono text-gold">{formatINR((c.products?.price_inr || 0) * c.quantity)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
