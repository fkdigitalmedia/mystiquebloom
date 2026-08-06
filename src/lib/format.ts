export const formatINR = (paiseOrRupees: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paiseOrRupees);

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import heroBottle from "@/assets/hero-bottle.jpg";
import atelier from "@/assets/atelier.jpg";
import giftBox from "@/assets/gift-box.jpg";
import collectionOud from "@/assets/collection-oud.jpg";
import collectionFloral from "@/assets/collection-floral.jpg";
import collectionSpice from "@/assets/collection-spice.jpg";
import collectionAttar from "@/assets/collection-attar.jpg";

const IMG_MAP: Record<string, string> = {
  "/src/assets/product-1.jpg": product1,
  "/src/assets/product-2.jpg": product2,
  "/src/assets/product-3.jpg": product3,
  "/src/assets/product-4.jpg": product4,
  "/src/assets/hero-bottle.jpg": heroBottle,
  "/src/assets/atelier.jpg": atelier,
  "/src/assets/gift-box.jpg": giftBox,
  "/src/assets/collection-oud.jpg": collectionOud,
  "/src/assets/collection-floral.jpg": collectionFloral,
  "/src/assets/collection-spice.jpg": collectionSpice,
  "/src/assets/collection-attar.jpg": collectionAttar,

  "product-1.jpg": product1,
  "product-2.jpg": product2,
  "product-3.jpg": product3,
  "product-4.jpg": product4,
  "hero-bottle.jpg": heroBottle,
  "atelier.jpg": atelier,
  "gift-box.jpg": giftBox,
  "collection-oud.jpg": collectionOud,
  "collection-floral.jpg": collectionFloral,
  "collection-spice.jpg": collectionSpice,
  "collection-attar.jpg": collectionAttar,
};

export const resolveImg = (src?: string | null) => {
  if (!src) return heroBottle;
  if (IMG_MAP[src]) return IMG_MAP[src];
  const cleanSrc = src.replace(/^\.?\/?src\/assets\//, "");
  if (IMG_MAP[cleanSrc]) return IMG_MAP[cleanSrc];
  return src;
};
