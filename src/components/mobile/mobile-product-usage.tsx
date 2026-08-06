import { Sparkles, Sun, Droplets, Compass } from "lucide-react";

export function MobileProductUsage() {
  const usageSteps = [
    {
      icon: Compass,
      title: "How To Apply",
      desc: "Hold bottle 6 inches away and spray lightly. For attar oils, dab gently without rubbing.",
    },
    {
      icon: Droplets,
      title: "Where To Spray",
      desc: "Target pulse points: inner wrists, base of neck, behind ears, and inner elbows.",
    },
    {
      icon: Sun,
      title: "Best Time To Use",
      desc: "Ideal after a warm shower on clean, moisturized skin for maximum 12+ hour sillage.",
    },
  ];

  return (
    <div className="py-6 border-t border-cream/10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-gold" />
        <h3 className="font-serif text-2xl text-cream tracking-wide">Usage & Application</h3>
      </div>

      <div className="grid gap-3">
        {usageSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="p-4 rounded-xl bg-graphite/40 border border-cream/10 flex items-start gap-3.5 hover:border-gold/30 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold grid place-items-center shrink-0 border border-gold/25 mt-0.5">
                <Icon size={18} />
              </div>
              <div>
                <p className="font-serif text-base text-cream">{step.title}</p>
                <p className="text-xs text-cream/60 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
