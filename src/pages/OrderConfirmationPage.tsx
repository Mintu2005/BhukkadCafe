import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Order, OrderStatus } from '@/lib/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from '@/lib/types';
import type { PageId } from '@/components/BottomNav';
import { CheckCircle2, Clock, Receipt, ArrowRight, Loader2, XCircle, ShoppingBag, ChefHat, Bell, Package } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/whatsapp';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (page: PageId) => void;
  onTrackOrder: (order: Order | null) => void;
}

const STATUS_ICONS: Record<OrderStatus, typeof CheckCircle2> = {
  pending: Clock,
  accepted: CheckCircle2,
  preparing: ChefHat,
  ready: Bell,
  completed: Package,
  rejected: XCircle,
};

export default function OrderConfirmationPage({ order, onNavigate, onTrackOrder }: OrderConfirmationPageProps) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [loading] = useState(false);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  useEffect(() => {
    const pollOrder = async () => {
      try {
        const viewToken = (order as any).view_token || sessionStorage.getItem('last_view_token');
        if (!viewToken) return;

        const { data, error } = await supabase.rpc('get_order_by_token', { p_view_token: viewToken });
        if (error) return;

        const resp = Array.isArray(data) ? data[0] : data;
        if (!resp) return;

        const o = resp.order;
        const items = resp.items || [];

        const mappedOrder: Order = {
          id: o.id,
          order_number: o.order_number,
          customer_name: o.customer_name,
          mobile_number: o.mobile_number,
          order_type: o.order_type,
          table_number: o.table_number,
          special_instructions: o.special_instructions,
          status: o.status,
          subtotal: o.subtotal,
          total: o.total,
          estimated_minutes: o.estimated_minutes,
          created_at: o.created_at,
          updated_at: o.updated_at,
          order_items: items.map((it: any, idx: number) => ({
            id: `${it.menu_item_id}-${idx}`,
            order_id: o.id,
            menu_item_id: it.menu_item_id,
            item_name: it.item_name,
            price: it.unit_price,
            quantity: it.quantity,
          })),
        };

        setCurrentOrder(mappedOrder);
      } catch (e) {
        // ignore polling errors silently
      }
    };

    // initial fetch and poll
    pollOrder();
    const interval = setInterval(pollOrder, 5000);
    return () => clearInterval(interval);
  }, [order.id]);

  const status = currentOrder.status;
  const isRejected = status === 'rejected';
  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(status);

  return (
    <div className="animate-fade-in pb-28 md:pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4">
        {/* Success banner */}
        {!isRejected ? (
          <div className="text-center mb-8 animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-cream-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cream-400/20">
              <CheckCircle2 size={44} className="text-charcoal-900" strokeWidth={2.5} />
            </div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-cream-50 mb-2">Order Confirmed!</h1>
            <p className="text-charcoal-300 text-sm">Your order has been placed successfully</p>
          </div>
        ) : (
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-rust-500/20 flex items-center justify-center mx-auto mb-4">
              <XCircle size={44} className="text-rust-400" />
            </div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-cream-50 mb-2">Order Rejected</h1>
            <p className="text-charcoal-300 text-sm">Unfortunately, your order could not be accepted.</p>
          </div>
        )}

        {/* Order number card */}
        <div className="bg-charcoal-800 rounded-2xl p-4 sm:p-5 border border-charcoal-700/30 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-cream-400" />
              <span className="text-charcoal-300 text-sm">Order Number</span>
            </div>
            <span className="font-heading font-bold text-xl text-cream-400">{currentOrder.order_number}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="bg-charcoal-900 rounded-xl py-2.5 sm:py-3 px-1">
              <p className="text-charcoal-400 text-xs mb-0.5">Type</p>
              <p className="text-cream-50 font-medium text-xs sm:text-sm capitalize truncate">
                {currentOrder.order_type === 'dine_in' ? 'Dine In' : 'Takeaway'}
              </p>
            </div>
            {currentOrder.table_number && (
              <div className="bg-charcoal-900 rounded-xl py-2.5 sm:py-3 px-1">
                <p className="text-charcoal-400 text-xs mb-0.5">Table</p>
                <p className="text-cream-50 font-medium text-xs sm:text-sm truncate">{currentOrder.table_number}</p>
              </div>
            )}
            <div className="bg-charcoal-900 rounded-xl py-2.5 sm:py-3 px-1">
              <p className="text-charcoal-400 text-xs mb-0.5">Total</p>
              <p className="text-cream-400 font-bold text-xs sm:text-sm">&#8377;{currentOrder.total}</p>
            </div>
          </div>
        </div>

        {/* Order tracking */}
        {!isRejected && (
          <div className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30 mb-4">
            <h2 className="font-heading font-semibold text-cream-50 text-base mb-4 flex items-center gap-2">
              <Clock size={18} className="text-cream-400" />
              Order Status
            </h2>

            {/* Status timeline */}
            <div className="space-y-0">
              {ORDER_STATUS_STEPS.map((stepStatus, index) => {
                const Icon = STATUS_ICONS[stepStatus];
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === ORDER_STATUS_STEPS.length - 1;

                return (
                  <div key={stepStatus} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? 'bg-cream-400 text-charcoal-900'
                            : isCurrent
                            ? 'bg-cream-400/20 text-cream-400 ring-2 ring-cream-400 animate-bounce-subtle'
                            : 'bg-charcoal-700 text-charcoal-500'
                        }`}
                      >
                        <Icon size={18} strokeWidth={2.5} />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-0.5 h-8 ${isCompleted ? 'bg-cream-400' : 'bg-charcoal-700'}`}
                        />
                      )}
                    </div>
                    <div className="pt-2">
                      <span
                        className={`font-medium text-sm ${
                          isCompleted ? 'text-cream-200' : isCurrent ? 'text-cream-50' : 'text-charcoal-500'
                        }`}
                      >
                        {ORDER_STATUS_LABELS[stepStatus]}
                      </span>
                      {isCurrent && (
                        <p className="text-cream-400 text-xs mt-0.5">In progress...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Estimated time */}
            {status !== 'completed' && (
              <div className="mt-4 bg-charcoal-900 rounded-xl p-3 flex items-center gap-3">
                <Clock size={18} className="text-cream-400 flex-shrink-0" />
                <p className="text-charcoal-200 text-sm">
                  Estimated preparation time: <span className="text-cream-400 font-bold">{currentOrder.estimated_minutes} minutes</span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Order items summary */}
        <div className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30 mb-4">
          <h2 className="font-heading font-semibold text-cream-50 text-base mb-3">Items Ordered</h2>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={20} className="animate-spin text-charcoal-500" />
            </div>
          ) : (
            <div className="space-y-2">
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
              <div className="border-t border-charcoal-700/50 pt-2 mt-2 flex justify-between">
                <span className="text-cream-50 font-heading font-bold text-base">Total</span>
                <span className="text-cream-400 font-heading font-bold text-base">&#8377;{currentOrder.total}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => {
              const url = getWhatsAppUrl(currentOrder as Order);
              window.open(url, '_blank');
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium text-sm py-3 rounded-full transition-colors border border-green-600/30 flex items-center justify-center gap-2"
          >
            📱 Send Receipt to WhatsApp
          </button>
          <button
            onClick={() => onTrackOrder(currentOrder)}
            className="w-full bg-charcoal-800 hover:bg-charcoal-700 text-cream-50 font-medium text-sm py-3 rounded-full transition-colors border border-charcoal-700/50 flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} />
            Track This Order
          </button>
          <button
            onClick={() => onNavigate('menu')}
            className="w-full bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-heading font-bold text-base py-4 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            Order More Food
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
