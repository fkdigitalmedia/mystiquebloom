import { useState, useEffect, Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { uploadToBlob } from "@/lib/blob-upload";
import { ImageUpload, GalleryUpload } from "@/components/image-upload";
import {
  logAudit, slugify, Panel, Field, Toggle, Text,
  EMPTY_PRODUCT, Coupon, EMPTY_COUPON, EmailTemplate, DEFAULT_EMAIL_TEMPLATES,
  SeoSettings, BrandingSettings, Automation, StoreSettings, DEFAULT_STORE, deepMergeStore,
  IntegrationRow, DEFAULT_INTEGRATIONS, OrderRow, ReturnStatus
} from "./admin-types";
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Gift, Ticket, Star, Award,
  FileText, Menu as MenuIcon, MessageSquare, Home, ChevronLeft, Users, Shield,
  ScrollText, Warehouse, Truck, Receipt, Megaphone, Search as SearchIcon, Mail,
  Image as ImageIcon, Palette, Copy, Trash2, Settings, Zap, Plug, Database,
  Download, BarChart3, RotateCcw, ShoppingCart, Eraser, Check, X, Plus, Edit,
  Eye, EyeOff, Filter, RefreshCw, ExternalLink, ChevronDown, ChevronUp, AlertTriangle, Send
} from "lucide-react";

export function BlogTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin", "journal"],
    queryFn: async () => {
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = async (post: any) => {
    const patch = {
      title: post.title,
      slug: post.slug || slugify(post.title),
      excerpt: post.excerpt,
      content: post.content,
      cover_image_url: post.cover_image_url,
      author: post.author || "Atelier Master Perfumer",
      reading_time_minutes: Number(post.reading_time_minutes) || 5,
      is_published: post.is_published,
      updated_at: new Date().toISOString(),
    };

    if (post.id) {
      const { error } = await supabase.from("blog_posts").update(patch).eq("id", post.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Journal article updated");
    } else {
      const { error } = await supabase.from("blog_posts").insert([patch]);
      if (error) { toast.error(error.message); return; }
      toast.success("Journal article published");
    }
    qc.invalidateQueries({ queryKey: ["admin", "journal"] });
    setEditing(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this journal article?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Article deleted");
    qc.invalidateQueries({ queryKey: ["admin", "journal"] });
  };

  return (
    <div className="space-y-6">
      <Panel title="Fragrance Journal" subtitle="Publish articles, fragrance stories, and olfactory masterclasses.">
        <div className="flex justify-between items-center mb-4">
          <p className="text-cream/60 text-xs">{posts.length} published stories</p>
          <button
            onClick={() => setEditing({ title: "", slug: "", excerpt: "", content: "", cover_image_url: "", author: "Atelier Perfumer", reading_time_minutes: 5, is_published: true })}
            className="bg-gold text-obsidian px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-bold hover:opacity-90"
          >
            + Write New Story
          </button>
        </div>

        {isLoading ? (
          <p className="text-cream/50 text-xs py-8 text-center">Loading journal articles…</p>
        ) : (
          <div className="border border-cream/10 divide-y divide-cream/10">
            {posts.map((post) => (
              <div key={post.id} className="p-4 flex items-center justify-between gap-4 hover:bg-cream/[0.02]">
                <div className="flex items-center gap-4">
                  {post.cover_image_url && (
                    <img src={post.cover_image_url} alt="" className="w-16 h-12 object-cover border border-cream/10" />
                  )}
                  <div>
                    <h3 className="font-serif text-cream text-base">{post.title}</h3>
                    <p className="text-cream/50 text-xs font-mono">/{post.slug} · {post.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider ${post.is_published ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-cream/10 text-cream/40"}`}>
                    {post.is_published ? "Published" : "Draft"}
                  </span>
                  <button onClick={() => setEditing(post)} className="p-1.5 text-cream/60 hover:text-gold">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(post.id)} className="p-1.5 text-cream/60 hover:text-rose-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="mt-6 border border-gold/30 bg-cream/[0.02] p-5 space-y-4">
            <h3 className="font-serif text-gold text-lg">{editing.id ? "Edit Journal Article" : "Write Journal Article"}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Title">
                <Text value={editing.title} onChange={(v) => setEditing({ ...editing, title: v, slug: editing.id ? editing.slug : slugify(v) })} />
              </Field>
              <Field label="Slug">
                <Text value={editing.slug} onChange={(v) => setEditing({ ...editing, slug: v })} />
              </Field>
              <Field label="Author">
                <Text value={editing.author} onChange={(v) => setEditing({ ...editing, author: v })} />
              </Field>
              <Field label="Reading Time (Minutes)">
                <Text type="number" value={String(editing.reading_time_minutes)} onChange={(v) => setEditing({ ...editing, reading_time_minutes: Number(v) || 5 })} />
              </Field>
            </div>
            <Field label="Cover Image URL">
              <ImageUpload value={editing.cover_image_url} onChange={(url) => setEditing({ ...editing, cover_image_url: url })} />
            </Field>
            <Field label="Excerpt Summary">
              <Text value={editing.excerpt || ""} onChange={(v) => setEditing({ ...editing, excerpt: v })} />
            </Field>
            <Field label="Article Body (Markdown)">
              <textarea
                value={editing.content || ""}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                rows={8}
                className="w-full bg-transparent border border-cream/15 text-cream p-3 text-xs font-mono focus:border-gold outline-none"
              />
            </Field>
            <Toggle label="Publish Story Immediately" checked={editing.is_published} onChange={(v) => setEditing({ ...editing, is_published: v })} />

            <div className="flex gap-3 pt-2">
              <button onClick={() => save(editing)} className="bg-gold text-obsidian px-6 py-2 text-[10px] uppercase tracking-[0.24em] font-bold">
                Save Story
              </button>
              <button onClick={() => setEditing(null)} className="border border-cream/20 px-4 py-2 text-[10px] uppercase tracking-[0.24em]">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
