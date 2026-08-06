import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR, resolveImg } from "@/lib/format";
import { useCart } from "@/context/app-context";
import { Search, Mic, X, TrendingUp, History, ArrowRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = "mb_recent_searches";
const TRENDING_TAGS = [
  "Oud Reserve",
  "Kannauj Rose",
  "Saffron Night",
  "Pure Attar",
  "Amber Musk",
  "Gift Set",
  "Jasmine",
];

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // Ignore localStorage error
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 200);
    return () => clearTimeout(t);
  }, [q]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["mobile_search", debounced],
    queryFn: async () => {
      if (!debounced) return [];
      const term = `%${debounced}%`;
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, subtitle, fragrance_family, price_inr, compare_at_price_inr, image_url, rating, stock")
        .eq("is_published", true)
        .or(`name.ilike.${term},subtitle.ilike.${term},fragrance_family.ilike.${term}`)
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: debounced.length > 0,
  });

  const handleVoiceSearch = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported on this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQ(transcript);
      saveRecentSearch(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSelectSearch = (term: string) => {
    setQ(term);
    saveRecentSearch(term);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-0 z-50 bg-obsidian text-cream flex flex-col pt-safe pb-safe overflow-hidden"
      >
        {/* Top bar with back button & search field */}
        <div className="px-4 py-3 border-b border-cream/10 flex items-center gap-3 bg-graphite/40">
          <div className="relative flex-1 flex items-center">
            <Search size={18} className="absolute left-3 text-gold/80" />
            <input
              autoFocus
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveRecentSearch(q)}
              placeholder="Search by scent, note, or family..."
              className="w-full bg-obsidian border border-cream/15 rounded-full pl-10 pr-20 py-3 text-base text-cream placeholder-cream/40 focus:border-gold outline-none shadow-inner"
            />
            <div className="absolute right-3 flex items-center gap-2">
              {q ? (
                <button
                  onClick={() => setQ("")}
                  className="p-1.5 text-cream/50 hover:text-gold"
                  aria-label="Clear query"
                >
                  <X size={16} />
                </button>
              ) : (
                <button
                  onClick={handleVoiceSearch}
                  className={`p-1.5 rounded-full transition-all ${
                    isListening
                      ? "bg-gold text-obsidian animate-pulse"
                      : "text-gold hover:bg-gold/10"
                  }`}
                  title="Voice Search"
                >
                  <Mic size={16} />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-widest text-gold font-medium px-2 py-2"
          >
            Cancel
          </button>
        </div>

        {/* Search body content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Listening Overlay indicator */}
          {isListening && (
            <div className="bg-gold/10 border border-gold/40 rounded-xl p-4 flex items-center justify-center gap-3 text-gold">
              <Mic size={20} className="animate-bounce" />
              <span className="text-sm font-medium">Listening for your fragrance preference...</span>
            </div>
          )}

          {/* If no active search query, show Recent and Trending searches */}
          {!q && (
            <>
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-cream/50 flex items-center gap-1.5">
                      <History size={12} className="text-gold" /> Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] uppercase tracking-wider text-gold/70 hover:text-gold"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSelectSearch(s)}
                        className="bg-graphite/60 border border-cream/10 rounded-full px-3.5 py-1.5 text-xs text-cream/80 hover:border-gold hover:text-gold flex items-center gap-1.5 transition-all"
                      >
                        <span>{s}</span>
                        <ArrowRight size={10} className="text-cream/40" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-cream/50 flex items-center gap-1.5 mb-3">
                  <TrendingUp size={12} className="text-gold" /> Trending Fragrances
                </span>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSelectSearch(tag)}
                      className="bg-graphite/40 border border-gold/30 rounded-full px-3.5 py-2 text-xs text-gold hover:bg-gold hover:text-obsidian font-medium transition-all shadow-sm"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Results section */}
          {q && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cream/50 mb-4">
                {isLoading
                  ? "Searching archive..."
                  : `${results.length} result${results.length === 1 ? "" : "s"} found`}
              </p>

              {!isLoading && results.length === 0 && (
                <div className="text-center py-16 text-cream/50 font-serif italic">
                  No fragrance matches "{q}". Try searching by family (Oud, Rose, Amber).
                </div>
              )}

              <div className="space-y-3">
                {results.map((product) => (
                  <div
                    key={product.id}
                    className="bg-graphite/40 border border-cream/10 rounded-xl p-3 flex items-center gap-3.5 hover:border-gold/50 transition-all"
                  >
                    <Link
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      onClick={onClose}
                      className="shrink-0"
                    >
                      <img
                        src={resolveImg(product.image_url)}
                        alt={product.name}
                        className="w-16 h-20 object-cover rounded-md bg-obsidian"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-gold font-semibold">
                        {product.fragrance_family}
                      </span>
                      <Link
                        to="/product/$slug"
                        params={{ slug: product.slug }}
                        onClick={onClose}
                        className="block truncate font-serif text-lg text-cream hover:text-gold"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-cream/50 truncate">{product.subtitle}</p>
                      <p className="text-gold font-serif text-sm mt-1">
                        {formatINR(product.price_inr)}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(product.id, 1)}
                      disabled={product.stock <= 0}
                      className="touch-target rounded-full bg-gold/10 border border-gold/40 text-gold hover:bg-gold hover:text-obsidian transition-colors shrink-0"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
