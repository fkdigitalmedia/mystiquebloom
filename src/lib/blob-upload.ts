import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export async function uploadToBlob(file: File, folder = "uploads"): Promise<string> {
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("File size must be under 20MB");
  }

  // 1. Try Vercel Blob API endpoint
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (err) {
    console.warn("Vercel Blob upload endpoint error, trying fallback:", err);
  }

  // 2. Fallback to Supabase Storage if Vercel Blob token is not active locally
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(filename, file, { cacheControl: "31536000", upsert: false });

  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
  return data.publicUrl;
}
