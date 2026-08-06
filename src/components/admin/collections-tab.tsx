import { useState, useEffect, Fragment } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FolderTree, Plus, Edit, Trash2 } from "lucide-react";

export function CollectionsTab() {
  const qc = useQueryClient();
  const { data: collections } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Organize products into curated fragrance collections.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {collections?.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-cream">{c.name}</h3>
              <p className="text-xs text-cream/40 font-mono">/{c.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
