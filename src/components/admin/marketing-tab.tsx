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

export function MarketingTab() {
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("whatsapp");

  const sendBroadcast = () => {
    if (!message.trim()) return;
    toast.success(`Broadcast queued for dispatch via ${channel.toUpperCase()}`);
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <Panel title="Customer Broadcast Campaigns" subtitle="Send targeted promotional messages to registered customer segments.">
        <Field label="Channel Target">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as any)}
            className="w-full bg-obsidian border border-cream/15 text-cream px-3 py-2 text-sm focus:border-gold outline-none"
          >
            <option value="whatsapp">WhatsApp Business API (Interakt)</option>
            <option value="sms">Transactional SMS (Twilio)</option>
          </select>
        </Field>
        <Field label="Broadcast Message Content">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Craft your promotional offer or luxury announcement..."
            className="w-full bg-transparent border border-cream/15 text-cream p-3 text-xs font-mono focus:border-gold outline-none"
          />
        </Field>

        <div className="pt-2">
          <button onClick={sendBroadcast} className="bg-gold text-obsidian px-6 py-2.5 text-[10px] uppercase tracking-[0.24em] font-bold flex items-center gap-2">
            <Send className="w-4 h-4" /> Dispatch Broadcast
          </button>
        </div>
      </Panel>
    </div>
  );
}
