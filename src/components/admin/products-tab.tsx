import { useState, useEffect, Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { uploadToBlob } from "@/lib/blob-upload";
import { ImageUpload, GalleryUpload } from "@/components/image-upload";
import {
  LayoutDashboard, Package, FolderTree, ShoppingBag, Gift, Ticket, Star, Award,
  FileText, Menu as MenuIcon, MessageSquare, Home, ChevronLeft, Users, Shield,
  ScrollText, Warehouse, Truck, Receipt, Megaphone, Search as SearchIcon, Mail,
  Image as ImageIcon, Palette, Copy, Trash2, Settings, Zap, Plug, Database,
  Download, BarChart3, RotateCcw, ShoppingCart, Eraser, Check, X, Plus, Edit,
  Eye, EyeOff, Filter, RefreshCw, ExternalLink, ChevronDown, ChevronUp
} from "lucide-react";

export function ProductsTab() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState("");

  const { data: products } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-cream/60 text-sm font-sans">Manage catalog items, prices, and stock levels.</p>
        <button
          onClick={() => setEditing({ name: "", price_inr: 0, stock: 0 })}
          className="bg-gold text-obsidian px-4 py-2 text-[11px] uppercase tracking-[0.24em] font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="border border-cream/10 divide-y divide-cream/10">
        {products?.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between hover:bg-cream/[0.02]">
            <div>
              <h3 className="font-serif text-lg text-cream">{p.name}</h3>
              <p className="text-xs text-cream/40 font-mono">{formatINR(p.price_inr)} · Stock: {p.stock}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(p)} className="p-2 text-cream/60 hover:text-gold">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
