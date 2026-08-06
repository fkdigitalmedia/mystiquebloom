import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useCart } from "@/context/app-context";
import { formatINR, resolveImg } from "@/lib/format";
import { toast } from "sonner";
import { Gift, Trash2, ShoppingBag, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/account/gifts")({
  head: () => ({
    meta: [
      { title: "My Gift Boxes · Mystique Blends" },
      { name: "description", content: "Your saved bespoke gift boxes — review, order, or refine each composition." },
    ],
  }),
  component: GiftsPage,
});

type ProductLite = {
  id: string;
  slug: string;
  name: string;
  price_inr: number;
  image_url: string | null;
  stock: number;
};

function GiftsPage() {
  const { user } = useAuth();
  const { addToCart, setCartOpen } = useCart();
  const qc = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: gifts, isLoading } = useQuery({
    queryKey: ["account", "gifts", user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gift_boxes")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const STATUS_META: Record<string, { label: string; cls: string }> = {
    saved: { label: "Saved", cls: "text-cream/60 border-cream/20" },
    ordered: { label: "Ordered", cls: "text-gold border-gold/40" },
    processing: { label: "Processing", cls: "text-blue-300 border-blue-400/40" },
    packed: { label: "Packed", cls: "text-purple-300 border-purple-400/40" },
    shipped: { label: "Shipped", cls: "text-cyan-300 border-cyan-400/40" },
    delivered: { label: "Delivered", cls: "text-emerald-300 border-emerald-400/40" },
    cancelled: { label: "Cancelled", cls: "text-red-300 border-red-400/40" },
  };

  const allProductIds = Array.from(
    new Set((gifts ?? []).flatMap((g: any) => g.product_ids ?? [])),
  );

  const { data: products } = useQuery({
    queryKey: ["account", "gifts", "products", allProductIds.sort().join(",")],
    enabled: allProductIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, price_inr, image_url, stock")
        .in("id", allProductIds);
      const map = new Map<string, ProductLite>();
      (data ?? []).forEach((p) => map.set(p.id, p as ProductLite));
      return map;
    },
  });

  async function addBoxToCart(g: any) {
    setBusyId(g.id);
    try {
      for (const pid of g.product_ids ?? []) {
        await addToCart(pid, 1);
      }
      await supabase.from("gift_boxes").update({ status: "ordered" }).eq("id", g.id);
      qc.invalidateQueries({ queryKey: ["account", "gifts"] });
      setCartOpen(true);
      toast.success("Gift box added to your cart");
    } finally {
      setBusyId(null);
    }
  }

  async function removeBox(id: string) {
    if (!confirm("Remove this saved gift box?")) return;
    const { error } = await supabase.from("gift_boxes").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["account", "gifts"] });
    toast.success("Gift box removed");
  }

  return (
    <section>
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold mb-2">The Atelier</p>
          <h1 className="font-serif text-4xl">My Gift Boxes</h1>
          <p className="mt-2 text-cream/60 text-sm max-w-xl">
            Your saved bespoke compositions. Order a box and its bottles are added to your cart, hand-finished and shipped complimentary.
          </p>
        </div>
        <Link
          to="/gift-builder"
          className="hidden sm:inline-flex items-center gap-2 border border-gold text-gold px-4 py-2.5 text-[10px] uppercase tracking-[0.28em] hover:bg-gold hover:text-obsidian transition-colors"
        >
          <Plus size={14} /> New gift box
        </Link>
      </header>

      {isLoading && <p className="text-cream/50 text-sm">Loading…</p>}

      {!isLoading && (gifts?.length ?? 0) === 0 && (
        <div className="border border-cream/10 bg-graphite/30 p-10 text-center">
          <Gift size={28} className="mx-auto text-gold mb-4" />
          <p className="font-serif text-2xl">No gift boxes yet</p>
          <p className="mt-2 text-cream/60 text-sm">
            Compose your first bespoke box — choose fragrances, a vessel, and inscribe a private note.
          </p>
          <Link
            to="/gift-builder"
            className="mt-6 inline-block bg-gold text-obsidian px-6 py-3 text-[10px] uppercase tracking-[0.32em] hover:bg-gold/90"
          >
            Build a gift box
          </Link>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {gifts?.map((g: any) => {
          const bottles = (g.product_ids ?? [])
            .map((id: string) => products?.get(id))
            .filter(Boolean) as ProductLite[];
          return (
            <article key={g.id} className="border border-cream/10 bg-graphite/30 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-serif text-xl">
                    {g.recipient_name ? `For ${g.recipient_name}` : "Untitled composition"}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mt-1">
                    {g.box_style} vessel · {g.occasion || "Any occasion"}
                  </p>
                </div>
                <span
                  className={`text-[9px] uppercase tracking-[0.28em] px-2 py-1 border ${
                    STATUS_META[g.status]?.cls ?? "text-cream/60 border-cream/20"
                  }`}
                >
                  {STATUS_META[g.status]?.label ?? g.status}
                </span>
              </div>

              <div className="flex -space-x-3 mb-4">
                {bottles.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="h-14 w-14 rounded-full overflow-hidden border-2 border-obsidian bg-obsidian"
                    title={p.name}
                  >
                    <img src={resolveImg(p.image_url)} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>

              <ul className="text-xs text-cream/70 space-y-1 mb-4">
                {bottles.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span className="font-serif">{p.name}</span>
                    <span>{formatINR(p.price_inr)}</span>
                  </li>
                ))}
              </ul>

              {g.message && (
                <p className="italic text-cream/70 text-sm border-l-2 border-gold/40 pl-3 mb-4">
                  "{g.message}"
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-cream/10">
                <span className="font-serif text-lg text-gold">{formatINR(g.total)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => removeBox(g.id)}
                    className="p-2 text-cream/50 hover:text-red-400"
                    aria-label="Delete gift box"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => addBoxToCart(g)}
                    disabled={busyId === g.id || bottles.length === 0}
                    className="inline-flex items-center gap-2 bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.28em] hover:bg-gold/90 disabled:opacity-40"
                  >
                    <ShoppingBag size={13} />
                    {busyId === g.id ? "Adding…" : "Order now"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
