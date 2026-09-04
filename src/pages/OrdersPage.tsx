import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS } from '@/lib/types';
import type { PageId } from '@/components/BottomNav';
import { ClipboardList, ChevronRight, Clock, ShoppingBag, Utensils, Loader2, ArrowRight } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/whatsapp';

interface OrdersPageProps {
  onNavigate: (page: PageId) => void;
  onTrackOrder: (order: Order | null) => void;
  trackOrder?: Order | null;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'text-gold-400 bg-gold-400/10',
  accepted: 'text-cream-400 bg-cream-400/10',
  preparing: 'text-cream-400 bg-cream-400/10',
  ready: 'text-green-400 bg-green-400/10',
  completed: 'text-charcoal-300 bg-charcoal-700/50',
  rejected: 'text-rust-400 bg-rust-400/10',
};

export default function OrdersPage({ onNavigate, onTrackOrder, trackOrder }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileSearch, setMobileSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  // Show track order view if an order is selected
  if (trackOrder) {
    return <TrackOrderView order={trackOrder} onBack={() => onTrackOrder(null)} />;
  }

  const filteredOrders = mobileSearch.trim()
    ? orders.filter(
        (o) =>
          o.order_number.toLowerCase().includes(mobileSearch.toLowerCase()) ||
          o.mobile_number.includes(mobileSearch.replace(/\s/g, ''))
      )
    : orders;

  return (
    <div className="animate-fade-in pb-28 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-cream-50 mb-1">Your Orders</h1>
        <p className="text-charcoal-400 text-sm mb-4">Track and view all your orders</p>

        {/* Search by order number or mobile */}
        <div className="relative mb-4">
          <input
            type="text"
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            placeholder="Search by order number or mobile..."
            className="w-full bg-charcoal-800 text-cream-50 placeholder-charcoal-500 text-sm rounded-full px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={28} className="animate-spin text-charcoal-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-charcoal-800 flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={32} className="text-charcoal-500" />
            </div>
            <h3 className="font-heading font-semibold text-cream-50 text-lg">No orders yet</h3>
            <p className="text-charcoal-400 text-sm mt-1 mb-4">Your order history will appear here</p>
            <button
              onClick={() => onNavigate('menu')}
              className="inline-flex items-center gap-2 bg-cream-400 text-charcoal-900 font-bold text-sm px-6 py-3 rounded-full hover:bg-cream-300 transition-colors"
            >
              Start Ordering
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const itemCount = order.order_items?.reduce((sum, oi) => sum + oi.quantity, 0) ?? 0;
              const date = new Date(order.created_at);
              const dateStr = date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <button
                  key={order.id}
                  onClick={() => onTrackOrder(order)}
                  className="w-full text-left bg-charcoal-800 rounded-2xl p-4 border border-charcoal-700/30 hover:border-charcoal-600 transition-all duration-200 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-heading font-bold text-cream-50 text-base">{order.order_number}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      <p className="text-charcoal-400 text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {dateStr}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-charcoal-500 group-hover:text-cream-300 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <div className="flex items-center gap-3 text-xs text-charcoal-300">
                    <span className="flex items-center gap-1">
                      {order.order_type === 'dine_in' ? <Utensils size={13} /> : <ShoppingBag size={13} />}
                      {order.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
                    </span>
                    <span>•</span>
                    <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span className="text-cream-400 font-bold">&#8377;{order.total}</span>
                  </div>

                  {order.order_items && order.order_items.length > 0 && (
                    <p className="text-charcoal-400 text-xs mt-2 truncate">
                      {order.order_items.map((oi) => `${oi.quantity}× ${oi.item_name}`).join(', ')}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = getWhatsAppUrl(order as Order);
                        window.open(url, '_blank');
                      }}
                      className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-full flex items-center gap-2"
                    >
                      📱 Get Bill on WhatsApp
                    </button>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TrackOrderView({ order, onBack }: { order: Order; onBack: () => void }) {
  const [currentOrder, setCurrentOrder] = useState(order);

  useEffect(() => {
    setCurrentOrder(order);
    const poll = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', order.id)
        .maybeSingle();
      if (!error && data) setCurrentOrder(data as Order);
    };
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [order]);

  return (
    <div className="animate-fade-in pb-28 md:pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4">
        <button
          onClick={onBack}
          className="text-charcoal-300 hover:text-cream-200 text-sm font-medium mb-4 transition-colors"
        >
          ← Back to Orders
        </button>

        <div className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-cream-50">{currentOrder.order_number}</h2>
              <p className="text-charcoal-400 text-xs mt-0.5">
                {new Date(currentOrder.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_COLORS[currentOrder.status]}`}>
              {ORDER_STATUS_LABELS[currentOrder.status]}
            </span>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-charcoal-900 rounded-xl p-3">
              <p className="text-charcoal-400 text-xs mb-0.5">Customer</p>
              <p className="text-cream-50 font-medium text-sm">{currentOrder.customer_name}</p>
            </div>
            <div className="bg-charcoal-900 rounded-xl p-3">
              <p className="text-charcoal-400 text-xs mb-0.5">Mobile</p>
              <p className="text-cream-50 font-medium text-sm">+91 {currentOrder.mobile_number}</p>
            </div>
            <div className="bg-charcoal-900 rounded-xl p-3">
              <p className="text-charcoal-400 text-xs mb-0.5">Type</p>
              <p className="text-cream-50 font-medium text-sm capitalize">
                {currentOrder.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
              </p>
            </div>
            {currentOrder.table_number && (
              <div className="bg-charcoal-900 rounded-xl p-3">
                <p className="text-charcoal-400 text-xs mb-0.5">Table</p>
                <p className="text-cream-50 font-medium text-sm">{currentOrder.table_number}</p>
              </div>
            )}
          </div>

          {currentOrder.special_instructions && (
            <div className="bg-charcoal-900 rounded-xl p-3 mb-4">
              <p className="text-charcoal-400 text-xs mb-0.5">Special Instructions</p>
              <p className="text-cream-200 text-sm">{currentOrder.special_instructions}</p>
            </div>
          )}

          {/* Items */}
          <div className="space-y-2 mb-3">
            {currentOrder.order_items?.map((oi) => (
              <div key={oi.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="bg-charcoal-700 text-cream-300 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {oi.quantity}
                  </span>
                  <span className="text-charcoal-200 truncate">{oi.item_name}</span>
                </div>
                <span className="text-charcoal-300 flex-shrink-0">&#8377;{oi.price * oi.quantity}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-charcoal-700/50 pt-3 flex justify-between">
            <span className="text-cream-50 font-heading font-bold text-base">Total</span>
            <span className="text-cream-400 font-heading font-bold text-lg">&#8377;{currentOrder.total}</span>
          </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  const url = getWhatsAppUrl(currentOrder as Order);
                  window.open(url, '_blank');
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium text-sm py-3 rounded-full transition-colors flex items-center justify-center gap-2"
              >
                📱 Get Bill on WhatsApp
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}
