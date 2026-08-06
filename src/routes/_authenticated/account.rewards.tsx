import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, TrendingUp, Gift, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";
import { useLoyaltySettings, currentTier } from "@/lib/use-site-settings";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards · Mystique Blends" },
      { name: "description", content: "Your Mystique Circle points, tier progression and redemption history." },
    ],
  }),
  component: RewardsPage,
});

function RewardsPage() {
  const { user } = useAuth();
  const { data: loyalty } = useLoyaltySettings();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id, "rewards"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("loyalty_points, created_at")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ["rewards-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, created_at, points_earned, points_redeemed, total_inr, status")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  const points = profile?.loyalty_points ?? 0;
  const tiers = loyalty?.tiers ?? [];
  const tier = tiers.length ? currentTier(points, tiers) : { name: "Ivory", minPoints: 0, perk: "" };
  const nextTier = tiers.find((t) => t.minPoints > points);
  const pointValue = loyalty?.pointValue ?? 1;
  const progressPct = nextTier
    ? Math.min(100, Math.round(((points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100))
    : 100;

  const lifetimeEarned = history.reduce((s, o: any) => s + (o.points_earned ?? 0), 0);
  const lifetimeRedeemed = history.reduce((s, o: any) => s + (o.points_redeemed ?? 0), 0);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">The Circle</p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl text-cream">Your Rewards</h1>
        <p className="mt-2 text-sm text-cream/60">Earn points on every ritual. Redeem for savings on your next composition.</p>
      </header>

      {/* Balance card */}
      <div className="relative overflow-hidden border border-gold/30 bg-gradient-to-br from-graphite/60 via-obsidian to-graphite/40 p-8">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative grid md:grid-cols-3 gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Current Balance</p>
            <p className="mt-3 font-serif text-5xl text-gold">{points}</p>
            <p className="mt-1 text-[11px] text-cream/50">≈ {formatINR(points * pointValue)} redeemable</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Your Tier</p>
            <p className="mt-3 font-serif text-3xl text-cream flex items-center gap-2">
              <Sparkles size={18} className="text-gold" />
              {tier.name}
            </p>
            <p className="mt-1 text-[11px] text-cream/50">{tier.perk}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">
              {nextTier ? `Next: ${nextTier.name}` : "Highest tier reached"}
            </p>
            {nextTier ? (
              <>
                <p className="mt-3 font-serif text-2xl text-cream">{nextTier.minPoints - points} pts to go</p>
                <div className="mt-3 h-1 bg-cream/10 overflow-hidden">
                  <div className="h-full bg-gold transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </>
            ) : (
              <p className="mt-3 font-serif text-2xl text-gold">Noir laureate</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Lifetime Earned" value={`${lifetimeEarned} pts`} />
        <StatCard icon={Gift} label="Lifetime Redeemed" value={`${lifetimeRedeemed} pts`} />
        <StatCard icon={Sparkles} label="Point Value" value={`₹${pointValue} / pt`} />
      </div>

      {/* How it works */}
      <div className="border border-cream/10 bg-graphite/20 p-6 md:p-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-gold">How it works</p>
        <div className="mt-4 grid md:grid-cols-3 gap-6 text-sm text-cream/70">
          <div>
            <p className="font-serif text-lg text-cream mb-1">Earn</p>
            1 point for every ₹{loyalty?.earnPerRupee ?? 100} spent on any Mystique composition.
          </div>
          <div>
            <p className="font-serif text-lg text-cream mb-1">Redeem</p>
            Apply up to {loyalty?.redeemCapPct ?? 20}% of order value at checkout — every point worth ₹{pointValue}.
          </div>
          <div>
            <p className="font-serif text-lg text-cream mb-1">Ascend</p>
            Unlock priority shipping, early access, and private launches as you rise through the tiers.
          </div>
        </div>
      </div>

      {/* History */}
      <div className="border border-cream/10 bg-graphite/20">
        <div className="flex items-center justify-between p-5 border-b border-cream/10">
          <h2 className="font-serif text-xl text-cream">Points Ledger</h2>
          <Link to="/account/orders" className="text-[10px] uppercase tracking-[0.28em] text-gold hover:underline">
            All orders
          </Link>
        </div>
        {history.length === 0 ? (
          <div className="p-10 text-center text-sm text-cream/50">No transactions yet — your first order will begin the ledger.</div>
        ) : (
          <div className="divide-y divide-cream/10">
            {history.map((o: any) => {
              const earned = o.points_earned ?? 0;
              const redeemed = o.points_redeemed ?? 0;
              if (!earned && !redeemed) return null;
              return (
                <div key={o.id} className="flex items-center justify-between px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm text-cream truncate">Order #{o.order_number}</p>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 mt-1">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {earned > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-green-400">
                        <ArrowUpRight size={13} />+{earned}
                      </span>
                    )}
                    {redeemed > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-gold">
                        <ArrowDownLeft size={13} />−{redeemed}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="border border-cream/10 bg-graphite/20 p-5">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cream/50">
        <Icon size={13} className="text-gold" /> {label}
      </div>
      <p className="mt-3 font-serif text-2xl text-cream">{value}</p>
    </div>
  );
}
