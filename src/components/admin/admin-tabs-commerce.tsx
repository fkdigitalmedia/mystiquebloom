import { useState, useEffect, Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { uploadToBlob } from "@/lib/blob-upload";
import { ImageUpload, GalleryUpload } from "@/components/image-upload";
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
  Check,
  X,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// Read content from local file
