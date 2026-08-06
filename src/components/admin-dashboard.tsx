import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Link } from "@tanstack/react-router";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  Ticket,
  Heart,
} from "lucide-react";

type Stat = {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warn" | "gold";
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function daysAgo(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}
function fmtDay(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

async function fetchDashboard() {
  const since30 = daysAgo(29).toISOString();
  const since60 = daysAgo(59).toISOString();

  const [
    ordersRes,
    prevOrdersRes,
    todayOrdersRes,
    productsRes,
    lowStockRes,
    outStockRes,
    profilesRes,
    couponsRes,
    wishlistRes,
    latestOrdersRes,
    latestCustomersRes,
    orderItemsRes,
    collectionsRes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id,total_inr,status,created_at,user_id")
      .gte("created_at", since30),
    supabase
      .from("orders")
      .select("id,total_inr,user_id,created_at")
      .gte("created_at", since60)
      .lt("created_at", since30),
    supabase
      .from("orders")
      .select("id,total_inr")
      .gte("created_at", startOfToday()),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id,name,stock,slug", { count: "exact" })
      .gt("stock", 0)
      .lte("stock", 5)
      .order("stock", { ascending: true })
      .limit(6),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("stock", 0),
    supabase.from("profiles").select("id,full_name,created_at", { count: "exact" }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("coupon_code", "is", null),
    supabase.from("wishlist").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id,total_inr,status,created_at,user_id,profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("profiles")
      .select("id,full_name,created_at")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("order_items")
      .select("product_id,quantity,price_inr,product:products(name,slug,image_url,collection_id)")
      .limit(500),
    supabase.from("collections").select("id,name"),
  ]);

  const orders = ordersRes.data ?? [];
  const prev = prevOrdersRes.data ?? [];
  const today = todayOrdersRes.data ?? [];

  const totalRevenue30 = orders.reduce((s, o: any) => s + (o.total_inr ?? 0), 0);
  const prevRevenue30 = prev.reduce((s, o: any) => s + (o.total_inr ?? 0), 0);
  const growth =
    prevRevenue30 > 0 ? ((totalRevenue30 - prevRevenue30) / prevRevenue30) * 100 : 0;

  const todaySales = today.reduce((s, o: any) => s + (o.total_inr ?? 0), 0);
  const aov = orders.length ? totalRevenue30 / orders.length : 0;

  const byStatus: Record<string, number> = {};
  for (const o of orders as any[]) byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;

  // Revenue by day (30d)
  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = daysAgo(i);
    dayMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const o of orders as any[]) {
    const k = new Date(o.created_at).toISOString().slice(0, 10);
    dayMap.set(k, (dayMap.get(k) ?? 0) + (o.total_inr ?? 0));
  }
  const revenueSeries = Array.from(dayMap.entries()).map(([k, v]) => ({
    day: fmtDay(new Date(k)),
    revenue: v,
  }));

  // Returning customers
  const userCounts: Record<string, number> = {};
  for (const o of orders as any[]) {
    if (!o.user_id) continue;
    userCounts[o.user_id] = (userCounts[o.user_id] ?? 0) + 1;
  }
  const returning = Object.values(userCounts).filter((c) => c > 1).length;
  const uniqueCustomers = Object.keys(userCounts).length;

  // Top products & collections from order_items
  const items = (orderItemsRes.data ?? []) as any[];
  const productAgg = new Map<string, { name: string; slug: string; image: string | null; qty: number; revenue: number; collection_id: string | null }>();
  const collectionAgg = new Map<string, number>();
  for (const it of items) {
    const p = it.product;
    if (!p) continue;
    const cur =
      productAgg.get(it.product_id) ??
      { name: p.name, slug: p.slug, image: p.image_url, qty: 0, revenue: 0, collection_id: p.collection_id };
    cur.qty += it.quantity ?? 0;
    cur.revenue += (it.price_inr ?? 0) * (it.quantity ?? 0);
    productAgg.set(it.product_id, cur);
    if (p.collection_id) {
      collectionAgg.set(p.collection_id, (collectionAgg.get(p.collection_id) ?? 0) + (it.quantity ?? 0));
    }
  }
  const topProducts = Array.from(productAgg.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const collectionNames = new Map(
    (collectionsRes.data ?? []).map((c: any) => [c.id, c.name]),
  );
  const topCollections = Array.from(collectionAgg.entries())
    .map(([id, qty]) => ({ name: collectionNames.get(id) ?? "—", qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    todaySales,
    revenue30: totalRevenue30,
    growth,
    orders30: orders.length,
    pending: byStatus["placed"] ?? 0,
    confirmed: byStatus["confirmed"] ?? 0,
    shipped: byStatus["shipped"] ?? 0,
    delivered: byStatus["delivered"] ?? 0,
    cancelled: byStatus["cancelled"] ?? 0,
    aov,
    customers: profilesRes.count ?? 0,
    returning,
    conversion: uniqueCustomers && (profilesRes.count ?? 0) > 0
      ? (uniqueCustomers / (profilesRes.count ?? 1)) * 100
      : 0,
    products: productsRes.count ?? 0,
    lowStock: lowStockRes.data ?? [],
    lowStockCount: lowStockRes.count ?? 0,
    outStock: outStockRes.count ?? 0,
    couponsUsed: couponsRes.count ?? 0,
    wishlists: wishlistRes.count ?? 0,
    revenueSeries,
    topProducts,
    topCollections,
    latestOrders: latestOrdersRes.data ?? [],
    latestCustomers: latestCustomersRes.data ?? [],
    statusSeries: [
      { name: "Placed", value: byStatus["placed"] ?? 0 },
      { name: "Confirmed", value: byStatus["confirmed"] ?? 0 },
      { name: "Shipped", value: byStatus["shipped"] ?? 0 },
      { name: "Delivered", value: byStatus["delivered"] ?? 0 },
      { name: "Cancelled", value: byStatus["cancelled"] ?? 0 },
    ],
  };
}

function exportCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = r[h];
          const s = v == null ? "" : String(v).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin_dashboard"],
    queryFn: fetchDashboard,
    staleTime: 30_000,
  });

  if (isLoading || !data) {
    return (
      <div className="text-cream/50 text-sm py-20 text-center">Loading dashboard…</div>
    );
  }

  const stats: Stat[] = [
    { label: "Today's Sales", value: formatINR(data.todaySales), icon: IndianRupee, tone: "gold" },
    { label: "Revenue (30d)", value: formatINR(data.revenue30), hint: `${data.growth >= 0 ? "▲" : "▼"} ${Math.abs(data.growth).toFixed(1)}% vs prev`, icon: TrendingUp },
    { label: "Orders (30d)", value: String(data.orders30), hint: `AOV ${formatINR(Math.round(data.aov))}`, icon: ShoppingBag },
    { label: "Pending Orders", value: String(data.pending + data.confirmed), hint: `${data.shipped} shipped`, icon: Package, tone: data.pending > 0 ? "warn" : "default" },
    { label: "Customers", value: String(data.customers), hint: `${data.returning} returning`, icon: Users },
    { label: "Conversion", value: `${data.conversion.toFixed(1)}%`, hint: "unique buyers", icon: TrendingUp },
    { label: "Products", value: String(data.products), hint: `${data.outStock} out of stock`, icon: Package, tone: data.outStock > 0 ? "warn" : "default" },
    { label: "Low Stock", value: String(data.lowStockCount), hint: "≤ 5 units", icon: AlertTriangle, tone: data.lowStockCount > 0 ? "warn" : "default" },
    { label: "Coupons Used", value: String(data.couponsUsed), icon: Ticket },
    { label: "Wishlist Items", value: String(data.wishlists), icon: Heart },
    { label: "Delivered", value: String(data.delivered), icon: Package },
    { label: "Cancelled", value: String(data.cancelled), icon: Package },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold">Overview</p>
          <h2 className="font-serif text-3xl mt-1">Analytics Dashboard</h2>
          <p className="text-cream/50 text-sm mt-1">Live metrics from the last 30 days</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              exportCSV(
                "revenue-30d.csv",
                data.revenueSeries.map((r) => ({ day: r.day, revenue: r.revenue })),
              )
            }
            className="border border-cream/15 hover:border-gold hover:text-gold px-4 py-2 text-[10px] uppercase tracking-[0.28em]"
          >
            Export Revenue CSV
          </button>
          <button
            onClick={() =>
              exportCSV(
                "top-products.csv",
                data.topProducts.map((p) => ({ name: p.name, qty: p.qty, revenue: p.revenue })),
              )
            }
            className="border border-cream/15 hover:border-gold hover:text-gold px-4 py-2 text-[10px] uppercase tracking-[0.28em]"
          >
            Export Products CSV
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`border p-5 ${
              s.tone === "gold"
                ? "border-gold/40 bg-gold/[0.03]"
                : s.tone === "warn"
                  ? "border-amber-500/30 bg-amber-500/[0.03]"
                  : "border-cream/10 bg-cream/[0.02]"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">{s.label}</p>
              <s.icon className={`w-4 h-4 ${s.tone === "gold" ? "text-gold" : s.tone === "warn" ? "text-amber-400" : "text-cream/40"}`} />
            </div>
            <p className={`mt-3 font-serif text-2xl ${s.tone === "gold" ? "text-gold" : ""}`}>
              {s.value}
            </p>
            {s.hint && <p className="text-[10px] uppercase tracking-[0.2em] text-cream/40 mt-2">{s.hint}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-cream/10 p-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-4">Revenue — 30 days</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueSeries}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,244,236,0.06)" />
                <XAxis dataKey="day" stroke="rgba(248,244,236,0.4)" fontSize={10} />
                <YAxis stroke="rgba(248,244,236,0.4)" fontSize={10} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{ background: "#0A0A0A", border: "1px solid rgba(212,175,55,0.3)", fontSize: 12 }}
                  formatter={(v: number) => formatINR(v)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="border border-cream/10 p-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-4">Orders by Status</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.statusSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(248,244,236,0.06)" />
                <XAxis dataKey="name" stroke="rgba(248,244,236,0.4)" fontSize={10} />
                <YAxis stroke="rgba(248,244,236,0.4)" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#0A0A0A", border: "1px solid rgba(212,175,55,0.3)", fontSize: 12 }} />
                <Bar dataKey="value" fill="#D4AF37" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-cream/10 p-6">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50">Best Sellers</p>
            <span className="text-[10px] uppercase tracking-[0.28em] text-cream/40">last 500 items</span>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="text-cream/40 text-sm">No sales yet.</p>
          ) : (
            <ul className="divide-y divide-cream/5">
              {data.topProducts.map((p, i) => (
                <li key={p.slug} className="flex items-center gap-4 py-3">
                  <span className="text-[10px] text-cream/40 w-4">{i + 1}</span>
                  {p.image ? (
                    <img src={p.image} alt="" className="w-10 h-10 object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-cream/5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      className="text-sm hover:text-gold truncate block"
                    >
                      {p.name}
                    </Link>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cream/40">
                      {p.qty} sold · {formatINR(p.revenue)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-cream/10 p-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-4">Top Collections</p>
          {data.topCollections.length === 0 ? (
            <p className="text-cream/40 text-sm">No sales yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.topCollections.map((c) => {
                const max = data.topCollections[0]?.qty || 1;
                return (
                  <li key={c.name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span>{c.name}</span>
                      <span className="text-cream/50 text-[10px] uppercase tracking-[0.2em]">
                        {c.qty} units
                      </span>
                    </div>
                    <div className="h-1 bg-cream/5 mt-1.5">
                      <div className="h-full bg-gold" style={{ width: `${(c.qty / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-cream/10 p-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-4">Latest Orders</p>
          {data.latestOrders.length === 0 ? (
            <p className="text-cream/40 text-sm">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-cream/5">
              {data.latestOrders.map((o: any) => (
                <li key={o.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="truncate">{o.profiles?.full_name ?? "Guest"}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cream/40">
                      #{o.id.slice(0, 8)} · {o.status}
                    </p>
                  </div>
                  <span className="text-gold">{formatINR(o.total_inr ?? 0)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-cream/10 p-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cream/50 mb-4">New Customers</p>
          {data.latestCustomers.length === 0 ? (
            <p className="text-cream/40 text-sm">No customers yet.</p>
          ) : (
            <ul className="divide-y divide-cream/5">
              {data.latestCustomers.map((c: any) => (
                <li key={c.id} className="py-3 flex items-center justify-between text-sm">
                  <span className="truncate">{c.full_name ?? "Anonymous"}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-cream/40">
                    {new Date(c.created_at).toLocaleDateString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {data.lowStock.length > 0 && (
        <div className="border border-amber-500/30 bg-amber-500/[0.03] p-6">
          <p className="text-[10px] uppercase tracking-[0.28em] text-amber-400 mb-4">
            Low Stock Alerts
          </p>
          <ul className="grid md:grid-cols-2 gap-2">
            {data.lowStock.map((p: any) => (
              <li key={p.id} className="flex items-center justify-between text-sm py-1">
                <span>{p.name}</span>
                <span className="text-amber-400 text-[10px] uppercase tracking-[0.2em]">
                  {p.stock} left
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
