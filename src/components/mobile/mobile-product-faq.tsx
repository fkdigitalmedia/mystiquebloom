import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "Are Mystique Blends fragrances long lasting?",
    a: "Yes! Our fragrances are formulated as Extrait de Parfum and 100% concentrated pure attar oils, yielding an average wear time of 10 to 14 hours on skin and up to 24 hours on clothing.",
  },
  {
    q: "Is Cash on Delivery (COD) available for my order?",
    a: "Yes, Cash on Delivery is available across 25,000+ PIN codes in India. You can pay in cash upon doorstep delivery.",
  },
  {
    q: "What is your 30-Day return policy?",
    a: "We offer a 30-day hassle-free return guarantee. Every fragrance box includes a complimentary 2ml sample vial—try the sample first, and if you are not satisfied, return the unopened full bottle for a full refund.",
  },
  {
    q: "Are these attars 100% alcohol-free and skin friendly?",
    a: "Our pure attars are 100% alcohol-free, hydro-distilled in traditional Kannauj copper degs, and IFRA compliant for sensitive skin.",
  },
];

export function MobileProductFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="py-6 border-t border-cream/10">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle size={18} className="text-gold" />
        <h3 className="font-serif text-2xl text-cream tracking-wide">Frequently Asked Questions</h3>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl bg-graphite/40 border border-cream/10 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left"
              >
                <span className="font-serif text-base text-cream">{faq.q}</span>
                <span className="text-gold shrink-0">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-4 pb-4 text-xs text-cream/70 leading-relaxed border-t border-cream/5 pt-2"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
