import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  ChevronRight,
  Star,
  Sparkles,
  Truck,
  ShieldCheck,
  Gift,
  Award,
  Leaf,
  Instagram,
  Facebook,
} from "lucide-react";

import heroBottle from "@/assets/hero-bottle.jpg";
import atelier from "@/assets/atelier.jpg";
import giftBox from "@/assets/gift-box.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import collectionOud from "@/assets/collection-oud.jpg";
import collectionFloral from "@/assets/collection-floral.jpg";
import collectionSpice from "@/assets/collection-spice.jpg";
import collectionAttar from "@/assets/collection-attar.jpg";

import { SiteHeader, SiteFooter } from "@/components/site-header";
import { useHomepageSettings } from "@/lib/use-site-settings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/app-context";
import { resolveImg } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Mystique Blends — Luxury Attars & Perfumes, Distilled with Heritage",
      },
      {
        name: "description",
        content:
          "Discover Mystique Blends: rare oud, hand-distilled attars, and modern luxury perfumes crafted in small batches. Free shipping on orders above ₹8,500.",
      },
      {
        property: "og:title",
        content: "Mystique Blends — Luxury Attars & Perfumes",
      },
      {
        property: "og:description",
        content:
          "Rare oud, hand-distilled attars, and modern luxury perfumes crafted in small batches.",
      },
    ],
  }),
  component: Home,
});

/* ------------------------------------------------------------------ */
/*  DEMO CONTENT — admin will replace once Cloud + admin panel land.  */
/* ------------------------------------------------------------------ */

const ANNOUNCEMENTS = [
  "Complimentary Discovery Set on orders above ₹8,500",
  "Free express shipping across India",
  "Limited edition — Winter Oud releases December 15",
  "Use code MYSTIQUE10 for 10% off your first order",
];

const COLLECTIONS = [
  {
    name: "The Oud Reserve",
    tag: "12 fragrances",
    image: collectionOud,
    span: "lg:col-span-2 lg:row-span-2",
    aspect: "aspect-[4/5] lg:aspect-auto lg:h-full",
  },
  { name: "Rare Attars", tag: "9 fragrances", image: collectionAttar, span: "", aspect: "aspect-[4/5]" },
  { name: "Royal Florals", tag: "14 fragrances", image: collectionFloral, span: "", aspect: "aspect-[4/5]" },
  { name: "Spiced Orient", tag: "8 fragrances", image: collectionSpice, span: "", aspect: "aspect-[4/5]" },
  {
    name: "Signature Blends",
    tag: "The house legacy",
    image: heroBottle,
    span: "",
    aspect: "aspect-[4/5]",
  },
];

const FAMILIES = [
  { name: "Oud", note: "Deep · Resinous" },
  { name: "Floral", note: "Rose · Jasmine" },
  { name: "Woody", note: "Sandal · Cedar" },
  { name: "Spicy", note: "Saffron · Clove" },
  { name: "Amber", note: "Warm · Enveloping" },
  { name: "Musk", note: "Skin · Soft" },
  { name: "Fresh", note: "Citrus · Green" },
  { name: "Aquatic", note: "Marine · Clean" },
];

const BESTSELLERS = [
  {
    name: "Velvet Saffron",
    family: "Oriental · Spicy",
    price: 12500,
    original: 14000,
    image: product1,
    rating: 4.9,
    reviews: 214,
    badge: "Bestseller",
  },
  {
    name: "Midnight Oud",
    family: "Pure Attar Oil",
    price: 18200,
    image: product2,
    rating: 5.0,
    reviews: 168,
    badge: "New",
  },
  {
    name: "Noir de Deccan",
    family: "Woody · Smoky",
    price: 9800,
    original: 11500,
    image: product3,
    rating: 4.8,
    reviews: 302,
  },
  {
    name: "Imperial Amber",
    family: "Extrait de Parfum",
    price: 22000,
    image: product4,
    rating: 4.9,
    reviews: 91,
    badge: "Limited",
  },
];

const WHY = [
  { icon: Leaf, title: "Ethically Sourced", body: "Rose from Kannauj, oud from Assam, sandal from Mysore." },
  { icon: Award, title: "Master Distillers", body: "Third-generation atelier, hand-crafted in small batches." },
  { icon: Sparkles, title: "Long Wear", body: "8–12 hours of projection, all-day sillage." },
  { icon: ShieldCheck, title: "Skin Safe", body: "IFRA-compliant, dermatologist reviewed." },
  { icon: Truck, title: "White-Glove Delivery", body: "Free express shipping · silk-lined packaging." },
  { icon: Gift, title: "Bespoke Gifting", body: "Personalised engraving and handwritten notes." },
];

