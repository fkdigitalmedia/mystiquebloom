import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Role = "admin" | "customer";

type AuthState = {
  user: User | null;
  session: Session | null;
  role: Role | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    slug: string;
    name: string;
    subtitle: string | null;
    price_inr: number;
    image_url: string | null;
    stock: number;
  } | null;
};

type CartState = {
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  addToCart: (productId: string, qty?: number) => Promise<void>;
  updateQty: (id: string, qty: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearLocal: () => void;
};

type WishlistState = {
  ids: Set<string>;
  toggle: (productId: string) => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);
const CartCtx = createContext<CartState | null>(null);
const WishCtx = createContext<WishlistState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [wishIds, setWishIds] = useState<Set<string>>(new Set());

  // Auth bootstrap
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (event === "SIGNED_OUT") {
        setRole(null);
        setItems([]);
        setWishIds(new Set());
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Fetch role + cart + wishlist when user changes
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: roles }, cart, wish] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        fetchCart(),
        supabase.from("wishlist").select("product_id").eq("user_id", user.id),
      ]);
      const isAdmin = roles?.some((r) => r.role === "admin");
      setRole(isAdmin ? "admin" : "customer");
      setItems(cart);
      setWishIds(new Set((wish.data ?? []).map((w: any) => w.product_id)));
    })();
  }, [user]);

  async function fetchCart(): Promise<CartItem[]> {
    const { data } = await supabase
      .from("cart_items")
      .select(
        "id, product_id, quantity, product:products(id, slug, name, subtitle, price_inr, image_url, stock)",
      )
      .order("created_at", { ascending: false });
    return (data ?? []) as any;
  }

  async function refresh() {
    if (!user) return;
    setCartLoading(true);
    setItems(await fetchCart());
    setCartLoading(false);
  }

  async function addToCart(productId: string, qty = 1) {
    if (!user) {
      toast.error("Please sign in to add items to your cart", {
        action: { label: "Sign in", onClick: () => (window.location.href = "/auth") },
      });
      return;
    }
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + qty })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("cart_items")
        .insert({ user_id: user.id, product_id: productId, quantity: qty });
    }
    await refresh();
    setCartOpen(true);
    toast.success("Added to your cart");
  }

  async function updateQty(id: string, qty: number) {
    if (qty <= 0) return removeItem(id);
    await supabase.from("cart_items").update({ quantity: qty }).eq("id", id);
    await refresh();
  }

  async function removeItem(id: string) {
    await supabase.from("cart_items").delete().eq("id", id);
    await refresh();
  }

  async function toggleWish(productId: string) {
    if (!user) {
      toast.error("Sign in to save to wishlist");
      return;
    }
    if (wishIds.has(productId)) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
      const next = new Set(wishIds);
      next.delete(productId);
      setWishIds(next);
    } else {
      await supabase.from("wishlist").insert({ user_id: user.id, product_id: productId });
      setWishIds(new Set(wishIds).add(productId));
      toast.success("Saved to wishlist");
    }
  }

  const cartState = useMemo<CartState>(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce(
      (s, i) => s + (i.product?.price_inr ?? 0) * i.quantity,
      0,
    );
    return {
      items,
      count,
      subtotal,
      loading: cartLoading,
      cartOpen,
      setCartOpen,
      addToCart,
      updateQty,
      removeItem,
      refresh,
      clearLocal: () => setItems([]),
    };
  }, [items, cartLoading, cartOpen]);

  return (
    <AuthCtx.Provider
      value={{
        user,
        session,
        role,
        loading,
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      <CartCtx.Provider value={cartState}>
        <WishCtx.Provider value={{ ids: wishIds, toggle: toggleWish }}>
          {children}
        </WishCtx.Provider>
      </CartCtx.Provider>
    </AuthCtx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
};
export const useWishlist = () => {
  const c = useContext(WishCtx);
  if (!c) throw new Error("useWishlist outside provider");
  return c;
};
