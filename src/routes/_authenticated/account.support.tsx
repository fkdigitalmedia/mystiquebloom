import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, Mail, Phone, Sparkles, Clock, CheckCircle2, Archive } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/account/support")({
  head: () => ({
    meta: [
      { title: "Concierge Support · Mystique Blends" },
      { name: "description", content: "Speak with your Mystique concierge — assistance, questions and care, answered with discretion." },
      { property: "og:title", content: "Concierge Support · Mystique Blends" },
      { property: "og:description", content: "Reach the Mystique concierge team for personal assistance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SupportPage,
});

const TOPICS = ["Order help", "Product advice", "Returns & exchanges", "Loyalty & rewards", "Feedback", "Other"];

function SupportPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Guest";

  const { data: history } = useQuery({
    queryKey: ["support-messages", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data } = await supabase
        .from("contact_messages")
        .select("id, name, email, message, status, created_at, admin_reply, replied_at")
        .eq("email", user!.email!)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    if (message.trim().length < 10) {
      toast.error("Please describe your query in a bit more detail");
      return;
    }
    setSubmitting(true);
    const payload = `[${topic}] ${message.trim()}`;
    const { error } = await supabase.from("contact_messages").insert({
      name: displayName,
      email: user.email,
      message: payload,
      status: "new",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not send — please try again");
      return;
    }
    toast.success("Message sent to the concierge");
    setMessage("");
    qc.invalidateQueries({ queryKey: ["support-messages", user.email] });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <header>
        <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Concierge</span>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">How may we help?</h1>
        <p className="mt-2 text-cream/60 text-sm max-w-md">
          Personal, unhurried assistance from our atelier concierge. We usually reply within one working day.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Composer + history */}
        <div className="space-y-6">
          <form onSubmit={submit} className="border border-cream/10 bg-graphite/30 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 grid place-items-center rounded-full bg-gold/10 text-gold">
                <MessageSquare size={16} />
              </div>
              <h2 className="font-serif text-xl">New enquiry</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="From">
                <div className="border border-cream/10 bg-obsidian/60 px-3 py-2.5 text-sm text-cream/70">
                  {displayName} · {user?.email}
                </div>
              </Field>
              <Field label="Topic">
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full border border-cream/10 bg-obsidian/60 px-3 py-2.5 text-sm text-cream focus:border-gold outline-none"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Your message">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Share order number, product, or any details that will help us assist you…"
                className="w-full border border-cream/10 bg-obsidian/60 px-3 py-3 text-sm text-cream focus:border-gold outline-none resize-none"
              />
            </Field>

            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40">
                Discreet · Reply within ~24h
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-obsidian text-[10px] uppercase tracking-[0.28em] font-medium disabled:opacity-40"
              >
                <Send size={13} /> {submitting ? "Sending…" : "Send to concierge"}
              </button>
            </div>
          </form>

          {/* Previous messages */}
          <section className="border border-cream/10 bg-graphite/30">
            <header className="border-b border-cream/10 px-5 py-4">
              <h2 className="font-serif text-xl">Previous enquiries</h2>
              <p className="text-[11px] uppercase tracking-[0.24em] text-cream/40 mt-1">
                {history?.length ?? 0} on record
              </p>
            </header>
            {!history || history.length === 0 ? (
              <div className="p-8 text-center text-sm text-cream/50">
                Your concierge conversation history will appear here.
              </div>
            ) : (
              <ul className="divide-y divide-cream/5">
                {history.map((m: any) => (
                  <li key={m.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-cream whitespace-pre-wrap">{m.message}</p>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 mt-2">
                          {new Date(m.created_at).toLocaleString()}
                        </p>
                        {m.admin_reply && (
                          <div className="mt-3 border-l-2 border-gold/60 bg-obsidian/40 pl-3 py-2">
                            <p className="text-[10px] uppercase tracking-[0.28em] text-gold">
                              Concierge reply{m.replied_at ? ` · ${new Date(m.replied_at).toLocaleString()}` : ""}
                            </p>
                            <p className="mt-1 text-sm text-cream/85 whitespace-pre-wrap">{m.admin_reply}</p>
                          </div>
                        )}
                      </div>
                      <StatusPill status={m.admin_reply ? "replied" : m.status} />
                    </div>
                  </li>
                ))}

              </ul>
            )}
          </section>
        </div>

        {/* Side rail */}
        <aside className="space-y-4">
          <div className="border border-cream/10 bg-graphite/30 p-5 space-y-3">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold">
              <Sparkles size={12} /> Direct lines
            </div>
            <a href="mailto:concierge@mystiqueblends.com" className="flex items-center gap-3 text-sm hover:text-gold">
              <Mail size={14} className="text-cream/50" />
              concierge@mystiqueblends.com
            </a>
            <a href="tel:+911234567890" className="flex items-center gap-3 text-sm hover:text-gold">
              <Phone size={14} className="text-cream/50" />
              +91 12345 67890
            </a>
            <div className="flex items-center gap-3 text-sm text-cream/60">
              <Clock size={14} className="text-cream/50" />
              Mon–Sat · 10:00–19:00 IST
            </div>
          </div>

          <div className="border border-cream/10 bg-graphite/20 p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-gold mb-2">Quick links</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/account/orders" className="hover:text-gold">Track an order →</Link></li>
              <li><Link to="/p/$slug" params={{ slug: "returns" }} className="hover:text-gold">Returns & exchanges →</Link></li>
              <li><Link to="/p/$slug" params={{ slug: "shipping" }} className="hover:text-gold">Shipping policy →</Link></li>
              <li><Link to="/loyalty" className="hover:text-gold">The Circle rewards →</Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-2">{label}</span>
      {children}
    </label>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ComponentType<{ size?: number }> }> = {
    new: { label: "Sent", cls: "bg-gold/15 text-gold border-gold/30", icon: Clock },
    read: { label: "Read", cls: "bg-cream/10 text-cream/80 border-cream/20", icon: CheckCircle2 },
    replied: { label: "Replied", cls: "bg-gold/20 text-gold border-gold/40", icon: CheckCircle2 },
    archived: { label: "Closed", cls: "bg-cream/5 text-cream/50 border-cream/10", icon: Archive },
  };
  const s = map[status] ?? map.new;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[9px] uppercase tracking-[0.24em] ${s.cls}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
}
