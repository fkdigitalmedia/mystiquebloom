import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wallet, ArrowUpRight, ArrowDownLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";
import { useLoyaltySettings } from "@/lib/use-site-settings";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet · Mystique Blends" },
      { name: "description", content: "Your Mystique wallet — store credit from points, refunds, and gifts." },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const { user } = useAuth();
  const { data: loyalty } = useLoyaltySettings();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id, "wallet"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: history = [] } = useQuery({
    queryKey: ["wallet-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, created_at, points_earned, points_redeemed, status")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  const points = profile?.loyalty_points ?? 0;
  const pointValue = loyalty?.pointValue ?? 1;
  const walletValue = points * pointValue;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[10px] uppercase tracking-[0.32em] text-gold">Concierge</p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl text-cream">Mystique Wallet</h1>
        <p className="mt-2 text-sm text-cream/60">
          Your store credit — earned through the Circle, refunds and gifts. Apply at checkout in one tap.
        </p>
      </header>

      {/* Wallet card */}
      <div className="relative overflow-hidden border border-gold/30 bg-gradient-to-br from-graphite/60 via-obsidian to-graphite/40 p-8 md:p-10">
        <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-gold">
              <Wallet size={13} /> Available balance
            </div>
            <p className="mt-3 font-serif text-5xl md:text-6xl text-cream">{formatINR(walletValue)}</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-cream/50">
              {points} points · 1 pt = ₹{pointValue}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Link
              to="/shop"
              className="px-6 py-3 bg-gold text-obsidian text-[10px] uppercase tracking-[0.28em] font-medium text-center hover:bg-gold/90"
            >
              Shop & apply
            </Link>
            <Link
              to="/loyalty"
              className="px-6 py-3 border border-cream/20 text-[10px] uppercase tracking-[0.28em] text-cream/80 text-center hover:border-gold hover:text-gold"
            >
              Earn more
            </Link>
          </div>
        </div>
      </div>

      {/* Ways to top up */}
      <div className="grid sm:grid-cols-3 gap-4">
        <TopUp icon={Sparkles} label="Earn on orders" body={`1 point per ₹${loyalty?.earnPerRupee ?? 100} spent.`} />
        <TopUp icon={ArrowUpRight} label="Refunds" body="Cancelled orders return to wallet instantly." />
        <TopUp icon={ArrowDownLeft} label="Gifted credit" body="Receive from the Concierge on select events." />
      </div>

      {/* Ledger */}
      <div className="border border-cream/10 bg-graphite/20">
        <div className="flex items-center justify-between p-5 border-b border-cream/10">
          <h2 className="font-serif text-xl text-cream">Transactions</h2>
          <Link to="/account/orders" className="text-[10px] uppercase tracking-[0.28em] text-gold hover:underline">
            All orders
          </Link>
        </div>
        {history.length === 0 ? (
          <div className="p-10 text-center text-sm text-cream/50">Your wallet is quiet — your first order will begin the story.</div>
        ) : (
          <div className="divide-y divide-cream/10">
            {history.map((o: any) => {
              const earned = o.points_earned ?? 0;
              const redeemed = o.points_redeemed ?? 0;
              if (!earned && !redeemed) return null;
              return (
                <div key={o.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm text-cream">Order #{o.order_number}</p>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-cream/40 mt-1">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    {earned > 0 && (
                      <div className="text-[11px] text-green-400 flex items-center justify-end gap-1">
                        <ArrowUpRight size={13} />+{formatINR(earned * pointValue)}
                      </div>
                    )}
                    {redeemed > 0 && (
                      <div className="text-[11px] text-gold flex items-center justify-end gap-1">
                        <ArrowDownLeft size={13} />−{formatINR(redeemed * pointValue)}
                      </div>
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

function TopUp({ icon: Icon, label, body }: { icon: any; label: string; body: string }) {
  return (
    <div className="border border-cream/10 bg-graphite/20 p-5">
      <Icon size={16} className="text-gold" />
      <p className="mt-3 text-sm text-cream">{label}</p>
      <p className="mt-1 text-[11px] text-cream/50">{body}</p>
    </div>
  );
}
