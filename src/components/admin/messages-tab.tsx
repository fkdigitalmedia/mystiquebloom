import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function MessagesTab() {
  const qc = useQueryClient();
  const { data: messages } = useQuery({
    queryKey: ["admin", "messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const markRead = async (id: string, is_read: boolean) => {
    const { error } = await supabase.from("contact_submissions").update({ is_read }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", "messages"] });
  };

  return (
    <div className="space-y-6">
      <p className="text-cream/60 text-sm">Inbound contact inquiries and customer support messages.</p>
      <div className="border border-cream/10 divide-y divide-cream/10">
        {messages?.map((msg) => (
          <div key={msg.id} className={`p-4 space-y-2 ${msg.is_read ? "opacity-60" : "bg-gold/[0.02]"}`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-base text-cream">{msg.name} ({msg.email})</h3>
                <p className="text-xs text-cream/40">{new Date(msg.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => markRead(msg.id, !msg.is_read)}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider border ${msg.is_read ? "border-cream/20 text-cream/40" : "border-gold text-gold font-bold"}`}
              >
                {msg.is_read ? "Mark Unread" : "Mark Read"}
              </button>
            </div>
            <p className="text-sm text-cream/80 bg-cream/[0.02] p-3 border border-cream/5 rounded">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
