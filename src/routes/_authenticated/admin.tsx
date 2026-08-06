import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, Fragment } from "react";
import { SiteHeader } from "@/components/site-header";
import { ImageUpload, GalleryUpload } from "@/components/image-upload";
import { useAuth } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { uploadToBlob } from "@/lib/blob-upload";
import { AdminDashboard } from "@/components/admin-dashboard";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Gift,
  Ticket,
  Star,
  Award,
  FileText,
  Menu as MenuIcon,
  MessageSquare,
  Home,
  ChevronLeft,
  Users,
  Shield,
  ScrollText,
  Warehouse,
  Truck,
  Receipt,
  Megaphone,
  Search as SearchIcon,
  Mail,
  Image as ImageIcon,
  Palette,
  Copy,
  Trash2,
  Settings,
  Zap,
  Plug,
  Database,
  Download,
  BarChart3,
  RotateCcw,
  ShoppingCart,
  Eraser,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

// Read full src/routes/_authenticated/admin.tsx contents