const OCCASIONS = ["Daily Wear", "Office", "Date Night", "Wedding", "Festival", "Travel", "Luxury Events"];

const TESTIMONIALS = [
  {
    quote:
      "Velvet Saffron is unlike anything I've worn. It opens like sunset over Jaisalmer and settles into a warm, private glow. I've never received so many compliments.",
    name: "Ananya Rao",
    role: "Verified Buyer · Mumbai",
    rating: 5,
  },
  {
    quote:
      "The Oud Reserve rewrote my expectations. This is genuine, aged oud — not a synthetic imitation. The packaging alone is worth the price.",
    name: "Rohan Mehta",
    role: "Verified Buyer · Bengaluru",
    rating: 5,
  },
  {
    quote:
      "I gifted my father the Imperial Amber for his birthday. He hasn't stopped wearing it. The handwritten card was a beautiful touch.",
    name: "Ishita Kapoor",
    role: "Verified Buyer · Delhi",
    rating: 5,
  },
];

/* ------------------------------------------------------------------ */

function Home() {
  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans overflow-x-hidden">
      <AnnouncementBar />
      <SiteHeader transparent />
      <main>
        <Hero />
        <BrandStory />
        <FeaturedCollections />
        <FragranceFamilies />
        <BestSellers />
        <NewArrivals />
        <GiftBuilder />
        <WhyChoose />
        <Testimonials />
        <InstagramFeed />
        <Faq />
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ================================================================== */
/*  ANNOUNCEMENT BAR                                                  */
/* ================================================================== */

function AnnouncementBar() {
  const { data } = useHomepageSettings();
  const items = data?.announcements?.length ? data.announcements : ANNOUNCEMENTS;
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [items.length]);
  return (
    <div className="bg-gold text-obsidian">
      <div className="mx-auto max-w-7xl px-6 h-9 flex items-center justify-center overflow-hidden">
        <p
          key={i}
          className="text-[11px] font-medium uppercase tracking-[0.28em] animate-fade-up"
        >
          {items[i]}
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  HEADER                                                            */
/* ================================================================== */

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-obsidian/85 backdrop-blur-xl border-b border-cream/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 h-20 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        {/* Left nav */}
        <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.22em] font-medium">
          <a href="#collections" className="gold-underline hover:text-gold transition-colors">Collections</a>
          <a href="#families" className="gold-underline hover:text-gold transition-colors">Fragrance Families</a>
          <a href="#gift" className="gold-underline hover:text-gold transition-colors">Gifting</a>
          <a href="#story" className="gold-underline hover:text-gold transition-colors">Atelier</a>
        </nav>
        <button
          onClick={() => setMenuOpen(true)}
          className="lg:hidden justify-self-start text-cream hover:text-gold"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Wordmark */}
        <a href="/" className="flex flex-col items-center leading-none">
          <span className="font-serif text-[22px] md:text-2xl tracking-[0.12em] text-cream">
            MYSTIQUE
          </span>
          <span className="font-serif italic text-gold text-xs tracking-[0.4em] -mt-0.5">
            blends
          </span>
        </a>

        {/* Right icons */}
        <div className="justify-self-end flex items-center gap-1 md:gap-2">
          <IconBtn label="Search"><Search size={17} /></IconBtn>
          <IconBtn label="Wishlist" hideOnMobile><Heart size={17} /></IconBtn>
          <IconBtn label="Account" hideOnMobile><User size={17} /></IconBtn>
          <button
            aria-label="Cart"
            className="ml-1 flex items-center gap-2 px-3 md:px-4 h-9 border border-cream/15 hover:border-gold hover:text-gold transition-colors"
          >
            <ShoppingBag size={15} />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Cart · 0</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-obsidian/95 backdrop-blur-xl lg:hidden animate-fade-up"
          onClick={() => setMenuOpen(false)}
        >
          <div className="pt-24 px-8 flex flex-col gap-8 text-lg font-serif">
            {["Collections", "Fragrance Families", "Gifting", "Atelier", "Blog", "Contact"].map((l) => (
              <a key={l} href="#" className="text-cream hover:text-gold">
                {l}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function IconBtn({
  children,
  label,
  hideOnMobile,
}: {
  children: React.ReactNode;
  label: string;
  hideOnMobile?: boolean;
}) {
  return (
    <button
      aria-label={label}
      className={`h-9 w-9 grid place-items-center text-cream hover:text-gold transition-colors ${
        hideOnMobile ? "hidden sm:grid" : ""
      }`}
    >
      {children}
    </button>
  );
}

/* ================================================================== */
/*  HERO                                                              */
/* ================================================================== */

function Hero() {
  const { data } = useHomepageSettings();
  const h = data?.hero;
  const eyebrow = h?.eyebrow ?? "The Winter Collection · 2026";
  const title = h?.title ?? "An heirloom, bottled.";
  const subtitle =
    h?.subtitle ??
    "Hand-distilled attars and modern parfums, crafted in Kannauj from heritage ingredients. Aged in vintage decanters. Made for those who know that a scent is a signature.";
  const primaryLabel = h?.primaryCtaLabel ?? "Explore Collection";
  const primaryHref = h?.primaryCtaHref ?? "/shop";
  const secondaryLabel = h?.secondaryCtaLabel ?? "Shop Bestsellers";
  const secondaryHref = h?.secondaryCtaHref ?? "#bestsellers";

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden -mt-20 pt-20">
      <div className="absolute inset-0">
        <img
          src={heroBottle}
          alt="Mystique Blends signature crystal bottle on black marble"
          width={1920}
          height={1200}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/70 to-obsidian/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 w-full py-24">
        <div className="max-w-2xl animate-fade-up">
          <div className="flex items-center gap-4 mb-8">
            <span className="h-px w-12 bg-gold" />
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-medium">
              {eyebrow}
            </span>
          </div>
          <h1 className="font-serif font-medium text-[13vw] sm:text-7xl md:text-8xl leading-[0.95] tracking-tight text-balance">
            {title}
          </h1>
          <p className="mt-8 max-w-lg text-cream/70 text-lg leading-relaxed text-pretty">
            {subtitle}
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <a
              href={primaryHref}
              className="gold-shimmer group inline-flex items-center gap-3 bg-gold text-obsidian px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] hover:bg-cream transition-colors"
            >
              {primaryLabel}
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href={secondaryHref}
              className="inline-flex items-center gap-3 border border-cream/25 text-cream px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] hover:border-gold hover:text-gold transition-colors"
            >
              {secondaryLabel}
            </a>
          </div>

          <div className="mt-16 flex flex-wrap gap-x-10 gap-y-4 text-[10px] uppercase tracking-[0.25em] text-cream/50">
            <span>· Handmade in Kannauj</span>
            <span>· 8–12 hr sillage</span>
            <span>· IFRA-compliant</span>
          </div>
        </div>
      </div>

      {/* corner ornament */}
      <div className="absolute bottom-8 right-8 hidden md:flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-cream/40">
        <span>Scroll</span>
        <span className="h-px w-16 bg-cream/20" />
      </div>
    </section>
  );
}

/* ================================================================== */
/*  BRAND STORY                                                       */
/* ================================================================== */

function BrandStory() {
  const { data } = useHomepageSettings();
  const s = data?.brandStory;
  const eyebrow = s?.eyebrow ?? "The House of Mystique";
  const title = s?.title ?? "Three generations at the still.";
  const body =
    s?.body ??
    "Our atelier still stands where it began — in the perfume capital of Kannauj, where copper vessels called deg-bhapka have coaxed essence from petal and wood for centuries. We source damask rose from Kannauj, wild oud from Assam, and pure sandalwood from Mysore.";

  return (
    <section id="story" className="py-28 md:py-40 border-t border-cream/5">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <div className="lg:col-span-5 order-2 lg:order-1">
          <div className="relative">
            <img
              src={atelier}
              alt="Master distiller pouring rose attar through a glass funnel"
              width={1408}
              height={1760}
              loading="lazy"
              className="w-full aspect-[4/5] object-cover"
            />
            <div className="absolute -bottom-6 -right-6 hidden md:block bg-gold text-obsidian px-6 py-4 max-w-[220px]">
              <p className="font-serif italic text-xl leading-tight">Since 1962</p>
              <p className="text-[10px] uppercase tracking-[0.25em] mt-1">Kannauj · India</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 order-1 lg:order-2">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
            {eyebrow}
          </span>
          <h2 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05] text-balance">
            {title}
          </h2>
          <p className="mt-8 text-cream/70 leading-relaxed text-lg max-w-xl text-pretty whitespace-pre-line">
            {body}
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
            <StoryStat number="62" label="Years crafting" />
            <StoryStat number="34" label="Master accords" />
            <StoryStat number="18mo+" label="Aged in-house" />
          </div>

          <a
            href="#"
            className="mt-10 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-gold gold-underline"
          >
            Read our story
            <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}

function StoryStat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl md:text-4xl text-gold">{number}</p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-cream/50">{label}</p>
    </div>
  );
}

