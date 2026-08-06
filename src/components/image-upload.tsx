import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadToBlob } from "@/lib/blob-upload";

interface Props {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label = "Upload Image", folder = "products", className }: Props) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setUploading(true);
    try {
      const publicUrl = await uploadToBlob(file, folder);
      onChange(publicUrl);
      setUrlInput(publicUrl);
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={className}>
      {label && (
        <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-2">{label}</p>
      )}
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt=""
              className="w-32 h-40 object-cover border border-cream/15"
            />
            <button
              type="button"
              onClick={() => {
                onChange("");
                setUrlInput("");
              }}
              className="absolute top-1 right-1 bg-obsidian/80 text-cream text-[10px] px-2 py-1 opacity-0 group-hover:opacity-100 transition"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="w-32 h-40 border border-dashed border-cream/20 flex items-center justify-center text-cream/30 text-xs">
            No image
          </div>
        )}

        <div className="flex-1 space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="w-full bg-gold text-obsidian px-4 py-2.5 text-[10px] uppercase tracking-[0.3em] disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Choose file"}
          </button>
          <div className="text-[10px] uppercase tracking-[0.3em] text-cream/40 text-center">or paste URL</div>
          <input
            type="text"
            value={urlInput}
            placeholder="https://..."
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={() => urlInput !== value && onChange(urlInput)}
            className="input-mystique text-xs"
          />
        </div>
      </div>
    </div>
  );
}

interface GalleryProps {
  value?: string;
  onChange: (val: string) => void;
}

export function GalleryUpload({ value, onChange }: GalleryProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = (value || "").split(",").map((s) => s.trim()).filter(Boolean);

  async function handleFiles(files: FileList) {
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB`);
          continue;
        }
        try {
          const publicUrl = await uploadToBlob(file, "gallery");
          uploaded.push(publicUrl);
        } catch (err: any) {
          toast.error(err.message || `Failed to upload ${file.name}`);
        }
      }
      if (uploaded.length) {
        onChange([...urls, ...uploaded].join(", "));
        toast.success(`${uploaded.length} image(s) added`);
      }
    } finally {
      setUploading(false);
    }
  }

  function removeAt(i: number) {
    const next = urls.filter((_, idx) => idx !== i);
    onChange(next.join(", "));
  }

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-2">Gallery</p>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {urls.map((u, i) => (
          <div key={i} className="relative group">
            <img src={u} alt="" className="w-full h-20 object-cover border border-cream/15" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-0.5 right-0.5 bg-obsidian/80 text-cream text-[9px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="border border-cream/20 hover:border-gold px-4 py-2 text-[10px] uppercase tracking-[0.3em] disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "+ Add gallery images"}
      </button>
    </div>
  );
}
