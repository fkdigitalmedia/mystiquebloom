import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In · Mystique Blends" },
      { name: "description", content: "Sign in or create your Mystique Blends account to access your orders, wishlist, and loyalty rewards." },
      { property: "og:title", content: "Sign In · Mystique Blends" },
      { property: "og:description", content: "Access your Mystique Blends account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/account" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created — check your email to confirm");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
        navigate({ to: "/account" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(String(result.error));
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/account" });
  }

  return (
    <div className="min-h-screen bg-obsidian text-cream font-sans">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16 md:py-24">
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
            {mode === "signin" ? "Welcome Back" : "Join the House"}
          </span>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h1>
        </div>

        <button
          onClick={google}
          disabled={loading}
          className="mt-10 w-full flex items-center justify-center gap-3 border border-cream/20 py-3.5 text-[11px] uppercase tracking-[0.28em] hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32 29.4 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c11 0 19.5-8.5 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c2.8 0 5.4 1.1 7.4 2.8l5.7-5.7C33.6 6.5 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/><path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-5c-1.9 1.4-4.3 2.3-6.9 2.3-5.4 0-9.9-3-11.3-7l-6.5 5C9.6 39 16.2 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6 5c-.4.4 6.7-4.9 6.7-14.5 0-1.2-.1-2.3-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-4 my-6 text-[10px] uppercase tracking-[0.28em] text-cream/40">
          <span className="h-px flex-1 bg-cream/10" />
          or
          <span className="h-px flex-1 bg-cream/10" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-3.5 text-sm placeholder:text-cream/40"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-3.5 text-sm placeholder:text-cream/40"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-3.5 text-sm placeholder:text-cream/40"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-obsidian py-4 text-[11px] uppercase tracking-[0.28em] font-semibold hover:bg-cream disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-cream/60">
          {mode === "signin" ? "New to Mystique?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-gold gold-underline"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
