import { useState, useEffect, Fragment } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { ShoppingBag } from "lucide-react";

export function OrdersTab() {
  const { data: orders } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Track customer orders, fulfillment status, and payments.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {orders?.map((o) => (
          <div key={o.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-mono text-sm text-cream font-bold">#{o.order_number || o.id.slice(0, 8)}</h3>
              <p className="text-xs text-cream/40">{new Date(o.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-serif text-gold">{formatINR(o.total_inr)}</p>
              <span className="text-[10px] uppercase tracking-wider text-cream/60">{o.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
