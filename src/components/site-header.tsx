import { Link } from "@tanstack/react-router";
import { GitCompareArrows, Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth, useCart } from "@/context/app-context";
import { useCompare } from "@/lib/use-compare";
import { supabase } from "@/integrations/supabase/client";
import { useNavigationSettings, DEFAULT_NAV } from "@/lib/use-site-settings";
import logoImg from "@/assets/logo.png";

type FooterPage = { slug: string; title: string; showInFooter?: boolean };


export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, role } = useAuth();
  const { count, setCartOpen } = useCart();
  const { data: navItems } = useNavigationSettings();
  const nav = navItems ?? DEFAULT_NAV;
  const { ids: compareIds } = useCompare();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !transparent || scrolled;

  const half = Math.ceil(nav.length / 2);
  const leftNav = nav.slice(0, half);
  const rightNav = nav.slice(half);

  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <a key={href} href={href} className="group relative">
      <span className="text-[11px] tracking-[0.25em] uppercase text-cream/80 group-hover:text-gold transition-colors duration-300 whitespace-nowrap font-medium">
        {label}
      </span>
      <span className="pointer-events-none absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
    </a>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        solid ? "bg-obsidian/95 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      {/* Subtle gold top edge */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
        {/* Left link group */}
        <nav className="hidden lg:flex flex-1 items-center gap-8">
          {leftNav.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} />
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(true)}
          className="lg:hidden text-cream hover:text-gold"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Wordmark */}
        <Link to="/" className="flex items-center leading-none shrink-0 lg:px-8" aria-label="Mystique Blends">
          <img
            src={logoImg}
            alt="Mystique Blends"
            className="h-12 md:h-14 w-auto object-contain"
            style={{ filter: "invert(1) brightness(1.05)" }}
          />
        </Link>

        {/* Right link group + icons */}
        <div className="flex flex-1 items-center justify-end gap-6 lg:gap-8">
          <nav className="hidden xl:flex items-center gap-8">
            {rightNav.map((n) => (
              <NavLink key={n.href} href={n.href} label={n.label} />
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-5 xl:border-l xl:border-graphite xl:pl-8">
            <Link to="/search" aria-label="Search" className="text-cream/70 hover:text-gold transition-colors">
              <Search size={18} strokeWidth={1} />
            </Link>
            <Link to="/compare" aria-label="Compare" className="relative hidden sm:inline-flex text-cream/70 hover:text-gold transition-colors">
              <GitCompareArrows size={18} strokeWidth={1} />
              {compareIds.length > 0 && (
                <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 bg-gold text-obsidian text-[9px] grid place-items-center rounded-full font-medium">
                  {compareIds.length}
                </span>
              )}
            </Link>
            <Link to={user ? "/wishlist" : "/auth"} aria-label="Wishlist" className="hidden sm:inline-flex text-cream/70 hover:text-gold transition-colors">
              <Heart size={18} strokeWidth={1} />
            </Link>
            {(() => {
              const isStaffOrAdmin = role && role !== "customer";
              return (
                <Link
                  to={user ? (isStaffOrAdmin ? "/admin" : "/account") : "/auth"}
                  className="flex items-center gap-2 px-3 md:px-4 h-9 rounded-sm border border-cream/20 hover:border-gold text-cream hover:text-gold transition-colors text-[10px] uppercase tracking-[0.25em] font-medium shrink-0"
                >
                  <User size={14} strokeWidth={1.5} className="text-gold" />
                  <span>
                    {user
                      ? isStaffOrAdmin
                        ? role === "admin"
                          ? "Admin"
                          : role === "manager"
                            ? "Manager"
                            : "Staff"
                        : "Account"
                      : "Login"}
                  </span>
                </Link>
              );
            })()}
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Cart"
              className="ml-1 flex items-center gap-2 px-3 md:px-4 h-9 rounded-sm border border-gold/30 hover:border-gold transition-colors group shrink-0"
            >
              <ShoppingBag size={15} strokeWidth={1.5} className="text-gold" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium text-cream">Cart</span>
              <span className="text-[9px] bg-gold text-obsidian px-1.5 py-0.5 font-bold min-w-[18px] text-center rounded-full leading-none">
                {count}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom hairline */}
      <div className={`h-px w-full transition-colors ${solid ? "bg-graphite" : "bg-transparent"}`} />

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-obsidian/95 backdrop-blur-xl lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="pt-24 px-8 flex flex-col gap-6 text-lg font-serif">
            {[
              ...nav.map((n) => ({ to: n.href, label: n.label })),
              ...(user && role && role !== "customer"
                ? [{ to: "/admin", label: role === "admin" ? "Admin Portal" : "Management Portal" }]
                : []),
              { to: user ? "/account" : "/auth", label: user ? "My Account" : "Sign In" },
            ].map((l) => (
              <a key={l.to} href={l.to} className="text-cream hover:text-gold">{l.label}</a>
            ))}
          </div>

        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return <SiteFooterInner />;
}

function SiteFooterInner() {
  const { data } = useFooterPages();
  const footerPages = (data ?? []).filter((p: FooterPage) => p.showInFooter);
  return (
    <footer className="mt-32 border-t border-cream/10 bg-obsidian text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center leading-none">
            <img
              src={logoImg}
              alt="Mystique Blends"
              className="h-14 w-auto object-contain"
              style={{ filter: "invert(1) brightness(1.05)" }}
            />
          </div>
          <p className="mt-3 text-cream/60 text-sm max-w-xs">
            Hand-distilled attars and modern parfums, crafted in Kannauj since 1962.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Shop</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/shop">All Fragrances</Link></li>
            <li><Link to="/shop/$slug" params={{ slug: "oud-reserve" }}>Oud Reserve</Link></li>
            <li><Link to="/shop/$slug" params={{ slug: "rare-attars" }}>Rare Attars</Link></li>
            <li><Link to="/gift-builder">Gift Boxes</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Discover</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li><Link to="/blog">The Journal</Link></li>
            <li><Link to="/loyalty">The Circle</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/account">My Orders</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold mb-4">Policies</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            {footerPages.length === 0 ? (
              <li className="text-cream/40 text-xs">Manage in Admin → Pages</li>
            ) : (
              footerPages.map((p: FooterPage) => (
                <li key={p.slug}>
                  <Link to="/p/$slug" params={{ slug: p.slug }}>{p.title}</Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-6 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} Mystique Blends. Crafted in Kannauj.
      </div>
    </footer>
  );
}

function useFooterPages() {
  return useQuery({
    queryKey: ["site_settings", "pages"],
    queryFn: async (): Promise<FooterPage[]> => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "pages")
        .maybeSingle();
      const v = (data?.value as { items?: FooterPage[] }) ?? {};
      return v.items ?? [];
    },
    staleTime: 60_000,
  });
}


