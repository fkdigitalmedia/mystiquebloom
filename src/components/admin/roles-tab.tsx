import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield } from "lucide-react";

export function RolesTab() {
  const qc = useQueryClient();
  const { data: roles } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateRole = async (user_id: string, role: string) => {
    const { error } = await supabase.from("user_roles").upsert({ user_id, role });
    if (error) { toast.error(error.message); return; }
    toast.success("Role updated");
    qc.invalidateQueries({ queryKey: ["admin", "roles"] });
  };

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Assign team permissions (Admin, Manager, Staff).</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {roles?.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-mono text-cream">{r.user_id}</p>
              <p className="text-xs text-gold uppercase tracking-wider font-bold mt-0.5">{r.role}</p>
            </div>
            <select
              value={r.role}
              onChange={(e) => updateRole(r.user_id, e.target.value)}
              className="bg-obsidian border border-cream/20 px-3 py-1.5 text-xs text-cream focus:border-gold outline-none"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
