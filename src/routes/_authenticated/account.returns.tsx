import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PackageOpen, ArrowLeft, RotateCcw, Check, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/app-context";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds · Mystique Blends" },
      { name: "description", content: "Request a return or track the status of a refund on any Mystique Blends order." },
      { property: "og:title", content: "Returns & Refunds · Mystique Blends" },
      { property: "og:description", content: "Concierge-managed returns for your Mystique orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReturnsPage,
});

const REASONS = [
  "Damaged on arrival",
  "Wrong item received",
  "Not as described",
  "Changed my mind",
  "Allergic reaction",
  "Other",
];

const STATUS_META: Record<string, { label: string; icon: any; cls: string }> = {
  requested: { label: "Requested", icon: Clock, cls: "text-cream/70 border-cream/20" },
  approved: { label: "Approved", icon: Check, cls: "text-gold border-gold/40" },
  rejected: { label: "Rejected", icon: X, cls: "text-red-400 border-red-400/40" },
  refunded: { label: "Refunded", icon: Check, cls: "text-emerald-400 border-emerald-400/40" },
};

function ReturnsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [openForm, setOpenForm] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");

  const { data: eligibleOrders } = useQuery({
    queryKey: ["returns:eligible-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, total_inr, status, created_at")
        .eq("user_id", user!.id)
        .in("status", ["delivered", "shipped"])
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ["returns:list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("return_requests")
        .select("id, order_id, reason, details, status, resolution_notes, refund_amount_inr, created_at, order:orders(order_number, total_inr)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!orderId) throw new Error("Select an order");
      const { error } = await supabase.from("return_requests").insert({
        user_id: user!.id,
        order_id: orderId,
        reason,
        details: details.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Return request submitted");
      setOpenForm(false);
      setOrderId("");
      setDetails("");
      setReason(REASONS[0]);
      qc.invalidateQueries({ queryKey: ["returns:list"] });
    },
    onError: (e: any) => toast.error(e.message ?? "Could not submit"),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("return_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request withdrawn");
      qc.invalidateQueries({ queryKey: ["returns:list"] });
    },
  });

  const hasEligible = (eligibleOrders?.length ?? 0) > 0;

  const summary = useMemo(() => {
    const list = requests ?? [];
    return {
      total: list.length,
      pending: list.filter((r: any) => r.status === "requested").length,
      refunded: list.filter((r: any) => r.status === "refunded").length,
    };
  }, [requests]);

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Concierge · Returns</p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">Returns &amp; refunds</h1>
          <p className="mt-2 text-sm text-cream/60 max-w-xl">
            Every Mystique bottle is inspected before shipping. If something isn't right, our concierge will resolve it within 5 working days.
          </p>
        </div>
        <button
          onClick={() => setOpenForm((v) => !v)}
          disabled={!hasEligible}
          className="px-5 py-3 bg-gold text-obsidian text-[10px] uppercase tracking-[0.28em] font-medium hover:bg-gold/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {openForm ? "Close" : "Request a return"}
        </button>
      </header>

      <section className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          { label: "Total requests", value: summary.total },
          { label: "Awaiting review", value: summary.pending },
          { label: "Refunded", value: summary.refunded },
        ].map((s) => (
          <div key={s.label} className="border border-cream/10 bg-graphite/30 p-4 md:p-5">
            <p className="text-[9px] uppercase tracking-[0.28em] text-cream/50">{s.label}</p>
            <p className="mt-2 font-serif text-2xl md:text-3xl">{s.value}</p>
          </div>
        ))}
      </section>

      {openForm && (
        <section className="border border-gold/30 bg-graphite/40 p-5 md:p-8 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold">
            <RotateCcw size={14} /> New return request
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Order</label>
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="mt-2 w-full bg-obsidian border border-cream/15 px-3 py-2.5 text-sm focus:border-gold outline-none"
              >
                <option value="">Select an order…</option>
                {eligibleOrders?.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    #{o.order_number} · {formatINR(o.total_inr)} · {o.status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2 w-full bg-obsidian border border-cream/15 px-3 py-2.5 text-sm focus:border-gold outline-none"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Tell our concierge what happened…"
              className="mt-2 w-full bg-obsidian border border-cream/15 px-3 py-2.5 text-sm focus:border-gold outline-none resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setOpenForm(false)}
              className="px-4 py-2.5 text-[10px] uppercase tracking-[0.28em] text-cream/70 hover:text-cream"
            >
              Cancel
            </button>
            <button
              onClick={() => submit.mutate()}
              disabled={submit.isPending || !orderId}
              className="px-5 py-2.5 bg-gold text-obsidian text-[10px] uppercase tracking-[0.28em] font-medium hover:bg-gold/90 disabled:opacity-50"
            >
              {submit.isPending ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </section>
      )}

      {!hasEligible && !openForm && (
        <div className="border border-dashed border-cream/15 p-8 text-center">
          <PackageOpen size={22} className="mx-auto text-cream/40" />
          <p className="mt-3 text-sm text-cream/70">You don't have any orders eligible for return yet.</p>
          <Link to="/account/orders" className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold">
            <ArrowLeft size={12} /> Go to orders
          </Link>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-[10px] uppercase tracking-[0.32em] text-cream/50">Your requests</h2>
        {isLoading ? (
          <p className="text-sm text-cream/50">Loading…</p>
        ) : (requests?.length ?? 0) === 0 ? (
          <p className="text-sm text-cream/50">No return requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {requests!.map((r: any) => {
              const meta = STATUS_META[r.status] ?? STATUS_META.requested;
              const Icon = meta.icon;
              return (
                <li key={r.id} className="border border-cream/10 bg-graphite/20 p-5 grid gap-4 md:grid-cols-[1fr_auto] items-start">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[9px] uppercase tracking-[0.28em] ${meta.cls}`}>
                        <Icon size={12} /> {meta.label}
                      </span>
                      <Link
                        to="/account/orders/$id"
                        params={{ id: r.order_id }}
                        className="text-[10px] uppercase tracking-[0.28em] text-cream/60 hover:text-gold"
                      >
                        Order #{r.order?.order_number}
                      </Link>
                      <span className="text-[10px] text-cream/40">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="font-serif text-lg">{r.reason}</p>
                    {r.details && <p className="text-sm text-cream/60">{r.details}</p>}
                    {r.resolution_notes && (
                      <p className="text-sm text-gold/80 border-l-2 border-gold/40 pl-3 mt-2">
                        Concierge: {r.resolution_notes}
                      </p>
                    )}
                    {r.refund_amount_inr != null && (
                      <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-400">
                        Refund · {formatINR(r.refund_amount_inr)}
                      </p>
                    )}
                  </div>
                  {r.status === "requested" && (
                    <button
                      onClick={() => cancel.mutate(r.id)}
                      className="text-[10px] uppercase tracking-[0.28em] text-cream/50 hover:text-red-400 justify-self-end"
                    >
                      Withdraw
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
