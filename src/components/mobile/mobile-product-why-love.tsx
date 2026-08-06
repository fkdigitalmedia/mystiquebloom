import { Clock, Droplets, Package, ShieldCheck, Sparkles } from "lucide-react";

export function MobileProductWhyLove() {
  const highlights = [
    {
      icon: Clock,
      title: "Long Lasting",
      desc: "12+ Hours Scent Trail",
    },
    {
      icon: Droplets,
      title: "Imported Oils",
      desc: "Kannauj & Grasse Elixirs",
    },
    {
      icon: Package,
      title: "Luxury Packaging",
      desc: "Velvet Box & Gold Seal",
    },
    {
      icon: ShieldCheck,
      title: "Skin Friendly",
      desc: "100% IFRA Compliant",
    },
  ];

  return (
    <div className="py-6 border-t border-cream/10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={18} className="text-gold" />
        <h3 className="font-serif text-2xl text-cream tracking-wide">Why You'll Love It</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="p-3.5 rounded-xl bg-graphite/40 border border-cream/10 flex items-start gap-3 hover:border-gold/40 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold grid place-items-center shrink-0 border border-gold/20 mt-0.5">
                <Icon size={16} />
              </div>
              <div>
                <p className="font-medium text-xs text-cream">{item.title}</p>
                <p className="text-[10px] text-cream/50 mt-0.5 leading-tight">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
