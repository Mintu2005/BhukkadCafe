import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus, MenuItem, Category } from '@/lib/types';
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
} from 'lucide-react';

type AdminTab = 'overview' | 'orders' | 'menu';
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
        {tab === 'overview' && <OverviewTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'menu' && <MenuTab />}
      </div>
    </div>
  );
}

// =============== OVERVIEW ===============
function OverviewTab() {
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
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (filter !== 'all') {
      query = query.eq('status', filter);
    }
    const { data, error } = await query;
    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    await supabase.from('orders').update({ status }).eq('id', orderId);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
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
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={updateStatus}
              onView={() => setSelectedOrder(order)}
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
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onView: () => void;
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
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => onStatusChange(order.id, 'accepted')}
                className="flex items-center gap-1.5 bg-cream-400 hover:bg-cream-300 text-charcoal-900 text-xs font-bold px-3 py-2 rounded-full transition-colors"
              >
                <Check size={14} strokeWidth={3} />
                Accept
              </button>
              <button
                onClick={() => onStatusChange(order.id, 'rejected')}
                className="flex items-center gap-1.5 bg-rust-500/20 hover:bg-rust-500/30 text-rust-400 text-xs font-bold px-3 py-2 rounded-full transition-colors"
              >
                <X size={14} strokeWidth={3} />
                Reject
              </button>
            </>
          )}
          {nextStatus && order.status !== 'pending' && (
            <button
              onClick={() => onStatusChange(order.id, nextStatus)}
              className="flex items-center gap-1.5 bg-charcoal-700 hover:bg-charcoal-600 text-cream-50 text-xs font-bold px-3 py-2 rounded-full transition-colors"
            >
              {nextStatus === 'preparing' && <ChefHat size={14} />}
              {nextStatus === 'ready' && <Bell size={14} />}
              {nextStatus === 'completed' && <Package size={14} />}
              Mark as {ORDER_STATUS_LABELS[nextStatus]}
            </button>
          )}
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
          <h2 className="font-heading font-bold text-lg text-cream-50">{order.order_number}</h2>
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

          {order.special_instructions && (
            <div className="bg-charcoal-900 rounded-xl p-3">
              <p className="text-charcoal-400 text-xs mb-1">Special Instructions</p>
              <p className="text-cream-200 text-sm">{order.special_instructions}</p>
            </div>
          )}

          <div>
            <p className="text-charcoal-400 text-xs mb-2">Items</p>
            <div className="space-y-2">
              {order.order_items?.map((oi) => (
                <div key={oi.id} className="flex items-center justify-between text-sm bg-charcoal-900 rounded-lg p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-charcoal-700 text-cream-300 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {oi.quantity}
                    </span>
                    <span className="text-cream-100">{oi.item_name}</span>
                  </div>
                  <span className="text-charcoal-300">&#8377;{oi.price * oi.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-charcoal-700/50 pt-3 flex justify-between">
            <span className="text-cream-50 font-heading font-bold">Total</span>
            <span className="text-cream-400 font-heading font-bold text-lg">&#8377;{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== MENU MANAGEMENT ===============
function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  }, [fetchItems]);

  const toggleAvailability = async (item: MenuItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i))
    );
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id);
  };

  const deleteItem = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    await supabase.from('menu_items').delete().eq('id', item.id);
  };

  const filteredItems = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items;

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
  const [price, setPrice] = useState(item?.price.toString() ?? '');
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? '');
  const [categoryId, setCategoryId] = useState(item?.category_id ?? categories[0]?.id ?? '');
  const [isPopular, setIsPopular] = useState(item?.is_popular ?? false);
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true);
  const [displayOrder, setDisplayOrder] = useState(item?.display_order.toString() ?? '0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
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
