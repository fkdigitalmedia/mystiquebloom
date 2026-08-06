import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Plus, Edit, Trash2 } from "lucide-react";

export function PagesTab() {
  const qc = useQueryClient();
  const { data: pages } = useQuery({
    queryKey: ["admin", "pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").order("title");
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Static content pages (Privacy Policy, About, Terms, etc.).</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {pages?.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between hover:bg-cream/[0.02]">
            <div>
              <h3 className="font-serif text-lg text-cream">{p.title}</h3>
              <p className="text-xs text-cream/40 font-mono">/{p.slug}</p>
            </div>
            <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${p.is_published ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cream/10 text-cream/40"}`}>
              {p.is_published ? "Published" : "Draft"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
