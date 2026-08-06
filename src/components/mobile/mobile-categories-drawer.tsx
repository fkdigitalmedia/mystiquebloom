import { Drawer } from "vaul";
import { Link } from "@tanstack/react-router";
import { Sparkles, ChevronRight, Gift, Flame, Feather, Compass } from "lucide-react";

interface MobileCategoriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  {
    name: "All Fragrances",
    href: "/shop",
    description: "Explore our full Kannauj luxury collection",
    icon: Compass,
  },
  {
    name: "Oud Reserve",
    href: "/shop/$slug",
    params: { slug: "oud-reserve" },
    description: "Deep, resinous & regal aged agarwood blends",
    icon: Flame,
  },
  {
    name: "Rare Attars",
    href: "/shop/$slug",
    params: { slug: "rare-attars" },
    description: "Hand-distilled 100% pure alcohol-free oils",
    icon: Feather,
  },
  {
    name: "Luxury Gift Sets",
    href: "/gift-builder",
    description: "Custom hand-crafted velvet fragrance boxes",
    icon: Gift,
  },
];

const FRAGRANCE_FAMILIES = [
  { name: "Oud & Woody", slug: "oud-woody", color: "from-amber-900/40 to-black" },
  { name: "Rose & Floral", slug: "rose-floral", color: "from-rose-950/40 to-black" },
  { name: "Amber & Saffron", slug: "amber-saffron", color: "from-yellow-950/40 to-black" },
  { name: "Musk & Earthy", slug: "musk-earthy", color: "from-stone-900/40 to-black" },
];

export function MobileCategoriesDrawer({ isOpen, onClose }: MobileCategoriesDrawerProps) {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-obsidian text-cream rounded-t-[28px] max-h-[85vh] border-t border-gold/30 pt-3 pb-safe shadow-2xl">
          <div className="mx-auto w-12 h-1.5 rounded-full bg-cream/20 mb-4" />

          <div className="px-6 py-2 border-b border-cream/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-gold" />
              <h2 className="font-serif text-xl text-cream tracking-wide">Explore Fragrances</h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold/80 bg-gold/10 px-2.5 py-1 rounded-full border border-gold/20">
              Kannauj 1962
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Primary navigation cards */}
            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.name}
                    to={cat.href as any}
                    params={cat.params}
                    onClick={onClose}
                    className="flex items-center justify-between p-4 rounded-xl bg-graphite/40 border border-cream/10 hover:border-gold/50 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-gold/10 grid place-items-center text-gold border border-gold/20 group-hover:bg-gold group-hover:text-obsidian transition-colors">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="font-serif text-lg text-cream group-hover:text-gold transition-colors">
                          {cat.name}
                        </p>
                        <p className="text-xs text-cream/50">{cat.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-cream/40 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>

            {/* Fragrance Families grid */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold font-semibold mb-3">
                Shop By Accord & Family
              </p>
              <div className="grid grid-cols-2 gap-3">
                {FRAGRANCE_FAMILIES.map((fam) => (
                  <Link
                    key={fam.slug}
                    to="/shop"
                    onClick={onClose}
                    className={`p-4 rounded-xl border border-cream/15 bg-gradient-to-br ${fam.color} hover:border-gold transition-all`}
                  >
                    <p className="font-serif text-base text-cream">{fam.name}</p>
                    <span className="text-[9px] uppercase tracking-widest text-gold/80 mt-2 inline-block">
                      Discover →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
