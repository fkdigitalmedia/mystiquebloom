import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function CustomersTab() {
  const { data: customers } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Registered customer accounts and profiles.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {customers?.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base text-cream">{c.full_name || "Anonymous User"}</h3>
              <p className="text-xs text-cream/40">{c.email || c.phone || c.id}</p>
            </div>
            <span className="text-xs text-cream/40 font-mono">
              Joined {new Date(c.created_at).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
