import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus, Pencil, Trash2, Star, X, Home, Building2, Package } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/account/addresses")({
  head: () => ({
    meta: [
      { title: "Addresses · Mystique Blends" },
      { name: "description", content: "Manage your saved shipping addresses for a faster Mystique checkout." },
    ],
  }),
  component: AddressesPage,
});

type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
};

const emptyForm: Omit<Address, "id" | "is_default"> & { is_default: boolean } = {
  label: "Home",
  full_name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  is_default: false,
};

function AddressesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user?.id;

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["account", "addresses", uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data } = await supabase
        .from("user_addresses")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      return (data ?? []) as Address[];
    },
  });

  const [editing, setEditing] = useState<Address | null>(null);
  const [creating, setCreating] = useState(false);
  const showForm = creating || editing;

  async function remove(id: string) {
    if (!confirm("Remove this address?")) return;
    const { error } = await supabase.from("user_addresses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Address removed");
    qc.invalidateQueries({ queryKey: ["account", "addresses", uid] });
  }

  async function setDefault(a: Address) {
    if (a.is_default || !uid) return;
    // clear existing default, then set this one
    await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", uid).eq("is_default", true);
    const { error } = await supabase.from("user_addresses").update({ is_default: true }).eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success("Default address updated");
    qc.invalidateQueries({ queryKey: ["account", "addresses", uid] });
  }

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.32em] text-gold">Address Book</span>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">My Addresses</h1>
          <p className="mt-2 text-cream/60 text-sm">Save destinations for a seamless atelier checkout.</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); }}
          className="inline-flex items-center gap-2 bg-gold text-obsidian hover:bg-cream px-5 py-3 text-[10px] uppercase tracking-[0.28em] transition-colors"
        >
          <Plus size={13} /> Add address
        </button>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-52 border border-cream/10 bg-graphite/20 animate-pulse" />)}
        </div>
      ) : !addresses || addresses.length === 0 ? (
        <div className="border border-cream/10 bg-graphite/20 p-12 text-center">
          <div className="mx-auto w-14 h-14 grid place-items-center rounded-full border border-gold/40 text-gold">
            <MapPin size={20} />
          </div>
          <h3 className="mt-5 font-serif text-2xl">No addresses yet</h3>
          <p className="mt-2 text-sm text-cream/50 max-w-sm mx-auto">Add a shipping destination to speed through checkout.</p>
          <button
            onClick={() => setCreating(true)}
            className="mt-6 inline-flex items-center gap-2 bg-gold text-obsidian hover:bg-cream px-6 py-3 text-[10px] uppercase tracking-[0.28em] transition-colors"
          >
            <Plus size={13} /> Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <AddressCard key={a.id} a={a} onEdit={() => { setEditing(a); setCreating(false); }} onRemove={() => remove(a.id)} onSetDefault={() => setDefault(a)} />
          ))}
        </div>
      )}

      {showForm && (
        <AddressForm
          initial={editing ?? { ...emptyForm, id: "", is_default: (addresses?.length ?? 0) === 0 } as Address}
          isNew={!editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => qc.invalidateQueries({ queryKey: ["account", "addresses", uid] })}
          userId={uid!}
        />
      )}
    </div>
  );
}

function AddressCard({ a, onEdit, onRemove, onSetDefault }: { a: Address; onEdit: () => void; onRemove: () => void; onSetDefault: () => void }) {
  const Icon = a.label.toLowerCase().includes("work") || a.label.toLowerCase().includes("office") ? Building2 : a.label.toLowerCase().includes("other") ? Package : Home;
  return (
    <div className={`border p-6 relative transition-colors ${a.is_default ? "border-gold/40 bg-gold/5" : "border-cream/10 bg-graphite/20 hover:border-gold/30"}`}>
      {a.is_default && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.28em] text-gold">
          <Star size={11} fill="currentColor" /> Default
        </span>
      )}
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold">
        <Icon size={13} /> {a.label}
      </div>
      <p className="mt-3 font-serif text-xl">{a.full_name}</p>
      <div className="mt-2 text-sm text-cream/70 space-y-0.5">
        <p>{a.address}</p>
        <p>{a.city}, {a.state} {a.pincode}</p>
        <p>{a.country}</p>
        <p className="text-cream/50 pt-1">☎ {a.phone}</p>
      </div>
      <div className="mt-5 pt-4 border-t border-cream/5 flex flex-wrap gap-2">
        {!a.is_default && (
          <button onClick={onSetDefault} className="text-[9px] uppercase tracking-[0.28em] text-cream/60 hover:text-gold border border-cream/15 hover:border-gold px-3 py-1.5 transition-colors">
            Set default
          </button>
        )}
        <button onClick={onEdit} className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.28em] text-cream/70 hover:text-gold border border-cream/15 hover:border-gold px-3 py-1.5 transition-colors">
          <Pencil size={11} /> Edit
        </button>
        <button onClick={onRemove} className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.28em] text-red-400/80 hover:text-red-400 border border-red-500/20 hover:border-red-500/60 px-3 py-1.5 transition-colors">
          <Trash2 size={11} /> Remove
        </button>
      </div>
    </div>
  );
}

