import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus, MenuItem, Category, OrderItem } from '@/lib/types';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Clock,
  ChefHat,
  Bell,
  Package,
  Loader2,
  TrendingUp,
  AlertCircle,
  Search,
  Eye,
  BarChart as BarChartIcon,
} from 'lucide-react';

type AdminTab = 'overview' | 'orders' | 'menu' | 'categories' | 'analytics';
type AdminView = 'login' | 'dashboard';

const STATUS_FLOW: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'completed'];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-gold-400 bg-gold-400/10 border-gold-400/30',
  accepted: 'text-cream-400 bg-cream-400/10 border-cream-400/30',
  preparing: 'text-cream-400 bg-cream-400/10 border-cream-400/30',
  ready: 'text-green-400 bg-green-400/10 border-green-400/30',
  completed: 'text-charcoal-300 bg-charcoal-700/50 border-charcoal-700',
  rejected: 'text-rust-400 bg-rust-400/10 border-rust-400/30',
};

export default function AdminDashboard() {
  const [view, setView] = useState<AdminView>('login');
  const [tab, setTab] = useState<AdminTab>('overview');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);

  const addToast = (message: string) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } | null }) => {
      if (data?.session) setView('dashboard');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setView(session ? 'dashboard' : 'login');
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setLoginError(error.message);
    }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('login');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-charcoal-950">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cream-400 to-gold-600 mb-4">
              <LayoutDashboard size={32} className="text-charcoal-900" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-cream-50">Admin Dashboard</h1>
            <p className="text-charcoal-400 text-sm mt-1">Bhukkad Cafe Management</p>
          </div>

          <form onSubmit={handleLogin} className="bg-charcoal-800 rounded-2xl p-6 border border-charcoal-700/30 space-y-4">
            <div>
              <label className="block text-charcoal-200 text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
                className="w-full bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-charcoal-200 text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
              />
            </div>

            {loginError && (
              <div className="bg-rust-500/10 border border-rust-500/30 rounded-xl p-3 text-rust-300 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-heading font-bold text-base py-3 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-charcoal-500 text-xs text-center mt-4">
            Admin access only. Contact your administrator for credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-charcoal-900/90 backdrop-blur-lg border-b border-charcoal-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cream-400 to-gold-600 flex items-center justify-center">
              <span className="font-display text-charcoal-900 text-sm">B</span>
            </div>
            <span className="font-heading font-bold text-cream-50 text-sm">Bhukkad Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-charcoal-300 hover:text-rust-400 text-sm font-medium transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-14 z-30 bg-charcoal-900/90 backdrop-blur-lg border-b border-charcoal-700/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1">
          {[
            { id: 'overview' as AdminTab, label: 'Overview', icon: TrendingUp },
            { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingBag },
            { id: 'menu' as AdminTab, label: 'Menu', icon: UtensilsCrossed },
            { id: 'categories' as AdminTab, label: 'Categories', icon: Package },
            { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChartIcon },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  tab === t.id
                    ? 'border-cream-400 text-cream-400'
                    : 'border-transparent text-charcoal-400 hover:text-cream-200'
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {tab === 'overview' && <OverviewTab addToast={addToast} />}
        {tab === 'orders' && <OrdersTab addToast={addToast} />}
        {tab === 'menu' && <MenuTab addToast={addToast} />}
        {tab === 'categories' && <CategoryTab addToast={addToast} />}
        {tab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  );
}

// =============== ANALYTICS ===============
import { LineChart, Line, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Array<OrderItem & { menu_item?: MenuItem | null }>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [range, setRange] = useState<'today' | '7' | '30' | 'month' | 'custom'>('7');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  const getRangeDates = useCallback((): { from: Date; to: Date } => {
    const now = new Date();
    let from = new Date();
    let to = new Date();
    if (range === 'today') {
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
    } else if (range === '7') {
      from = new Date(now);
      from.setDate(now.getDate() - 6);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
    } else if (range === '30') {
      from = new Date(now);
      from.setDate(now.getDate() - 29);
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
    } else if (range === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (range === 'custom' && customFrom && customTo) {
      from = new Date(customFrom);
      from.setHours(0, 0, 0, 0);
      to = new Date(customTo);
      to.setHours(23, 59, 59, 999);
    }
    return { from, to };
  }, [range, customFrom, customTo]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // determine date range
      const now = new Date();
      let from = new Date();
      let to = new Date();
      if (range === 'today') {
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
      } else if (range === '7') {
        from.setDate(now.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
      } else if (range === '30') {
        from.setDate(now.getDate() - 29);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
      } else if (range === 'month') {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      } else if (range === 'custom' && customFrom && customTo) {
        from = new Date(customFrom);
        to = new Date(customTo);
        to.setHours(23, 59, 59, 999);
      }

      // fetch all orders within range (we'll compute completed/rejected counts locally)
      const { data: ordersRes, error: ordersErr } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', from.toISOString())
        .lte('created_at', to.toISOString())
        .order('created_at', { ascending: true });
      if (ordersErr) throw ordersErr;
      const ordersData = (ordersRes ?? []) as Order[];
      setOrders(ordersData);

      // fetch order_items for completed orders only (used for top items and category performance)
      const completedIds = ordersData.filter((o) => o.status === 'completed').map((o) => o.id);
      let itemsData: Array<OrderItem & { menu_item?: MenuItem | null }> = [];
      if (completedIds.length > 0) {
        const { data: itemsRes, error: itemsErr } = await supabase
          .from('order_items')
          .select('*, menu_item:menu_items(id,name,category_id,price)')
          .in('order_id', completedIds);
        if (itemsErr) throw itemsErr;
        itemsData = (itemsRes ?? []) as Array<OrderItem & { menu_item?: MenuItem | null }>;
      }
      setOrderItems(itemsData);

      const { data: cats, error: catErr } = await supabase.from('categories').select('*');
      if (catErr) throw catErr;
      setCategories(cats ?? []);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as any).message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [range, customFrom, customTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // compute metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const rejectedOrders = orders.filter((o) => o.status === 'rejected').length;
  const totalRevenue = orders.filter((o) => o.status === 'completed').reduce((s, o) => s + Number(o.total || 0), 0);
  const avgOrderValue = completedOrders ? totalRevenue / completedOrders : 0;
  const completionRate = totalOrders ? (completedOrders / totalOrders) * 100 : 0;
  const rejectionRate = totalOrders ? (rejectedOrders / totalOrders) * 100 : 0;

  // top items
  const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
  orderItems.forEach((it) => {
    const key = it.menu_item?.id ?? it.menu_item_id ?? it.item_name;
    const name = it.menu_item?.name ?? it.item_name;
    const qty = Number(it.quantity ?? 0);
    const unitPrice = Number(it.menu_item?.price ?? it.price ?? 0);
    const revenue = unitPrice * qty;
    const existing = itemMap.get(key) ?? { name, qty: 0, revenue: 0 };
    existing.qty += qty;
    existing.revenue += revenue;
    itemMap.set(String(key), existing);
  });
  const topItems = Array.from(itemMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 10);

  // category performance
  const catMap = new Map<string, { name: string; qty: number; revenue: number }>();
  orderItems.forEach((it) => {
    const catId = it.menu_item?.category_id ?? 'uncategorized';
    const qty = Number(it.quantity ?? 0);
    const unitPrice = Number(it.menu_item?.price ?? it.price ?? 0);
    const revenue = unitPrice * qty;
    const key = String(catId);
    const catName = catId !== 'uncategorized' ? (categories.find((c) => c.id === catId)?.name ?? 'Unknown') : 'Uncategorized';
    const existing = catMap.get(key) ?? { name: catName, qty: 0, revenue: 0 };
    existing.qty += qty;
    existing.revenue += revenue;
    catMap.set(key, existing);
  });
  const categoryPerformance = Array.from(catMap.values()).sort((a, b) => b.revenue - a.revenue);

  // revenue and orders over time (daily buckets between from/to)
  const { from: bucketFrom, to: bucketTo } = getRangeDates();
  const msPerDay = 24 * 3600 * 1000;
  const daysCount = Math.max(1, Math.ceil((bucketTo.setHours(0, 0, 0, 0) - bucketFrom.setHours(0, 0, 0, 0)) / msPerDay) + 1);
  const dayBuckets = new Map<string, { date: string; revenue: number; orders: number }>();
  for (let i = 0; i < daysCount; i++) {
    const d = new Date(bucketFrom.getTime() + i * msPerDay);
    const label = d.toLocaleDateString();
    dayBuckets.set(label, { date: label, revenue: 0, orders: 0 });
  }
  // ordersOverTime: count all orders per day
  orders.forEach((o) => {
    const label = new Date(o.created_at).toLocaleDateString();
    const b = dayBuckets.get(label) ?? { date: label, revenue: 0, orders: 0 };
    b.orders += 1;
    dayBuckets.set(label, b);
  });
  // revenue over time: use completed orders totals
  orders.filter((o) => o.status === 'completed').forEach((o) => {
    const label = new Date(o.created_at).toLocaleDateString();
    const b = dayBuckets.get(label) ?? { date: label, revenue: 0, orders: 0 };
    b.revenue += Number(o.total || 0);
    dayBuckets.set(label, b);
  });
  const revenueOverTime = Array.from(dayBuckets.values());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-charcoal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-rust-300">Error loading analytics: {error}</div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
          <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30">
            <p className="text-charcoal-400 text-xs">Revenue (completed)</p>
            <p className="font-heading font-bold text-2xl text-cream-50">₹{totalRevenue.toFixed(2)}</p>
            <p className="text-charcoal-400 text-xs">Range: {range === 'custom' ? `${customFrom} → ${customTo}` : range}</p>
          </div>
          <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30">
            <p className="text-charcoal-400 text-xs">Total Orders</p>
            <p className="font-heading font-bold text-2xl text-cream-50">{totalOrders}</p>
            <p className="text-charcoal-400 text-xs">All statuses</p>
          </div>
          <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30">
            <p className="text-charcoal-400 text-xs">Completed</p>
            <p className="font-heading font-bold text-2xl text-cream-50">{completedOrders}</p>
            <p className="text-charcoal-400 text-xs">Rate: {completionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30">
            <p className="text-charcoal-400 text-xs">Rejected</p>
            <p className="font-heading font-bold text-2xl text-cream-50">{rejectedOrders}</p>
            <p className="text-charcoal-400 text-xs">Rate: {rejectionRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30 lg:w-1/3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-heading font-semibold text-cream-50">Top Items</h3>
            <div className="text-charcoal-400 text-xs">Top {topItems.length}</div>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <div className="bg-charcoal-900 rounded-xl p-2 text-center">
              <div className="text-charcoal-400 text-xs">Avg Order Value</div>
              <div className="font-heading font-bold text-cream-50">₹{avgOrderValue.toFixed(2)}</div>
            </div>
            <div className="bg-charcoal-900 rounded-xl p-2 text-center">
              <div className="text-charcoal-400 text-xs">Top Category</div>
              <div className="font-heading font-bold text-cream-50">{categoryPerformance[0]?.name ?? '—'}</div>
            </div>
          </div>
          {topItems.length === 0 ? (
            <div className="text-charcoal-400 text-sm py-6 text-center">No items sold in range</div>
          ) : (
            <div className="space-y-2">
              {topItems.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <div className="text-cream-50 text-sm font-medium">{t.name}</div>
                    <div className="text-charcoal-400 text-xs">{t.qty} sold</div>
                  </div>
                  <div className="text-cream-400 font-bold">₹{t.revenue.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30">
          <h4 className="font-heading font-semibold text-cream-50 mb-2">Revenue Over Time</h4>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                <XAxis dataKey="date" tick={{ fill: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#cbd5e1' }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#FBBF24" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30">
          <h4 className="font-heading font-semibold text-cream-50 mb-2">Orders Over Time</h4>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <ReBarChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                <XAxis dataKey="date" tick={{ fill: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#cbd5e1' }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#34D399" />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30">
          <h4 className="font-heading font-semibold text-cream-50 mb-2">Category Performance</h4>
          {categoryPerformance.length === 0 ? (
            <div className="text-charcoal-400 text-sm py-6 text-center">No category data</div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <ReBarChart data={categoryPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                  <XAxis type="number" tick={{ fill: '#cbd5e1' }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1' }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#60A5FA" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30">
          <h4 className="font-heading font-semibold text-cream-50 mb-2">Top Items (Revenue)</h4>
          {topItems.length === 0 ? (
            <div className="text-charcoal-400 text-sm py-6 text-center">No sales</div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <ReBarChart data={topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2b2b2b" />
                  <XAxis type="number" tick={{ fill: '#cbd5e1' }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#cbd5e1' }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#F472B6" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============== OVERVIEW ===============
function OverviewTab({ addToast }: { addToast?: (m: string) => void }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    totalItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ordersRes, pendingRes, itemsRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total, created_at').neq('status', 'rejected'),
        supabase.from('orders').select('id').in('status', ['pending', 'accepted', 'preparing']),
        supabase.from('menu_items').select('id', { count: 'exact', head: true }),
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const ordersData = (ordersRes.data ?? []) as Array<{ total: string | number; created_at: string }>;
      const todayRevenue = ordersData
        .filter((o) => new Date(o.created_at) >= today)
        .reduce((sum: number, o) => sum + Number(o.total), 0);

      setStats({
        totalOrders: ordersData.length ?? 0,
        pendingOrders: pendingRes.data?.length ?? 0,
        todayRevenue,
        totalItems: itemsRes.count ?? 0,
      });
      setRecentOrders((recentRes.data ?? []) as Order[]);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-charcoal-500" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-cream-400' },
    { label: 'Active Orders', value: stats.pendingOrders, icon: Clock, color: 'text-gold-400' },
    { label: "Today's Revenue", value: `\u20B9${stats.todayRevenue}`, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Menu Items', value: stats.totalItems, icon: UtensilsCrossed, color: 'text-cream-400' },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-charcoal-800 rounded-2xl p-4 sm:p-5 border border-charcoal-700/30">
              <div className={`w-10 h-10 rounded-xl bg-charcoal-700 flex items-center justify-center mb-3`}>
                <Icon size={20} className={stat.color} />
              </div>
              <p className="text-charcoal-400 text-xs sm:text-sm">{stat.label}</p>
              <p className="font-heading font-bold text-xl sm:text-2xl text-cream-50 mt-0.5">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <div className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30">
        <h2 className="font-heading font-semibold text-cream-50 text-base mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-charcoal-400 text-sm text-center py-6">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-charcoal-700/30 last:border-0">
                <div>
                  <span className="font-heading font-bold text-cream-50 text-sm">{order.order_number}</span>
                  <span className="text-charcoal-400 text-xs ml-2">{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-cream-400 font-bold text-sm">&#8377;{order.total}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============== ORDERS ===============
function OrdersTab({ addToast }: { addToast: (m: string) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setError(null);
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    const { data, error } = await query;
    if (error) {
      setError(error.message || 'Failed to fetch orders');
    }
    if (data) setOrders(data as Order[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    // subscribe to new orders via realtime
    const channel = supabase.channel('orders_list_channel');
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload: any) => {
      const newRow = payload.new as Order | undefined;
      if (newRow) {
        addToast(`New order ${newRow.order_number}`);
        setOrders((prev) => (prev.find((o) => o.id === newRow.id) ? prev : [newRow as Order, ...prev]));
      }
    });
    // listen for updates to keep status in sync
    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload: any) => {
      const newRow = payload.new as Partial<Order> | undefined;
      if (newRow?.id) {
        setOrders((prev) => prev.map((o) => (o.id === newRow.id ? { ...o, ...(newRow as Order) } : o)));
      }
    });
    channel.subscribe();
    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    // Prevent moving backward from final states
    const current = orders.find((o) => o.id === orderId);
    if (!current) return;
    if (current.status === 'completed' || current.status === 'rejected') return;

    // optimistic update
    setUpdatingIds((m) => ({ ...m, [orderId]: true }));
    const prev = orders;
    setOrders((prevList) => prevList.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
      }
      addToast(`Order ${orderId} moved to ${ORDER_STATUS_LABELS[status]}`);
    } catch (err) {
      // revert
      setOrders(prev);
      addToast(`Failed to update order ${orderId}`);
    } finally {
      setUpdatingIds((m) => {
        const copy = { ...m };
        delete copy[orderId];
        return copy;
      });
    }
  };

  const filterTabs: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 -mx-4 px-4">
        <div className="flex-1 min-w-0">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer, or phone..."
            className="w-full bg-charcoal-800 text-cream-50 placeholder-charcoal-500 text-sm rounded-full px-4 py-2 border border-charcoal-700/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="date" className="bg-charcoal-800 text-cream-50 rounded px-2 py-2 border border-charcoal-700/50" onChange={(e) => setDateFrom(e.target.value || null)} />
          <input type="date" className="bg-charcoal-800 text-cream-50 rounded px-2 py-2 border border-charcoal-700/50" onChange={(e) => setDateTo(e.target.value || null)} />
        </div>
      </div>
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
        {filterTabs.map((ft) => (
          <button
            key={ft.value}
            onClick={() => setFilter(ft.value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === ft.value
                ? 'bg-cream-400 text-charcoal-900'
                : 'bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700 border border-charcoal-700/50'
            }`}
          >
            {ft.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-charcoal-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-charcoal-800 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag size={28} className="text-charcoal-500" />
          </div>
          <p className="text-charcoal-400 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {(
            // client-side filtering & search
            orders.filter((o) => {
              const q = search.trim().toLowerCase();
              if (q) {
                return (
                  o.order_number.toLowerCase().includes(q) ||
                  o.customer_name.toLowerCase().includes(q) ||
                  (o.mobile_number && o.mobile_number.includes(q))
                );
              }
              if (filter !== 'all' && o.status !== filter) return false;
              if (dateFrom) {
                const from = new Date(dateFrom);
                const created = new Date(o.created_at);
                if (created < from) return false;
              }
              if (dateTo) {
                const to = new Date(dateTo);
                to.setHours(23, 59, 59, 999);
                const created = new Date(o.created_at);
                if (created > to) return false;
              }
              return true;
            })
          ).map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={updateStatus}
              onView={() => setSelectedOrder(order)}
              disabled={!!updatingIds[order.id]}
            />
          ))}
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

function OrderCard({
  order,
  onStatusChange,
  onView,
  disabled = false,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onView: () => void;
  disabled?: boolean;
}) {
  const itemCount = order.order_items?.reduce((sum, oi) => sum + oi.quantity, 0) ?? 0;
  const time = new Date(order.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];

  return (
    <div className="bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-heading font-bold text-cream-50 text-base">{order.order_number}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <p className="text-charcoal-400 text-xs">
            {time} • {order.customer_name} • +91 {order.mobile_number}
          </p>
        </div>
        <button
          onClick={onView}
          className="text-charcoal-400 hover:text-cream-300 transition-colors"
        >
          <Eye size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-charcoal-300 mb-3">
        <span className="flex items-center gap-1">
          {order.order_type === 'dine_in' ? <UtensilsCrossed size={13} /> : <Package size={13} />}
          {order.order_type === 'dine_in' ? `Dine In${order.table_number ? ` • ${order.table_number}` : ''}` : 'Takeaway'}
        </span>
        <span>•</span>
        <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        <span>•</span>
        <span className="text-cream-400 font-bold">&#8377;{order.total}</span>
      </div>

      {order.order_items && order.order_items.length > 0 && (
        <p className="text-charcoal-400 text-xs mb-3 truncate">
          {order.order_items.map((oi) => `${oi.quantity}× ${oi.item_name}`).join(', ')}
        </p>
      )}

      {order.special_instructions && (
        <p className="text-gold-400/80 text-xs mb-3 italic">"{order.special_instructions}"</p>
      )}

      {/* Action buttons */}
      {order.status !== 'completed' && order.status !== 'rejected' && (
        <div className="flex gap-2 flex-wrap">
          {(() => {
            const actions: { label: string; status: OrderStatus; icon?: React.ReactNode } | null =
              order.status === 'pending'
                ? { label: 'Accept', status: 'accepted', icon: <Check size={14} strokeWidth={3} /> }
                : order.status === 'accepted'
                ? { label: 'Start Preparing', status: 'preparing', icon: <ChefHat size={14} /> }
                : order.status === 'preparing'
                ? { label: 'Mark Ready', status: 'ready', icon: <Bell size={14} /> }
                : order.status === 'ready'
                ? { label: 'Complete Order', status: 'completed', icon: <Package size={14} /> }
                : null;

            return (
              <>
                      {actions && (
                        <button
                          onClick={() => onStatusChange(order.id, actions.status)}
                          disabled={disabled}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full transition-colors ${
                            disabled ? 'opacity-60 cursor-not-allowed' : 'bg-cream-400 hover:bg-cream-300 text-charcoal-900'
                          }`}
                        >
                          {actions.icon}
                          {actions.label}
                        </button>
                      )}

                      <button
                        onClick={() => onStatusChange(order.id, 'rejected')}
                        disabled={disabled}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full transition-colors ${
                          disabled ? 'opacity-60 cursor-not-allowed' : 'bg-rust-500/20 hover:bg-rust-500/30 text-rust-400'
                        }`}
                      >
                        <X size={14} strokeWidth={3} />
                        Cancel
                      </button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto bg-charcoal-800 rounded-t-3xl sm:rounded-3xl animate-slide-up scrollbar-hide">
        <div className="sticky top-0 bg-charcoal-800 p-4 border-b border-charcoal-700/30 flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-cream-50">{order.order_number}</h2>
            <div className="text-charcoal-400 text-xs">{new Date(order.created_at).toLocaleString()}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
          </div>
          <button onClick={onClose} className="text-charcoal-400 hover:text-cream-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-charcoal-400 text-xs">Customer</p>
              <p className="text-cream-50 font-medium">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-charcoal-400 text-xs">Mobile</p>
              <p className="text-cream-50 font-medium">+91 {order.mobile_number}</p>
            </div>
            <div>
              <p className="text-charcoal-400 text-xs">Order Type</p>
              <p className="text-cream-50 font-medium capitalize">
                {order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
              </p>
            </div>
            {order.table_number && (
              <div>
                <p className="text-charcoal-400 text-xs">Table</p>
                <p className="text-cream-50 font-medium">{order.table_number}</p>
              </div>
            )}
          </div>

                {order.order_items?.map((oi) => (
                  <div key={oi.id} className="flex items-center justify-between text-sm bg-charcoal-900 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-charcoal-700 text-cream-300 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {oi.quantity}
                      </span>
                      <div>
                        <div className="text-cream-100">{oi.item_name}</div>
                        <div className="text-charcoal-400 text-xs">₹{oi.price.toFixed(2)} each</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-charcoal-300">₹{(oi.price * oi.quantity).toFixed(2)}</div>
                      <div className="text-charcoal-500 text-xs">₹{oi.price.toFixed(2)} × {oi.quantity}</div>
                    </div>
                  </div>
                ))}

          <div className="border-t border-charcoal-700/50 pt-3 flex justify-between">
            <span className="text-cream-50 font-heading font-bold">Total</span>
            <span className="text-cream-400 font-heading font-bold text-lg">&#8377;{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== CATEGORIES MANAGEMENT ===============
function CategoryTab({ addToast }: { addToast: (m: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order');
    setCategories(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-charcoal-500" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div className="grid gap-3">
        {categories.map((c) => (
          <div key={c.id} className="bg-charcoal-800 rounded-xl p-4 flex items-center justify-between border border-charcoal-700/30">
            <div className="flex items-center gap-3">
              <span className="text-xl">{c.icon || '🍔'}</span>
              <div>
                <h3 className="font-heading font-semibold text-cream-50 text-sm">{c.name}</h3>
                <p className="text-charcoal-400 text-xs">/{c.slug}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== MENU MANAGEMENT ===============
function MenuTab({ addToast }: { addToast: (m: string) => void }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchItems = useCallback(async () => {
    const [itemsRes, catRes] = await Promise.all([
      supabase.from('menu_items').select('*, category:categories(*)').order('display_order'),
      supabase.from('categories').select('*').order('display_order'),
    ]);
    setItems((itemsRes.data ?? []) as MenuItem[]);
    setCategories(catRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
    const onCats = () => fetchItems();
    window.addEventListener('categoriesUpdated', onCats);
    return () => window.removeEventListener('categoriesUpdated', onCats);
  }, [fetchItems]);

  const toggleAvailability = async (item: MenuItem) => {
    const newVal = !item.is_available;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: newVal } : i)));
    const { error } = await supabase.from('menu_items').update({ is_available: newVal }).eq('id', item.id);
    if (error) {
      // revert on error
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: item.is_available } : i)));
      addToast(`Failed to update availability for ${item.name}`);
    } else {
      addToast(`${item.name} is now ${newVal ? 'Available' : 'Out of Stock'}`);
    }
  };

  const deleteItem = async (item: MenuItem) => {
    // check for references in historical order_items
    const { data: refs, error: refErr } = await supabase.from('order_items').select('id').eq('menu_item_id', item.id).limit(1);
    if (refErr) {
      addToast('Failed to check item references');
      return;
    }
    if (refs && refs.length > 0) {
      // cannot safely hard-delete without affecting historical orders
      if (!confirm(`Item "${item.name}" is referenced by past orders. Delete is unsafe. Mark as unavailable instead?`)) return;
      await toggleAvailability({ ...item, is_available: false });
      return;
    }
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    const { error } = await supabase.from('menu_items').delete().eq('id', item.id);
    if (error) {
      addToast(`Failed to delete ${item.name}`);
      // refetch to restore UI
      fetchItems();
    } else {
      addToast(`${item.name} deleted`);
    }
  };

  const filteredItems = items.filter((i) => {
    const q = search.trim().toLowerCase();
    if (q) {
      if (!i.name.toLowerCase().includes(q) && !(i.category?.name ?? '').toLowerCase().includes(q)) return false;
    }
    if (categoryFilter !== 'all' && i.category_id !== categoryFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-charcoal-500" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Search & Add */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full bg-charcoal-800 text-cream-50 placeholder-charcoal-500 text-sm rounded-full pl-9 pr-4 py-2.5 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-charcoal-800 text-cream-50 text-sm rounded-xl px-3 py-2 border border-charcoal-700/50">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 bg-cream-400 hover:bg-cream-300 text-charcoal-900 text-sm font-bold px-4 py-2.5 rounded-full transition-colors flex-shrink-0"
        >
          <Plus size={18} strokeWidth={3} />
          <span className="hidden sm:inline">Add Item</span>
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-charcoal-800 rounded-xl p-3 flex items-center gap-3 border border-charcoal-700/30">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-charcoal-700">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-cream-50 text-sm truncate">{item.name}</h3>
              <p className="text-charcoal-400 text-xs">{item.category?.name ?? 'Uncategorized'}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-cream-400 font-bold text-sm">&#8377;{item.price}</span>
                {item.is_popular && (
                  <span className="text-gold-400 text-xs font-medium">★ Popular</span>
                )}
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                      item.is_available
                        ? 'text-green-400 bg-green-400/10'
                        : 'text-rust-400 bg-rust-400/10'
                    }`}
                  >
                    {item.is_available ? 'Available' : 'Unavailable'}
                  </button>
                  <button
                    onClick={async () => {
                      const newVal = !item.is_popular;
                      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_popular: newVal } : i)));
                      const { error } = await supabase.from('menu_items').update({ is_popular: newVal }).eq('id', item.id);
                      if (error) {
                        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_popular: item.is_popular } : i)));
                        addToast(`Failed to update popular flag for ${item.name}`);
                      } else {
                        addToast(`${item.name} is ${newVal ? 'Popular' : 'Not popular'}`);
                      }
                    }}
                    className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${
                      item.is_popular ? 'text-gold-400 bg-gold-400/10' : 'text-charcoal-300 bg-charcoal-700/10'
                    } ml-2`}
                  >
                    {item.is_popular ? '★ Popular' : 'Mark Popular'}
                  </button>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setEditingItem(item)}
                className="w-8 h-8 rounded-lg bg-charcoal-700 text-charcoal-300 hover:text-cream-300 flex items-center justify-center transition-colors"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => deleteItem(item)}
                className="w-8 h-8 rounded-lg bg-charcoal-700 text-charcoal-300 hover:text-rust-400 flex items-center justify-center transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add modal */}
      {(editingItem || showAddForm) && (
        <MenuItemForm
          item={editingItem}
          categories={categories}
          onClose={() => {
            setEditingItem(null);
            setShowAddForm(false);
          }}
          onSaved={() => {
            setEditingItem(null);
            setShowAddForm(false);
            fetchItems();
          }}
        />
      )}
    </div>
  );
}

function MenuItemForm({
  item,
  categories,
  onClose,
  onSaved,
}: {
  item: MenuItem | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [price, setPrice] = useState(item ? String(item.price) : '');
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? '');
  const [categoryId, setCategoryId] = useState(item?.category_id ?? (categories[0]?.id ?? ''));
  const [isPopular, setIsPopular] = useState(item?.is_popular ?? false);
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true);
  const [displayOrder, setDisplayOrder] = useState(item ? String(item.display_order ?? 0) : '0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    // validation
    const parsedPrice = parseFloat(price);
    if (!name.trim()) {
      setError('Name is required');
      setSaving(false);
      return;
    }
    if (Number.isNaN(parsedPrice) || !isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Price must be a valid non-negative number');
      setSaving(false);
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: parsedPrice,
      image_url: imageUrl.trim() || null,
      category_id: categoryId || null,
      is_popular: isPopular,
      is_available: isAvailable,
      display_order: parseInt(displayOrder) || 0,
    };

    try {
      if (item) {
        const { error: err } = await supabase.from('menu_items').update(payload).eq('id', item.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('menu_items').insert(payload);
        if (err) throw err;
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-charcoal-800 rounded-t-3xl sm:rounded-3xl animate-slide-up scrollbar-hide">
        <div className="sticky top-0 bg-charcoal-800 p-4 border-b border-charcoal-700/30 flex items-center justify-between z-10">
          <h2 className="font-heading font-bold text-lg text-cream-50">
            {item ? 'Edit Item' : 'Add Menu Item'}
          </h2>
          <button onClick={onClose} className="text-charcoal-400 hover:text-cream-200">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div>
            <label className="block text-charcoal-200 text-sm font-medium mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-charcoal-200 text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-charcoal-200 text-sm font-medium mb-1.5">Price (&#8377;)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="1"
                className="w-full bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-charcoal-200 text-sm font-medium mb-1.5">Display Order</label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                min="0"
                className="w-full bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-charcoal-200 text-sm font-medium mb-1.5">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-charcoal-900 text-cream-50 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-charcoal-200 text-sm font-medium mb-1.5">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 accent-cream-400"
              />
              <span className="text-cream-200 text-sm">Popular</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-4 h-4 accent-cream-400"
              />
              <span className="text-cream-200 text-sm">Available</span>
            </label>
          </div>

          {error && (
            <div className="bg-rust-500/10 border border-rust-500/30 rounded-xl p-3 text-rust-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-charcoal-700 hover:bg-charcoal-600 text-cream-50 font-medium text-sm py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-heading font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
