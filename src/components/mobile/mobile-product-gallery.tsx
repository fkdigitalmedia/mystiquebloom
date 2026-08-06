import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Heart, Maximize2, Play, X, ShieldCheck } from "lucide-react";
import { resolveImg } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";

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

  // Combine primary image and additional gallery images
  const allImages = [
    resolveImg(product.image_url),
    ...(product.images || []).map((img) => resolveImg(img)),
  ].filter(Boolean);

  // If only 1 image, duplicate slightly for swipe demo or keep single
  const displayImages = allImages.length > 0 ? allImages : ["/placeholder.jpg"];

  useState(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
  });

  return (
    <div className="relative w-full bg-graphite/40 overflow-hidden">
      {/* Swipeable Carousel Container */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {displayImages.map((src, idx) => (
            <div
              key={idx}
              className="relative flex-[0_0_100%] min-w-0 aspect-[4/5] sm:aspect-square bg-graphite"
            >
              <img
                src={src}
                alt={`${product.name} - view ${idx + 1}`}
                className="w-full h-full object-cover select-none"
                loading={idx === 0 ? "eager" : "lazy"}
                onClick={() => setLightboxOpen(true)}
              />
              {/* Optional Video Badge */}
              {product.video_url && idx === 0 && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-4 left-4 bg-obsidian/80 backdrop-blur-md border border-gold/40 text-gold px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-lg"
                >
                  <Play size={12} fill="currentColor" /> Watch Video
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating Top-Right Wishlist Button */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onToggleWishlist}
        aria-label="Save to Wishlist"
        className={`absolute top-4 right-4 z-10 w-12 h-12 rounded-full grid place-items-center shadow-2xl backdrop-blur-md transition-all ${
          isWished
            ? "bg-gold text-obsidian shadow-gold/30"
            : "bg-obsidian/70 border border-cream/20 text-cream hover:border-gold hover:text-gold"
        }`}
      >
        <Heart size={20} fill={isWished ? "currentColor" : "none"} strokeWidth={1.8} />
      </motion.button>

      {/* Floating Bottom-Left Lightbox Expand Button */}
      <button
        onClick={() => setLightboxOpen(true)}
        aria-label="Expand image"
        className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-obsidian/70 backdrop-blur-md border border-cream/20 text-cream grid place-items-center"
      >
        <Maximize2 size={16} />
      </button>

      {/* Image Index Counter Pill */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-obsidian/80 backdrop-blur-md border border-cream/15 text-cream px-3 py-1 rounded-full text-[11px] font-mono tracking-widest">
          {currentIndex + 1} / {displayImages.length}
        </div>
      )}

      {/* Full-Screen Lightbox Modal with Pinch-to-Zoom support */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4"
          >
            {/* Lightbox header */}
            <div className="flex items-center justify-between pt-safe px-2">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                {product.name}
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-graphite/80 text-cream grid place-items-center hover:text-gold"
              >
                <X size={20} />
              </button>
            </div>

            {/* Lightbox image with pinch touch scroll */}
            <div className="flex-1 flex items-center justify-center overflow-auto py-4">
              <img
                src={displayImages[currentIndex]}
                alt={product.name}
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
              />
            </div>

            {/* Lightbox footer counter */}
            <div className="pb-safe text-center">
              <p className="text-xs text-cream/60">Pinch or double tap to zoom</p>
              <div className="mt-2 flex justify-center gap-1.5">
                {displayImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentIndex ? "w-6 bg-gold" : "w-1.5 bg-cream/30"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
