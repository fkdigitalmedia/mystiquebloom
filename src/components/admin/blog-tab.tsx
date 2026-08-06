import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Plus } from "lucide-react";

export function BlogTab() {
  const { data: posts } = useQuery({
    queryKey: ["admin", "journal"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Manage fragrance journal articles and blog posts.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {posts?.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-cream">{p.title}</h3>
              <p className="text-xs text-cream/40 font-mono">/{p.slug}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
