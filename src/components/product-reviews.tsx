import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/app-context";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

type Review = {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified_purchase: boolean;
  approved: boolean;
  created_at: string;
  profiles?: { full_name: string | null } | null;
};

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("product_reviews")
      .select("id, user_id, rating, title, body, verified_purchase, approved, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    const list = (data as any as Review[]) ?? [];
    const shown = list.filter((r) => r.approved || r.user_id === user?.id);
    const uids = Array.from(new Set(shown.map((r) => r.user_id)));
    if (uids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", uids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p.full_name]));
      shown.forEach((r) => { r.profiles = { full_name: map.get(r.user_id) ?? null }; });
    }
    setReviews(shown);
    if (user) {
      const mine = list.find((r) => r.user_id === user.id) ?? null;
      setMyReview(mine);
      if (mine) {
        setRating(mine.rating);
        setTitle(mine.title ?? "");
        setBody(mine.body ?? "");
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, user?.id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const payload = {
        product_id: productId,
        user_id: user.id,
        rating,
        title: title.trim() || null,
        body: body.trim() || null,
      };
      const q = myReview
        ? supabase.from("product_reviews").update(payload).eq("id", myReview.id)
        : supabase.from("product_reviews").insert(payload);
      const { error } = await q;
      if (error) throw error;
      toast.success(myReview ? "Review updated" : "Thanks for your review");
      setShowForm(false);
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Could not save review");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!myReview) return;
    if (!confirm("Delete your review?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", myReview.id);
    if (error) return toast.error(error.message);
    setMyReview(null);
    setTitle("");
    setBody("");
    setRating(5);
    setShowForm(false);
    load();
  }

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section className="mt-20 pt-14 border-t border-cream/10">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gold">Voices</p>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="mt-3 flex items-center gap-3 text-sm text-cream/70">
              <Stars value={avg} />
              <span>{avg.toFixed(1)} · {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
            </div>
          )}
        </div>
        {user ? (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="border border-gold text-gold px-6 py-3 text-[11px] uppercase tracking-[0.28em] hover:bg-gold hover:text-obsidian"
          >
            {showForm ? "Cancel" : myReview ? "Edit Your Review" : "Write a Review"}
          </button>
        ) : (
          <Link to="/auth" className="border border-gold text-gold px-6 py-3 text-[11px] uppercase tracking-[0.28em] hover:bg-gold hover:text-obsidian">
            Sign in to Review
          </Link>
        )}
      </div>

      {showForm && user && (
        <form onSubmit={submit} className="mb-10 border border-cream/10 bg-graphite/30 p-6 space-y-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-cream/60 mb-2">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setRating(n)}
                  aria-label={`${n} star${n === 1 ? "" : "s"}`}
                  className="p-1"
                >
                  <Star size={22} className={n <= rating ? "text-gold" : "text-cream/25"} fill={n <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.28em] text-cream/60">Headline</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum it up in a few words"
              className="mt-1.5 w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-[10px] uppercase tracking-[0.28em] text-cream/60">Your Experience</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="How did it wear? Longevity, projection, the moment you first noticed it…"
              className="mt-1.5 w-full bg-transparent border border-cream/15 focus:border-gold outline-none px-4 py-3 text-sm resize-none"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gold text-obsidian px-8 py-3 text-[11px] uppercase tracking-[0.28em] font-semibold hover:bg-cream disabled:opacity-40"
            >
              {submitting ? "Saving…" : myReview ? "Update Review" : "Submit Review"}
            </button>
            {myReview && (
              <button type="button" onClick={remove} className="text-[11px] uppercase tracking-[0.28em] text-cream/50 hover:text-red-400">
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-cream/50 text-sm">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-cream/50 text-sm">No reviews yet. Be the first to share yours.</p>
      ) : (
        <ul className="space-y-8">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-cream/10 pb-8 last:border-0">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Stars value={r.rating} />
                  {!r.approved && (
                    <span className="text-[9px] uppercase tracking-[0.28em] border border-cream/25 text-cream/60 px-2 py-0.5">Pending</span>
                  )}
                </div>
                <span className="text-xs text-cream/50">{new Date(r.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
              {r.title && <h3 className="mt-3 font-serif text-xl">{r.title}</h3>}
              {r.body && <p className="mt-2 text-cream/70 leading-relaxed">{r.body}</p>}
              <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-cream/50">
                {r.profiles?.full_name || "Verified Guest"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className={n <= Math.round(value) ? "text-gold" : "text-cream/20"} fill={n <= Math.round(value) ? "currentColor" : "none"} />
      ))}
    </div>
  );
}
