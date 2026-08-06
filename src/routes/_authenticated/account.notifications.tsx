import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Mail, MessageSquare, Package, Tag, Sparkles, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/app-context";

export const Route = createFileRoute("/_authenticated/account/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · Mystique Blends" },
      { name: "description", content: "Choose how Mystique whispers to you — order updates, rewards, drops and journal." },
      { property: "og:title", content: "Notifications · Mystique Blends" },
      { property: "og:description", content: "Manage your Mystique notification preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsPage,
});

type Prefs = {
  emailOrders: boolean;
  emailPromos: boolean;
  emailJournal: boolean;
  emailRewards: boolean;
  smsOrders: boolean;
  smsPromos: boolean;
  pushOrders: boolean;
  pushDrops: boolean;
};

const DEFAULTS: Prefs = {
  emailOrders: true,
  emailPromos: true,
  emailJournal: false,
  emailRewards: true,
  smsOrders: true,
  smsPromos: false,
  pushOrders: true,
  pushDrops: false,
};

function NotificationsPage() {
  const { user } = useAuth();
  const key = `mystique.notif.${user?.id ?? "anon"}`;
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, [key]);

  const toggle = (k: keyof Prefs) => {
    setPrefs((p) => ({ ...p, [k]: !p[k] }));
    setDirty(true);
  };

  const save = () => {
    localStorage.setItem(key, JSON.stringify(prefs));
    setDirty(false);
    toast.success("Preferences saved");
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Whispers</span>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">Notifications</h1>
          <p className="mt-2 text-cream/60 text-sm max-w-md">
            Choose how often, and how quietly, Mystique speaks to you.
          </p>
        </div>
        <button
          onClick={save}
          disabled={!dirty}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold text-obsidian text-[10px] uppercase tracking-[0.28em] font-medium disabled:opacity-40"
        >
          <Save size={14} /> Save preferences
        </button>
      </header>

      <Section
        icon={Mail}
        title="Email"
        subtitle={user?.email ?? "—"}
        items={[
          { key: "emailOrders", label: "Order updates", desc: "Confirmations, shipments, delivery" },
          { key: "emailRewards", label: "Rewards & tier changes", desc: "Points earned, tier upgrades, perks" },
          { key: "emailPromos", label: "Private drops & offers", desc: "Members-first access to limited editions" },
          { key: "emailJournal", label: "The Journal", desc: "Editorial notes, rituals, olfactory essays" },
        ]}
        prefs={prefs}
        onToggle={toggle}
      />

      <Section
        icon={MessageSquare}
        title="SMS"
        subtitle="Occasional, only when it matters"
        items={[
          { key: "smsOrders", label: "Shipping updates", desc: "Dispatch and out-for-delivery texts" },
          { key: "smsPromos", label: "Flash offers", desc: "Time-sensitive concierge invitations" },
        ]}
        prefs={prefs}
        onToggle={toggle}
      />

      <Section
        icon={Bell}
        title="Push"
        subtitle="On-device alerts (when installed)"
        items={[
          { key: "pushOrders", label: "Order status", desc: "Real-time push for every milestone" },
          { key: "pushDrops", label: "New arrivals", desc: "The moment a new blend goes live" },
        ]}
        prefs={prefs}
        onToggle={toggle}
      />

      <div className="border border-cream/10 bg-graphite/20 p-5 flex gap-4">
        <Sparkles className="text-gold shrink-0" size={20} />
        <div className="text-sm text-cream/70">
          Transactional emails — receipts, password resets, and legal notices — are always sent to keep your
          account safe. Only marketing and lifecycle notifications can be silenced.
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  items,
  prefs,
  onToggle,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  items: { key: keyof Prefs; label: string; desc: string }[];
  prefs: Prefs;
  onToggle: (k: keyof Prefs) => void;
}) {
  return (
    <section className="border border-cream/10 bg-graphite/30">
      <header className="flex items-center gap-3 border-b border-cream/10 px-5 py-4">
        <div className="h-9 w-9 grid place-items-center rounded-full bg-gold/10 text-gold">
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-xl">{title}</h2>
          <p className="text-[11px] uppercase tracking-[0.24em] text-cream/40 truncate">{subtitle}</p>
        </div>
      </header>
      <div className="divide-y divide-cream/5">
        {items.map((it) => (
          <label
            key={it.key}
            className="flex items-center justify-between gap-6 px-5 py-4 cursor-pointer hover:bg-cream/[0.02] transition-colors"
          >
            <div className="min-w-0">
              <p className="text-sm text-cream">{it.label}</p>
              <p className="text-xs text-cream/50 mt-0.5">{it.desc}</p>
            </div>
            <Toggle on={prefs[it.key]} onChange={() => onToggle(it.key)} />
          </label>
        ))}
      </div>
    </section>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-gold" : "bg-cream/15"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-obsidian transition-all ${
          on ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}
