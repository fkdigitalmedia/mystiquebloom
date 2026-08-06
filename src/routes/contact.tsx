import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Phone, MapPin } from "lucide-react";

type ContactInfo = {
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
  intro?: string;
};

async function fetchContact(): Promise<ContactInfo> {
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "contact")
    .maybeSingle();
  return (data?.value as ContactInfo) ?? {};
}

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact the Atelier · Mystique Blends" },
      {
        name: "description",
        content:
          "Reach the Mystique atelier for private consultations, bespoke commissions, and concierge care.",
      },
      { property: "og:title", content: "Contact · Mystique Blends" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data } = useQuery({ queryKey: ["site_settings", "contact"], queryFn: fetchContact, staleTime: 60_000 });
  const info = data ?? {};

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill out every field.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name,
      email: form.email,
      message: form.message,
    });
    setSending(false);
    if (error) {
      toast.error("Could not send. Please try again.");
      return;
    }
    setForm({ name: "", email: "", message: "" });
    toast.success("Message received. Our concierge will reply within one business day.");
  };

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main>
        <section className="border-b border-cream/10 bg-graphite/40">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center">
            <p className="text-[0.7rem] uppercase tracking-[0.5em] text-gold">Concierge</p>
            <h1 className="mt-6 font-display text-5xl md:text-6xl">Contact the Atelier</h1>
            <p className="mt-6 text-cream/70 max-w-2xl mx-auto">
              {info.intro ??
                "For private consultations, bespoke commissions, or care of an existing acquisition — we respond within one business day."}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-16">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Reach Us</p>
              <div className="mt-6 space-y-6">
                {info.email && (
                  <div className="flex gap-4">
                    <Mail size={18} className="text-gold mt-1" />
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-cream/50">Email</p>
                      <a href={`mailto:${info.email}`} className="mt-1 block text-cream hover:text-gold">
                        {info.email}
                      </a>
                    </div>
                  </div>
                )}
                {info.phone && (
                  <div className="flex gap-4">
                    <Phone size={18} className="text-gold mt-1" />
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-cream/50">Phone</p>
                      <a href={`tel:${info.phone}`} className="mt-1 block text-cream hover:text-gold">
                        {info.phone}
                      </a>
                    </div>
                  </div>
                )}
                {info.address && (
                  <div className="flex gap-4">
                    <MapPin size={18} className="text-gold mt-1" />
                    <div>
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-cream/50">Atelier</p>
                      <p className="mt-1 whitespace-pre-line text-cream/80">{info.address}</p>
                    </div>
                  </div>
                )}
                {info.hours && (
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-cream/50">Hours</p>
                    <p className="mt-1 whitespace-pre-line text-cream/80">{info.hours}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="border border-cream/10 p-8 md:p-10 space-y-5 bg-graphite/20">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-gold">Send a Note</p>
            <div>
              <label className="block text-[0.6rem] uppercase tracking-[0.3em] text-cream/50 mb-2">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-obsidian border border-cream/15 focus:border-gold outline-none px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-[0.6rem] uppercase tracking-[0.3em] text-cream/50 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-obsidian border border-cream/15 focus:border-gold outline-none px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block text-[0.6rem] uppercase tracking-[0.3em] text-cream/50 mb-2">Message</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-obsidian border border-cream/15 focus:border-gold outline-none px-4 py-3 text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full border border-gold bg-gold px-8 py-3 text-[0.7rem] uppercase tracking-[0.35em] text-obsidian hover:bg-transparent hover:text-gold transition disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Message"}
            </button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
