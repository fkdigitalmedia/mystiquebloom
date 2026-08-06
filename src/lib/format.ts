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

const IMG_MAP: Record<string, string> = {
  "/src/assets/product-1.jpg": product1,
  "/src/assets/product-2.jpg": product2,
  "/src/assets/product-3.jpg": product3,
  "/src/assets/product-4.jpg": product4,
  "/src/assets/hero-bottle.jpg": heroBottle,
  "/src/assets/atelier.jpg": atelier,
  "/src/assets/gift-box.jpg": giftBox,
};

export const resolveImg = (src?: string | null) =>
  (src && IMG_MAP[src]) || src || heroBottle;