function AddressForm({
  initial,
  isNew,
  onClose,
  onSaved,
  userId,
}: {
  initial: Address;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Address>(k: K, v: Address[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.is_default) {
        // clear other defaults
        await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userId).eq("is_default", true);
      }
      const payload = {
        user_id: userId,
        label: form.label.trim() || "Home",
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country.trim() || "India",
        is_default: form.is_default,
      };
      if (isNew) {
        const { error } = await supabase.from("user_addresses").insert(payload);
        if (error) throw error;
        toast.success("Address saved");
      } else {
        const { error } = await supabase.from("user_addresses").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Address updated");
      }
      onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save address");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={save}
        className="relative w-full md:w-[640px] md:max-h-[90vh] max-h-[92vh] overflow-y-auto bg-obsidian border border-cream/10 p-6 md:p-8 animate-fade-in"
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-cream/60 hover:text-gold" aria-label="Close">
          <X size={18} />
        </button>
        <span className="text-[10px] uppercase tracking-[0.32em] text-gold">{isNew ? "New destination" : "Edit destination"}</span>
        <h2 className="mt-2 font-serif text-2xl mb-6">{isNew ? "Add address" : "Update address"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Label" full>
            <div className="flex gap-2">
              {["Home", "Work", "Other"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => set("label", l)}
                  className={`px-3 py-2 text-[10px] uppercase tracking-[0.24em] border transition-colors ${
                    form.label === l ? "border-gold bg-gold/10 text-gold" : "border-cream/15 text-cream/60 hover:border-gold/40"
                  }`}
                >
                  {l}
                </button>
              ))}
              <input
                value={form.label}
                onChange={(e) => set("label", e.target.value)}
                maxLength={30}
                className="flex-1 bg-obsidian/60 border border-cream/10 focus:border-gold/40 outline-none px-3 py-2 text-sm"
              />
            </div>
          </Field>
          <Input label="Full Name" value={form.full_name} onChange={(v) => set("full_name", v)} required />
          <Input label="Phone" value={form.phone} onChange={(v) => set("phone", v)} required />
          <Input label="Address" value={form.address} onChange={(v) => set("address", v)} required full />
          <Input label="City" value={form.city} onChange={(v) => set("city", v)} required />
          <Input label="State" value={form.state} onChange={(v) => set("state", v)} required />
          <Input label="PIN Code" value={form.pincode} onChange={(v) => set("pincode", v)} required />
          <Input label="Country" value={form.country} onChange={(v) => set("country", v)} required />
        </div>

        <label className="mt-5 inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(e) => set("is_default", e.target.checked)}
            className="accent-gold"
          />
          <span className="text-[10px] uppercase tracking-[0.28em] text-cream/70">Set as default address</span>
        </label>

        <div className="mt-6 pt-6 border-t border-cream/10 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-5 py-3 text-[10px] uppercase tracking-[0.28em] text-cream/60 hover:text-cream">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gold text-obsidian hover:bg-cream disabled:opacity-50 px-6 py-3 text-[10px] uppercase tracking-[0.28em] transition-colors"
          >
            {saving ? "Saving…" : isNew ? "Save address" : "Update address"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`block ${full ? "md:col-span-2" : ""}`}>
      <span className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

function Input({ label, value, onChange, required, full }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; full?: boolean }) {
  return (
    <Field label={label} full={full}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={200}
        className="w-full bg-obsidian/60 border border-cream/10 focus:border-gold/40 outline-none px-3 py-2.5 text-sm"
      />
    </Field>
  );
}
