import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Heart, Maximize2, Play, X, Share2, Check } from "lucide-react";
import { resolveImg } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface MobileProductGalleryProps {
  product: {
    id: string;
    name: string;
    image_url: string | null;
    images?: string[];
    video_url?: string | null;
  };
  isWished: boolean;
  onToggleWishlist: () => void;
}

export function MobileProductGallery({
  product,
  isWished,
  onToggleWishlist,
}: MobileProductGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Combine primary image and additional gallery images
  const allImages = [
    resolveImg(product.image_url),
    ...(product.images || []).map((img) => resolveImg(img)),
  ].filter(Boolean);

  const displayImages = allImages.length > 0 ? allImages : ["/placeholder.jpg"];

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
  }, [emblaApi]);

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on Mystique Blends`,
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // Fallback to copy if user cancelled
      }
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      toast.success("Fragrance link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative w-full bg-graphite/40 overflow-hidden">
      {/* Swipeable Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {displayImages.map((src, idx) => (
            <div
              key={idx}
              className="relative flex-[0_0_100%] min-w-0 aspect-[4/5] bg-graphite"
            >
              <img
                src={src}
                alt={`${product.name} - view ${idx + 1}`}
                className="w-full h-full object-cover select-none cursor-pointer"
                loading={idx === 0 ? "eager" : "lazy"}
                onClick={() => setLightboxOpen(true)}
              />
              {/* Optional Video Badge */}
              {product.video_url && idx === 0 && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-5 left-4 z-10 bg-obsidian/85 backdrop-blur-md border border-gold/40 text-gold px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-xl"
                >
                  <Play size={12} fill="currentColor" /> Watch Video
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Overlays - Heart, Share & Zoom Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2.5">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={onToggleWishlist}
          aria-label="Save to Wishlist"
          className={`w-11 h-11 rounded-full grid place-items-center shadow-2xl backdrop-blur-md transition-all ${
            isWished
              ? "bg-gold text-obsidian shadow-gold/40"
              : "bg-obsidian/70 border border-cream/20 text-cream hover:border-gold hover:text-gold"
          }`}
        >
          <Heart size={18} fill={isWished ? "currentColor" : "none"} strokeWidth={1.8} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleShare}
          aria-label="Share fragrance"
          className="w-11 h-11 rounded-full bg-obsidian/70 backdrop-blur-md border border-cream/20 text-cream grid place-items-center hover:border-gold hover:text-gold shadow-2xl transition-all"
        >
          {copied ? <Check size={16} className="text-gold" /> : <Share2 size={16} />}
        </motion.button>

        <button
          onClick={() => setLightboxOpen(true)}
          aria-label="Expand image"
          className="w-11 h-11 rounded-full bg-obsidian/70 backdrop-blur-md border border-cream/20 text-cream grid place-items-center hover:border-gold hover:text-gold shadow-2xl transition-all"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* Pagination Dots & Counter */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-obsidian/75 backdrop-blur-md border border-cream/15 px-3 py-1 rounded-full">
          <div className="flex gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentIndex ? "w-5 bg-gold" : "w-1.5 bg-cream/30"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-cream/70 border-l border-cream/20 pl-2">
            {currentIndex + 1}/{displayImages.length}
          </span>
        </div>
      )}

      {/* Full-Screen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4"
          >
            <div className="flex items-center justify-between pt-safe px-2">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold truncate">
                {product.name}
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-graphite/80 text-cream grid place-items-center hover:text-gold"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-auto py-4">
              <img
                src={displayImages[currentIndex]}
                alt={product.name}
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>

            <div className="pb-safe text-center">
              <p className="text-xs text-cream/60">Pinch or double tap to zoom</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
