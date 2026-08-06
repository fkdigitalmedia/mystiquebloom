import { Sparkles, Heart, Flame } from "lucide-react";

interface MobileProductNotesProps {
  topNotes?: string[] | null;
  heartNotes?: string[] | null;
  baseNotes?: string[] | null;
}

export function MobileProductNotes({
  topNotes,
  heartNotes,
  baseNotes,
}: MobileProductNotesProps) {
  if (!topNotes?.length && !heartNotes?.length && !baseNotes?.length) {
    return null;
  }

  const sections = [
    {
      title: "Top Notes",
      subtitle: "First Impression (0-30 mins)",
      notes: topNotes,
      icon: Sparkles,
      color: "from-amber-500/10 to-transparent",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Heart Notes",
      subtitle: "The Scent Soul (1-4 hours)",
      notes: heartNotes,
      icon: Heart,
      color: "from-rose-500/10 to-transparent",
      borderColor: "border-rose-500/20",
    },
    {
      title: "Base Notes",
      subtitle: "Deep Memory (4-12+ hours)",
      notes: baseNotes,
      icon: Flame,
      color: "from-yellow-600/10 to-transparent",
      borderColor: "border-yellow-600/20",
    },
  ];

  return (
    <div className="py-6 border-t border-cream/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-2xl text-cream tracking-wide">Fragrance Notes</h3>
        <span className="text-[10px] uppercase tracking-[0.25em] text-gold">Scent Pyramid</span>
      </div>

      <div className="grid gap-3">
        {sections.map(
          (sec) =>
            sec.notes &&
            sec.notes.length > 0 && (
              <div
                key={sec.title}
                className={`p-4 rounded-xl bg-gradient-to-r ${sec.color} border ${sec.borderColor} bg-graphite/40`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gold/10 grid place-items-center text-gold border border-gold/30">
                    <sec.icon size={14} />
                  </div>
                  <div>
                    <p className="font-serif text-base text-cream leading-none">{sec.title}</p>
                    <p className="text-[9px] uppercase tracking-wider text-cream/40 mt-0.5">
                      {sec.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sec.notes.map((note) => (
                    <span
                      key={note}
                      className="bg-obsidian/80 border border-cream/15 text-cream/90 text-xs px-3 py-1 rounded-full font-medium shadow-sm"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
