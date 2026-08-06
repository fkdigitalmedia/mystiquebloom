import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth, useCart, useWishlist } from "@/context/app-context";
import { Home, Grid, Search, Heart, User, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

interface MobileBottomNavProps {
  onOpenSearch: () => void;
  onOpenCategories: () => void;
}

export function MobileBottomNav({
  onOpenSearch,
  onOpenCategories,
}: MobileBottomNavProps) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { user, role } = useAuth();
  const { count, setCartOpen } = useCart();
  const { ids: wishIds } = useWishlist();

  const isHome = pathname === "/";
  const isWishlist = pathname === "/wishlist";
  const isAccount = pathname.startsWith("/account") || pathname === "/auth";
  const isSearchPage = pathname === "/search";

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      isActive: isHome,
      onClick: undefined,
      href: "/",
    },
    {
      id: "categories",
      label: "Explore",
      icon: Grid,
      isActive: false,
      onClick: () => {
        triggerHaptic();
        onOpenCategories();
      },
      href: undefined,
    },
    {
      id: "search",
      label: "Search",
      icon: Search,
      isActive: isSearchPage,
      onClick: () => {
        triggerHaptic();
        onOpenSearch();
      },
      href: undefined,
    },
    {
      id: "wishlist",
      label: "Saved",
      icon: Heart,
      badge: wishIds.size > 0 ? wishIds.size : null,
      isActive: isWishlist,
      onClick: undefined,
      href: user ? "/wishlist" : "/auth",
    },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingBag,
      badge: count > 0 ? count : null,
      isActive: false,
      onClick: () => {
        triggerHaptic();
        setCartOpen(true);
      },
      href: undefined,
    },
    {
      id: "profile",
      label: user ? "Account" : "Sign In",
      icon: User,
      isActive: isAccount,
      onClick: undefined,
      href: user
        ? role && role !== "customer"
          ? "/admin"
          : "/account"
        : "/auth",
    },
  ];

  return (
    <nav aria-label="Mobile Bottom Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-obsidian/95 backdrop-blur-xl border-t border-cream/10 px-2 pt-2 pb-safe shadow-2xl">
      <div className="flex items-center justify-around h-12">
        {navItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <motion.div
              whileTap={{ scale: 0.88 }}
              className="relative flex flex-col items-center justify-center w-full py-1 text-center group cursor-pointer"
            >
              {item.isActive && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute -top-2 w-8 h-1 bg-gold rounded-full shadow-[0_0_12px_rgba(212,175,55,0.8)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={item.isActive ? 2.2 : 1.6}
                  className={`transition-colors duration-200 ${
                    item.isActive ? "text-gold" : "text-cream/60 group-hover:text-gold"
                  }`}
                />
                {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 h-4 min-w-[16px] px-1 bg-gold text-obsidian text-[9px] font-bold grid place-items-center rounded-full shadow-md leading-none">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-medium tracking-wide uppercase transition-colors duration-200 ${
                  item.isActive ? "text-gold font-semibold" : "text-cream/50"
                }`}
              >
                {item.label}
              </span>
            </motion.div>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={triggerHaptic}
                className="flex-1 touch-target focus:outline-none"
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex-1 touch-target focus:outline-none"
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
