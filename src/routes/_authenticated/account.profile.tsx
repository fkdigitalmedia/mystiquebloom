import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User as UserIcon, Save, Sparkles, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/image-upload";

export const Route = createFileRoute("/_authenticated/account/profile")({
  head: () => ({
    meta: [
      { title: "Profile · Mystique Blends" },
      { name: "description", content: "Manage your Mystique atelier profile — name, avatar and contact details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["account", "profile-edit", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url, loyalty_points, created_at")
        .eq("id", uid!)
        .maybeSingle();
      return data;
    },
  });

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setAvatar(profile.avatar_url ?? null);
    }
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim() || null, phone: phone.trim() || null, avatar_url: avatar })
        .eq("id", uid);
      if (error) throw error;
      toast.success("Profile updated");
      await qc.invalidateQueries({ queryKey: ["account", "profile-edit", uid] });
      await qc.invalidateQueries({ queryKey: ["profile", uid, "shell"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not update profile");
    } finally {
      setSaving(false);
    }
  }

  const initials = (fullName || user?.email || "M")
    .split(/[ @]/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <header>
        <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Identity</span>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">My Profile</h1>
        <p className="mt-2 text-cream/60 text-sm">The name behind the fragrance — refine your atelier identity.</p>
      </header>

      <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        {/* Avatar card */}
        <div className="border border-cream/10 bg-graphite/20 p-6 text-center">
          <div className="mx-auto w-32 h-32 rounded-full overflow-hidden bg-gold text-obsidian grid place-items-center font-serif text-4xl border-2 border-gold/40">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              initials || <UserIcon size={32} />
            )}
          </div>
          <p className="mt-4 font-serif text-lg">{fullName || "Anonymous"}</p>
          <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 mt-1 truncate">{user?.email}</p>
          {profile?.loyalty_points != null && (
            <div className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold">
              <Sparkles size={12} /> {profile.loyalty_points} pts
            </div>
          )}
          <div className="mt-6 text-left">
            <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-2">Avatar</p>
            <ImageUpload value={avatar ?? undefined} onChange={(url) => setAvatar(url ?? null)} />
          </div>
        </div>

        {/* Details */}
        <div className="border border-cream/10 bg-graphite/20 p-6 md:p-8 space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Personal details</span>
            <h2 className="mt-2 font-serif text-2xl">Your information</h2>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="h-14 bg-cream/5 animate-pulse" />
              <div className="h-14 bg-cream/5 animate-pulse" />
              <div className="h-14 bg-cream/5 animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                  placeholder="Your full name"
                  className="w-full bg-obsidian/60 border border-cream/10 focus:border-gold/40 outline-none px-3 py-2.5 text-sm"
                />
              </Field>
              <Field label="Email" locked>
                <div className="w-full flex items-center gap-2 bg-obsidian/40 border border-cream/5 px-3 py-2.5 text-sm text-cream/60">
                  <Mail size={13} className="text-cream/40" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </Field>
              <Field label="Phone">
                <div className="w-full flex items-center gap-2 bg-obsidian/60 border border-cream/10 focus-within:border-gold/40 px-3 py-2.5 text-sm">
                  <Phone size={13} className="text-cream/40" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                    placeholder="+91 98XXXXXXXX"
                    className="flex-1 bg-transparent outline-none"
                  />
                </div>
              </Field>
              <Field label="Member since" locked>
                <div className="w-full bg-obsidian/40 border border-cream/5 px-3 py-2.5 text-sm text-cream/60">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                    : "—"}
                </div>
              </Field>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving || isLoading}
              className="inline-flex items-center gap-2 bg-gold text-obsidian hover:bg-cream disabled:opacity-50 px-6 py-3 text-[10px] uppercase tracking-[0.28em] transition-colors"
            >
              <Save size={13} />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, locked, children }: { label: string; locked?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-1.5 flex items-center gap-2">
        {label}
        {locked && <span className="text-[9px] text-cream/30">· locked</span>}
      </span>
      {children}
    </label>
  );
}