/* ================================================================== */
/*  FEATURED COLLECTIONS (bento)                                      */
/* ================================================================== */

const FALLBACK_COLLECTION_IMAGES = [collectionOud, collectionAttar, collectionFloral, collectionSpice, heroBottle];

function FeaturedCollections() {
  const { data: collections } = useQuery({
    queryKey: ["home", "collections"],
    queryFn: async () => {
      const { data } = await supabase
        .from("collections")
        .select("id,slug,name,tagline,image_url,sort_order")
        .eq("is_published", true)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("name");
      return data ?? [];
    },
  });

  const items = collections ?? [];
  if (items.length === 0) return null;

  return (
    <section id="collections" className="py-24 md:py-32 border-t border-cream/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
              Curated Collections
            </span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-tight">
              Worlds within a bottle.
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-[11px] uppercase tracking-[0.28em] text-cream/60 gold-underline hover:text-gold self-start md:self-end"
          >
            View all collections →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 md:gap-5">
          {items.map((c: any, i: number) => {
            const span = i === 0 ? "lg:col-span-2 lg:row-span-2" : "";
            const aspect = i === 0 ? "aspect-[4/5] lg:aspect-auto lg:h-full" : "aspect-[4/5]";
            const image = resolveImg(c.image_url) || FALLBACK_COLLECTION_IMAGES[i % FALLBACK_COLLECTION_IMAGES.length];
            return (
              <Link
                key={c.id}
                to="/shop/$slug"
                params={{ slug: c.slug }}
                className={`group relative overflow-hidden bg-graphite ${span}`}
              >
                <img
                  src={image}
                  alt={c.name}
                  loading="lazy"
                  className={`w-full ${aspect} object-cover transition-transform duration-[1200ms] group-hover:scale-105`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/95 via-obsidian/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  {c.tagline && (
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">
                      {c.tagline}
                    </p>
                  )}
                  <h3 className="font-serif text-2xl md:text-3xl text-cream leading-tight">
                    {c.name}
                  </h3>
                  <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cream/70 group-hover:text-gold transition-colors">
                    Discover
                    <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  FRAGRANCE FAMILIES + OCCASIONS                                    */
/* ================================================================== */

function FragranceFamilies() {
  const { data: settings } = useHomepageSettings();
  const cfg = settings?.families ?? {};
  const items = (cfg.items && cfg.items.length ? cfg.items : FAMILIES) as { name: string; note?: string; href?: string }[];
  const occasions = (cfg.occasions && cfg.occasions.length
    ? cfg.occasions
    : OCCASIONS.map((label) => ({ label, href: undefined }))) as { label: string; href?: string }[];

  return (
    <section id="families" className="py-24 md:py-32 bg-graphite/40 border-y border-cream/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
            {cfg.eyebrow ?? "Shop by Fragrance Family"}
          </span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            {cfg.title ? (
              cfg.title
            ) : (
              <>Find your <span className="italic">olfactive signature</span>.</>
            )}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-cream/5">
          {items.map((f) => (
            <a
              key={f.name}
              href={f.href || "/shop"}
              className="group bg-obsidian aspect-square flex flex-col items-center justify-center p-6 hover:bg-graphite transition-colors relative"
            >
              <span className="font-serif text-2xl md:text-3xl text-cream group-hover:text-gold transition-colors">
                {f.name}
              </span>
              {f.note && (
                <span className="mt-2 text-[10px] uppercase tracking-[0.25em] text-cream/50">
                  {f.note}
                </span>
              )}
              <ChevronRight
                size={14}
                className="absolute bottom-4 right-4 text-cream/0 group-hover:text-gold group-hover:translate-x-1 transition-all"
              />
            </a>
          ))}
        </div>

        {occasions.length > 0 && (
          <div className="mt-16 flex flex-col items-center gap-6">
            <span className="text-[10px] uppercase tracking-[0.4em] text-cream/40">
              {cfg.occasionsLabel ?? "Or shop by occasion"}
            </span>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {occasions.map((o) => (
                <a
                  key={o.label}
                  href={o.href || "/shop"}
                  className="px-5 py-2 border border-cream/15 text-[11px] uppercase tracking-[0.22em] hover:border-gold hover:text-gold transition-colors"
                >
                  {o.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ================================================================== */
/*  BEST SELLERS                                                      */
/* ================================================================== */

function BestSellers() {
  const { data: live } = useQuery({
    queryKey: ["homepage", "bestsellers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, subtitle, fragrance_family, price_inr, compare_at_price_inr, image_url, rating, review_count, is_bestseller, is_new")
        .eq("is_published", true)
        .order("is_bestseller", { ascending: false })
        .order("rating", { ascending: false })
        .limit(4);
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const items = (live && live.length > 0)
    ? live.map((p) => ({
        id: p.id as string,
        slug: p.slug as string,
        name: p.name as string,
        family: (p.subtitle || p.fragrance_family || "Fragrance") as string,
        price: Number(p.price_inr) || 0,
        original: p.compare_at_price_inr ? Number(p.compare_at_price_inr) : undefined,
        image: resolveImg(p.image_url) || product1,
        rating: Number(p.rating) || 5,
        reviews: Number(p.review_count) || 0,
        badge: p.is_bestseller ? "Bestseller" : p.is_new ? "New" : undefined,
      }))
    : BESTSELLERS.map((p) => ({ ...p, id: undefined as string | undefined, slug: undefined as string | undefined }));

  return (
    <section id="bestsellers" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
              The Icons
            </span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-tight">
              Bestsellers of the house.
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-[11px] uppercase tracking-[0.28em] text-cream/60 gold-underline hover:text-gold self-start md:self-end"
          >
            View all fragrances →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {items.map((p) => (
            <ProductCard key={p.slug ?? p.name} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  NEW ARRIVALS                                                      */
/* ================================================================== */

function NewArrivals() {
  const { data } = useQuery({
    queryKey: ["homepage", "new-arrivals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, slug, name, subtitle, fragrance_family, price_inr, compare_at_price_inr, image_url, rating, review_count, is_bestseller, is_new, created_at")
        .eq("is_published", true)
        .order("is_new", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(4);
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const items = (data ?? []).map((p) => ({
    id: p.id as string,
    slug: p.slug as string,
    name: p.name as string,
    family: (p.subtitle || p.fragrance_family || "Fragrance") as string,
    price: Number(p.price_inr) || 0,
    original: p.compare_at_price_inr ? Number(p.compare_at_price_inr) : undefined,
    image: resolveImg(p.image_url) || product1,
    rating: Number(p.rating) || 5,
    reviews: Number(p.review_count) || 0,
    badge: p.is_new ? "New" : p.is_bestseller ? "Bestseller" : undefined,
  }));

  if (!items.length) return null;

  return (
    <section id="new-arrivals" className="py-24 md:py-32 border-t border-cream/10 bg-graphite/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
              Just Composed
            </span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-tight">
              New arrivals to the atelier.
            </h2>
            <p className="mt-4 text-cream/60 max-w-md text-sm">
              The latest chapters from our perfumers — fresh from the maceration cellar.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-[11px] uppercase tracking-[0.28em] text-cream/60 gold-underline hover:text-gold self-start md:self-end"
          >
            Discover the collection →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {items.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  p,
}: {
  p: { id?: string; name: string; family: string; price: number; original?: number; image: string; rating: number; reviews: number; badge?: string; slug?: string };
}) {
  const { addToCart, loading } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!p.id) {
      // Fallback demo item — navigate to shop
      window.location.href = "/shop";
      return;
    }
    setAdding(true);
    try {
      await addToCart(p.id, 1);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group">
      <div className="relative overflow-hidden bg-cream/[0.03] aspect-[4/5]">
        {p.slug ? (
          <Link
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="absolute inset-0 z-0"
            aria-label={p.name}
          >
            <img
              src={resolveImg(p.image)}
              alt={p.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
            />
          </Link>
        ) : (
          <img
            src={resolveImg(p.image)}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
          />
        )}
        {p.badge && (
          <span className="pointer-events-none absolute top-4 left-4 z-10 bg-gold text-obsidian px-3 py-1 text-[9px] uppercase tracking-[0.28em] font-semibold">
            {p.badge}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          aria-label="Add to wishlist"
          className="absolute top-4 right-4 z-10 h-9 w-9 grid place-items-center bg-obsidian/60 backdrop-blur text-cream hover:text-gold border border-cream/10"
        >
          <Heart size={14} />
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || loading}
          className="absolute inset-x-0 bottom-0 z-10 py-4 bg-gold text-obsidian text-[10px] uppercase tracking-[0.3em] font-semibold md:translate-y-full md:group-hover:translate-y-0 translate-y-0 transition-transform duration-500 disabled:opacity-70"
        >
          {adding ? "Adding…" : `Quick Add · ₹${p.price.toLocaleString("en-IN")}`}
        </button>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {p.slug ? (
            <Link to="/product/$slug" params={{ slug: p.slug }} className="block">
              <h3 className="font-serif text-xl text-cream truncate hover:text-gold transition-colors">{p.name}</h3>
            </Link>
          ) : (
            <h3 className="font-serif text-xl text-cream truncate">{p.name}</h3>
          )}
          <p className="text-[10px] uppercase tracking-[0.22em] text-cream/50 mt-1">
            {p.family}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  fill={i < Math.round(p.rating) ? "currentColor" : "none"}
                  strokeWidth={1}
                />
              ))}
            </div>
            <span className="text-[10px] text-cream/50">
              {p.rating} · {p.reviews}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-serif text-lg text-cream">
            ₹{p.price.toLocaleString("en-IN")}
          </p>
          {p.original && (
            <p className="text-[10px] text-cream/40 line-through">
              ₹{p.original.toLocaleString("en-IN")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/* ================================================================== */
/*  GIFT BUILDER                                                      */
/* ================================================================== */

function GiftBuilder() {
  return (
    <section id="gift" className="py-24 md:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 border border-cream/10">
          <div className="relative min-h-[420px] lg:min-h-[560px]">
            <img
              src={giftBox}
              alt="Mystique Blends bespoke gift box with silk ribbon and three crystal vials"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="p-10 md:p-16 flex flex-col justify-center bg-graphite/40 backdrop-blur">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
              The Bespoke Atelier
            </span>
            <h2 className="mt-6 font-serif text-4xl md:text-5xl leading-[1.05] text-balance">
              Compose your own <span className="italic">sensory portrait</span>.
            </h2>
            <p className="mt-6 text-cream/70 leading-relaxed max-w-md text-pretty">
              Select three fragrances, choose your finish, and add a handwritten
              note. We nest them in silk, tie them with cream ribbon, and seal it
              with wax.
            </p>

            <ul className="mt-8 space-y-3 text-sm text-cream/80">
              {[
                "Choose 3 · Parfum, Attar or Mist",
                "Complimentary engraving",
                "Handwritten card by our atelier",
                "Silk-lined signature box",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-2 h-px w-4 bg-gold shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/gift-builder"
                className="gold-shimmer inline-flex items-center gap-3 bg-gold text-obsidian px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] hover:bg-cream transition-colors"
              >
                Build a Gift Set
                <ChevronRight size={14} />
              </Link>
              <Link
                to="/gift-builder"
                className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-cream/70 gold-underline hover:text-gold"
              >
                Corporate Gifting
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  WHY CHOOSE                                                        */
/* ================================================================== */

function WhyChoose() {
  return (
    <section className="py-24 md:py-32 border-t border-cream/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
            Why Mystique
          </span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-tight">
            Uncompromising, from petal to bottle.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-cream/5">
          {WHY.map((w) => (
            <div
              key={w.title}
              className="bg-obsidian p-8 md:p-10 group hover:bg-graphite/40 transition-colors"
            >
              <div className="w-12 h-12 border border-gold/40 text-gold grid place-items-center mb-6 group-hover:bg-gold group-hover:text-obsidian transition-colors">
                <w.icon size={18} strokeWidth={1.25} />
              </div>
              <h3 className="font-serif text-2xl text-cream mb-3">{w.title}</h3>
              <p className="text-cream/60 text-sm leading-relaxed">{w.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  TESTIMONIALS                                                      */
/* ================================================================== */

function Testimonials() {
  const { data } = useHomepageSettings();
  const cfg = data?.testimonials;
  const items = cfg?.items?.length ? cfg.items : TESTIMONIALS;
  const eyebrow = cfg?.eyebrow ?? "The Salon";
  const title = cfg?.title ?? "Words from our patrons.";
  return (
    <section className="py-24 md:py-32 bg-graphite/40 border-y border-cream/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
            {eyebrow}
          </span>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {items.map((t, i) => (
            <figure
              key={`${t.name}-${i}`}
              className="bg-obsidian border border-cream/10 p-8 md:p-10 flex flex-col"
            >
              <div className="flex gap-0.5 text-gold mb-6">
                {Array.from({ length: Math.max(0, Math.min(5, t.rating ?? 5)) }).map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="font-serif italic text-lg md:text-xl text-cream/90 leading-relaxed flex-1">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-8 pt-6 border-t border-cream/10">
                <p className="text-sm text-cream">{t.name}</p>
                {t.role && (
                  <p className="text-[10px] uppercase tracking-[0.25em] text-cream/50 mt-1">
                    {t.role}
                  </p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  INSTAGRAM FEED                                                    */
/* ================================================================== */

const DEFAULT_INSTAGRAM: { image: string; href?: string; caption?: string }[] = [
  { image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80", caption: "The Oud Reserve" },
  { image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80", caption: "Kannauj atelier" },
  { image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80", caption: "Rare attars" },
  { image: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80", caption: "Winter releases" },
  { image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80", caption: "Behind the still" },
  { image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80", caption: "Gift editions" },
];

function InstagramFeed() {
  const { data } = useHomepageSettings();
  const ig = data?.instagram;
  const eyebrow = ig?.eyebrow ?? "@mystiqueblends";
  const title = ig?.title ?? "From the atelier";
  const handle = ig?.handle ?? "https://instagram.com/";
  const items = ig?.items && ig.items.length ? ig.items : DEFAULT_INSTAGRAM;

  return (
    <section className="py-24 md:py-32 border-t border-cream/5">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold">{eyebrow}</span>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl leading-[1.05]">{title}</h2>
          </div>
          <a
            href={handle}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[11px] uppercase tracking-[0.3em] text-gold gold-underline"
          >
            Follow on Instagram
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          {items.map((it, i) => (
            <a
              key={i}
              href={it.href ?? handle}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative block aspect-square overflow-hidden bg-graphite"
            >
              <img
                src={it.image}
                alt={it.caption ?? "Mystique Blends on Instagram"}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-obsidian/50 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                <Instagram size={22} strokeWidth={1.25} className="text-gold" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  FAQ                                                               */
/* ================================================================== */

const DEFAULT_FAQ: { q: string; a: string }[] = [
  {
    q: "How long does a Mystique Blends fragrance last on skin?",
    a: "Our parfum concentrations project for 8–10 hours; hand-distilled attars can linger for 24 hours or more, developing intimately on your skin.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. We deliver worldwide via insured express couriers. Complimentary shipping applies to orders above ₹15,000; duties and taxes are calculated at checkout.",
  },
  {
    q: "Are your ingredients ethically sourced?",
    a: "Every raw material is traceable to its harvest. We work directly with growers in Kannauj, Mysore, and Assam, and never use synthetic musks or animal-derived civet.",
  },
  {
    q: "Can I return a fragrance if it does not suit me?",
    a: "Unopened bottles may be returned within 14 days for a full refund. For opened bottles, we offer a one-time exchange within our discovery guarantee.",
  },
  {
    q: "Do you offer bespoke or private commissions?",
    a: "Our master perfumers craft private compositions for a small number of patrons each year. Write to concierge@mystiqueblends.com to begin the conversation.",
  },
];

function Faq() {
  const { data } = useHomepageSettings();
  const [open, setOpen] = useState<number | null>(0);
  const f = data?.faq;
  const eyebrow = f?.eyebrow ?? "Questions";
  const title = f?.title ?? "The considered answers.";
  const items = f?.items && f.items.length ? f.items : DEFAULT_FAQ;

  return (
    <section className="py-24 md:py-32 border-t border-cream/5">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">{eyebrow}</span>
          <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-[1.05] text-balance">{title}</h2>
        </div>

        <div className="border-t border-cream/10">
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-cream/10">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg md:text-xl text-cream group-hover:text-gold transition-colors">
                    {it.q}
                  </span>
                  <span
                    className={`shrink-0 h-8 w-8 grid place-items-center border transition-all ${
                      isOpen ? "border-gold text-gold rotate-45" : "border-cream/20 text-cream/60"
                    }`}
                    aria-hidden
                  >
                    <span className="text-lg leading-none">+</span>
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-cream/70 leading-relaxed max-w-2xl whitespace-pre-line">
                      {it.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  NEWSLETTER                                                        */
/* ================================================================== */

function Newsletter() {
  const { data } = useHomepageSettings();
  const n = data?.newsletter;
  const title = n?.title ?? "First access to rare harvests.";
  const body =
    n?.body ??
    "Private previews, seasonal releases, and invitations to our atelier events. No noise — one letter each month.";
  const cta = n?.cta ?? "Subscribe";
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
          The Inner Circle
        </span>
        <h2 className="mt-4 font-serif text-4xl md:text-6xl leading-[1.05] text-balance">
          {title}
        </h2>
        <p className="mt-6 text-cream/60 max-w-lg mx-auto text-pretty whitespace-pre-line">
          {body}
        </p>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-12 flex flex-col sm:flex-row max-w-md mx-auto gap-3"
        >
          <input
            type="email"
            required
            placeholder="Your email address"
            aria-label="Email address"
            className="flex-1 bg-transparent border border-cream/15 px-5 py-4 text-sm placeholder:text-cream/40 focus:outline-none focus:border-gold transition-colors"
          />
          <button
            type="submit"
            className="gold-shimmer bg-gold text-obsidian px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.28em] hover:bg-cream transition-colors"
          >
            {cta}
          </button>
        </form>

        <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-cream/40">
          By subscribing you agree to our privacy policy
        </p>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  FOOTER                                                            */
/* ================================================================== */

function Footer() {
  const cols = [
    {
      title: "Shop",
      links: ["All Fragrances", "The Oud Reserve", "Rare Attars", "Signature Blends", "Discovery Sets", "Gifting"],
    },
    {
      title: "House",
      links: ["Our Story", "The Atelier", "Craftsmanship", "Sustainability", "Press", "Journal"],
    },
    {
      title: "Care",
      links: ["Contact", "Shipping & Returns", "Track Order", "FAQ", "Concierge", "Store Locator"],
    },
  ];
  return (
    <footer className="bg-obsidian border-t border-cream/10 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-4">
            <div className="flex flex-col leading-none">
              <span className="font-serif text-2xl tracking-[0.14em] text-cream">MYSTIQUE</span>
              <span className="font-serif italic text-gold text-xs tracking-[0.4em]">blends</span>
            </div>
            <p className="mt-6 text-sm text-cream/60 leading-relaxed max-w-sm">
              A luxury Indian fragrance house crafting hand-distilled attars and
              modern parfums in Kannauj since 1962.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social"
                  className="h-10 w-10 grid place-items-center border border-cream/10 text-cream/70 hover:text-gold hover:border-gold transition-colors"
                >
                  <Icon size={15} strokeWidth={1.25} />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="lg:col-span-2">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold mb-6">
                {c.title}
              </h4>
              <ul className="space-y-4">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-cream/60 hover:text-cream transition-colors"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-2">
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold mb-6">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-cream/60">
              <li>The Atelier</li>
              <li>Kannauj · Uttar Pradesh</li>
              <li>India — 209 725</li>
              <li className="pt-3">concierge@mystiqueblends.in</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-cream/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-cream/40">
            © 2026 Mystique Blends · All rights reserved
          </p>
          <div className="flex flex-wrap gap-6 text-[10px] uppercase tracking-[0.25em] text-cream/40">
            <a href="#" className="hover:text-cream">Privacy</a>
            <a href="#" className="hover:text-cream">Terms</a>
            <a href="#" className="hover:text-cream">Refund</a>
            <a href="#" className="hover:text-cream">Shipping</a>
          </div>
          <div className="flex items-center gap-2 opacity-60">
            {["VISA", "MC", "AMEX", "UPI", "RPY"].map((p) => (
              <span
                key={p}
                className="text-[9px] font-mono tracking-widest text-cream/60 border border-cream/15 px-2 py-1"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
