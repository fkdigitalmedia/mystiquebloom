import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import {
  useLoyaltySettings,
  DEFAULT_LOYALTY,
  useLoyaltyPageSettings,
  DEFAULT_LOYALTY_PAGE,
} from "@/lib/use-site-settings";
import { useAuth } from "@/context/app-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/loyalty")({
  head: () => ({
    meta: [
      { title: "The Mystique Circle · Loyalty Rewards" },
      {
        name: "description",
        content:
          "Earn points on every fragrance. Ascend through Ivory, Gold and Noir tiers for priority shipping, private launches and atelier perks.",
      },
      { property: "og:title", content: "The Mystique Circle · Loyalty" },
      {
        property: "og:description",
        content: "A private rewards programme for Mystique Blends patrons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoyaltyPage,
});

function interpolate(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`));
}

function LoyaltyPage() {
  const { data: settings } = useLoyaltySettings();
  const { data: pageData } = useLoyaltyPageSettings();
  const { user } = useAuth();
  const s = settings ?? DEFAULT_LOYALTY;
  const page = pageData ?? DEFAULT_LOYALTY_PAGE;

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id, "loyalty"],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("loyalty_points, full_name")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const points = profile?.loyalty_points ?? 0;
  const tiers = s.tiers;
  const currentTier =
    [...tiers].reverse().find((t) => points >= t.minPoints) ?? tiers[0];
  const nextTier = tiers.find((t) => t.minPoints > points);
  const toNext = nextTier ? nextTier.minPoints - points : 0;

  const stepVars = {
    earnPerRupee: s.earnPerRupee,
    pointValue: s.pointValue,
    redeemCapPct: s.redeemCapPct,
  };

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative border-b border-cream/10">
          <div className="mx-auto max-w-5xl px-6 py-24 text-center">
            <p className="text-[0.7rem] uppercase tracking-[0.5em] text-gold">
              {page.hero.eyebrow}
            </p>
            <h1 className="mt-6 font-display text-5xl md:text-7xl leading-[0.95]">
              {page.hero.title}{" "}
              <em className="text-gold not-italic">{page.hero.titleHighlight}</em>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-cream/70">
              {page.hero.subtitle}
            </p>
            {!user && (
              <div className="mt-10 flex justify-center gap-4">
                <Link
                  to={page.hero.primaryCta?.href || "/auth"}
                  className="border border-gold bg-gold px-8 py-3 text-[0.7rem] uppercase tracking-[0.35em] text-obsidian hover:bg-transparent hover:text-gold transition"
                >
                  {page.hero.primaryCta?.label}
                </Link>
                <Link
                  to={page.hero.secondaryCta?.href || "/shop"}
                  className="border border-cream/30 px-8 py-3 text-[0.7rem] uppercase tracking-[0.35em] hover:border-gold hover:text-gold transition"
                >
                  {page.hero.secondaryCta?.label}
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Member status */}
        {user && (
          <section className="border-b border-cream/10 bg-graphite/30">
            <div className="mx-auto max-w-5xl px-6 py-16">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="border border-cream/10 p-8">
                  <p className="text-[0.65rem] uppercase tracking-[0.4em] text-cream/50">
                    Balance
                  </p>
                  <p className="mt-3 font-display text-4xl text-gold">
                    {points}
                    <span className="ml-2 text-sm uppercase tracking-[0.3em] text-cream/60">
                      pts
                    </span>
                  </p>
                </div>
                <div className="border border-cream/10 p-8">
                  <p className="text-[0.65rem] uppercase tracking-[0.4em] text-cream/50">
                    Current Tier
                  </p>
                  <p className="mt-3 font-display text-4xl">
                    {currentTier?.name}
                  </p>
                  {currentTier?.perk && (
                    <p className="mt-2 text-xs text-cream/60">
                      {currentTier.perk}
                    </p>
                  )}
                </div>
                <div className="border border-cream/10 p-8">
                  <p className="text-[0.65rem] uppercase tracking-[0.4em] text-cream/50">
                    Next Tier
                  </p>
                  {nextTier ? (
                    <>
                      <p className="mt-3 font-display text-4xl">
                        {nextTier.name}
                      </p>
                      <p className="mt-2 text-xs text-cream/60">
                        {toNext} pts to ascend
                      </p>
                    </>
                  ) : (
                    <p className="mt-3 font-display text-2xl text-gold">
                      Highest tier reached
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="border-b border-cream/10">
          <div className="mx-auto max-w-5xl px-6 py-24">
            <div className="text-center">
              <p className="text-[0.7rem] uppercase tracking-[0.5em] text-gold">
                {page.ritual.eyebrow}
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">
                {page.ritual.title}
              </h2>
            </div>
            <div className="mt-16 grid gap-10 md:grid-cols-3">
              {(page.ritual.steps ?? []).map((step) => (
                <div key={step.n} className="border-t border-cream/15 pt-8">
                  <p className="font-display text-3xl text-gold">{step.n}</p>
                  <h3 className="mt-4 font-display text-2xl">{step.t}</h3>
                  <p className="mt-3 text-sm text-cream/70 leading-relaxed">
                    {interpolate(step.d, stepVars)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section className="border-b border-cream/10 bg-graphite/30">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <div className="text-center">
              <p className="text-[0.7rem] uppercase tracking-[0.5em] text-gold">
                {page.tiersSection.eyebrow}
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">
                {page.tiersSection.title}
              </h2>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {tiers.map((tier, i) => {
                const isCurrent = user && currentTier?.name === tier.name;
                return (
                  <div
                    key={tier.name}
                    className={`relative border p-10 flex flex-col ${
                      isCurrent
                        ? "border-gold bg-obsidian"
                        : "border-cream/15 bg-obsidian/60"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-4 right-4 text-[0.6rem] uppercase tracking-[0.35em] text-gold">
                        Your Tier
                      </span>
                    )}
                    <p className="text-[0.65rem] uppercase tracking-[0.4em] text-cream/50">
                      Tier {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-4 font-display text-5xl">{tier.name}</h3>
                    <p className="mt-4 text-sm text-cream/60">
                      From{" "}
                      <span className="text-gold">{tier.minPoints} pts</span>
                    </p>
                    <div className="my-6 h-px bg-cream/10" />
                    <p className="text-sm text-cream/75 leading-relaxed">
                      {tier.perk ?? "Reserved privileges await."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto max-w-3xl px-6 py-24 text-center">
            <p className="text-[0.7rem] uppercase tracking-[0.5em] text-gold">
              {page.cta.eyebrow}
            </p>
            <h2 className="mt-6 font-display text-4xl md:text-5xl leading-tight">
              {page.cta.title}
            </h2>
            <p className="mt-6 text-cream/70">{page.cta.body}</p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to={page.cta.primary?.href || "/shop"}
                className="border border-gold bg-gold px-8 py-3 text-[0.7rem] uppercase tracking-[0.35em] text-obsidian hover:bg-transparent hover:text-gold transition"
              >
                {page.cta.primary?.label}
              </Link>
              {user && page.cta.secondary?.label && (
                <Link
                  to={page.cta.secondary?.href || "/account"}
                  className="border border-cream/30 px-8 py-3 text-[0.7rem] uppercase tracking-[0.35em] hover:border-gold hover:text-gold transition"
                >
                  {page.cta.secondary?.label}
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
