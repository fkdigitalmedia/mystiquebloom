import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Menu as MenuIcon, Plus, Edit, Trash2 } from "lucide-react";

export function NavigationTab() {
  const qc = useQueryClient();
  const { data: items } = useQuery({
    queryKey: ["admin", "navigation"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_navigation").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Header and footer navigation links.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {items?.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base text-cream">{item.label}</h3>
              <p className="text-xs text-cream/40 font-mono">{item.url}</p>
            </div>
            <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-cream/10 text-cream/60">
              {item.location}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
