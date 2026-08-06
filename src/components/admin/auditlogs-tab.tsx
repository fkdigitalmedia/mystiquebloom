import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function AuditLogsTab() {
  const { data: logs } = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">System security audit trailing administrative actions.</p>
      <div className="border border-cream/10 divide-y divide-cream/10 font-mono text-xs">
        {logs?.map((l) => (
          <div key={l.id} className="p-3 flex items-center justify-between hover:bg-cream/[0.02]">
            <div>
              <span className="text-gold uppercase tracking-wider font-bold">{l.action}</span>
              <span className="text-cream/60 ml-2">{l.entity_type} {l.entity_id}</span>
            </div>
            <span className="text-cream/40">{new Date(l.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
