import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, Shield, KeyRound, LogOut, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/account/security")({
  head: () => ({
    meta: [
      { title: "Security · Mystique Blends" },
      { name: "description", content: "Manage your Mystique account security — password, email and sessions." },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <header>
        <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Vault</span>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">Security</h1>
        <p className="mt-2 text-cream/60 text-sm">Keep your Mystique account protected.</p>
      </header>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatusChip icon={CheckCircle2} label="Email verified" ok={!!user?.email_confirmed_at} okText="Verified" badText="Pending" />
        <StatusChip icon={Shield} label="Password" ok okText="Active" badText="Not set" />
        <StatusChip icon={Mail} label="Email" ok={!!user?.email} okText={user?.email ?? ""} badText="—" />
      </div>

      <PasswordCard />
      <EmailCard currentEmail={user?.email ?? ""} />
      <SessionCard onSignOut={signOut} />
      <DangerZone />
    </div>
  );
}

function StatusChip({
  icon: Icon,
  label,
  ok,
  okText,
  badText,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  ok: boolean;
  okText: string;
  badText: string;
}) {
  return (
    <div className={`border p-4 flex items-center gap-3 ${ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
      <Icon size={18} className={ok ? "text-emerald-400" : "text-red-400"} />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">{label}</p>
        <p className={`text-sm mt-0.5 truncate ${ok ? "text-cream" : "text-red-400"}`}>{ok ? okText : badText}</p>
      </div>
    </div>
  );
}

function PasswordCard() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    if (pw !== confirm) return toast.error("Passwords do not match");
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      toast.success("Password updated");
      setPw("");
      setConfirm("");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border border-cream/10 bg-graphite/20 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-10 w-10 grid place-items-center rounded-full border border-gold/40 text-gold">
          <KeyRound size={16} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Password</span>
          <h2 className="font-serif text-2xl">Change password</h2>
        </div>
      </div>
      <p className="text-sm text-cream/60 mt-2 mb-6">Use at least 8 characters — a memorable phrase works beautifully.</p>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="New password">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
            minLength={8}
            maxLength={128}
            className="w-full bg-obsidian/60 border border-cream/10 focus:border-gold/40 outline-none px-3 py-2.5 text-sm"
          />
        </Field>
        <Field label="Confirm password">
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            maxLength={128}
            className="w-full bg-obsidian/60 border border-cream/10 focus:border-gold/40 outline-none px-3 py-2.5 text-sm"
          />
        </Field>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving || !pw}
            className="inline-flex items-center gap-2 bg-gold text-obsidian hover:bg-cream disabled:opacity-50 px-6 py-3 text-[10px] uppercase tracking-[0.28em] transition-colors"
          >
            <Lock size={13} /> {saving ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </section>
  );
}

function EmailCard({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState(currentEmail);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || email === currentEmail) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast.success("Check your inbox to confirm the new email address");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update email");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="border border-cream/10 bg-graphite/20 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-10 w-10 grid place-items-center rounded-full border border-gold/40 text-gold">
          <Mail size={16} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Email</span>
          <h2 className="font-serif text-2xl">Change email address</h2>
        </div>
      </div>
      <p className="text-sm text-cream/60 mt-2 mb-6">We'll send a confirmation link to your new address.</p>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={255}
          className="bg-obsidian/60 border border-cream/10 focus:border-gold/40 outline-none px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={saving || email === currentEmail || !email}
          className="bg-gold text-obsidian hover:bg-cream disabled:opacity-50 px-6 py-3 text-[10px] uppercase tracking-[0.28em] transition-colors"
        >
          {saving ? "Sending…" : "Update email"}
        </button>
      </form>
    </section>
  );
}

function SessionCard({ onSignOut }: { onSignOut: () => void }) {
  return (
    <section className="border border-cream/10 bg-graphite/20 p-6 md:p-8 flex flex-wrap items-center gap-4 justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-full border border-gold/40 text-gold">
          <Shield size={16} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Session</span>
          <h2 className="font-serif text-2xl">Sign out</h2>
          <p className="text-sm text-cream/60 mt-1">End your session on this device.</p>
        </div>
      </div>
      <button
        onClick={onSignOut}
        className="inline-flex items-center gap-2 border border-cream/20 hover:border-gold hover:text-gold px-5 py-3 text-[10px] uppercase tracking-[0.28em] transition-colors"
      >
        <LogOut size={13} /> Sign out
      </button>
    </section>
  );
}

function DangerZone() {
  return (
    <section className="border border-red-500/30 bg-red-500/5 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 grid place-items-center rounded-full border border-red-500/40 text-red-400">
          <AlertTriangle size={16} />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-[0.32em] text-red-400">Danger zone</span>
          <h2 className="font-serif text-2xl">Delete account</h2>
        </div>
      </div>
      <p className="text-sm text-cream/60 mt-1 mb-4">
        Account deletion is handled by our concierge to preserve order and loyalty records.
        Contact us and we'll process your request within 48 hours.
      </p>
      <a
        href="mailto:concierge@mystiqueblends.com?subject=Account%20deletion%20request"
        className="inline-flex items-center gap-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 px-5 py-3 text-[10px] uppercase tracking-[0.28em] transition-colors"
      >
        Request deletion
      </a>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
