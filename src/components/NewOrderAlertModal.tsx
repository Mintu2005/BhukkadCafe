import type { Order } from '@/lib/types';
import { BellRing, Check, X, Phone, Utensils, ShoppingBag, ChevronLeft, ChevronRight, Minimize2, Loader2 } from 'lucide-react';

interface NewOrderAlertModalProps {
  orders: Order[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onMinimize: () => void;
  actionLoadingId: string | null;
}

export default function NewOrderAlertModal({
  orders,
  currentIndex,
  onNext,
  onPrev,
  onAccept,
  onReject,
  onMinimize,
  actionLoadingId,
}: NewOrderAlertModalProps) {
  if (orders.length === 0) return null;

  const currentOrder = orders[currentIndex] || orders[0];
  const isLoading = actionLoadingId === currentOrder.id;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-charcoal-900 border-2 border-gold-400/60 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden">
        {/* Top Alert Banner */}
        <div className="bg-gradient-to-r from-gold-500/20 via-gold-400/30 to-gold-500/20 px-5 py-3.5 border-b border-gold-400/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center">
              <BellRing size={18} className="text-gold-400" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-gold-300 text-sm tracking-wide uppercase">
                New Order Received!
              </h2>
              <p className="text-[11px] text-charcoal-400">
                Ringing continuously until Accepted or Rejected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {orders.length > 1 && (
              <span className="bg-gold-400/20 text-gold-300 text-xs font-bold px-2 py-0.5 rounded-full border border-gold-400/40">
                {currentIndex + 1} of {orders.length}
              </span>
            )}
            <button
              onClick={onMinimize}
              className="w-8 h-8 rounded-full bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-cream-200 flex items-center justify-center transition-colors"
              title="Minimize (Sound continues ringing)"
            >
              <Minimize2 size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4 scrollbar-hide">
          {/* Order Header Card */}
          <div className="bg-charcoal-800/90 rounded-2xl p-4 border border-charcoal-700/50">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-charcoal-400 font-medium">Order Number</span>
                <h3 className="font-heading font-extrabold text-2xl text-cream-50">
                  {currentOrder.order_number}
                </h3>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    currentOrder.order_type === 'dine_in'
                      ? 'bg-cream-400/15 text-cream-300 border border-cream-400/30'
                      : 'bg-gold-400/15 text-gold-300 border border-gold-400/30'
                  }`}
                >
                  {currentOrder.order_type === 'dine_in' ? (
                    <>
                      <Utensils size={12} />
                      Dine In (Table {currentOrder.table_number || '-'})
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={12} />
                      Takeaway
                    </>
                  )}
                </span>
                <p className="text-[11px] text-charcoal-400 mt-1">
                  {new Date(currentOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mt-3 pt-3 border-t border-charcoal-700/40 flex items-center justify-between text-sm">
              <div>
                <span className="text-charcoal-400 text-xs">Customer: </span>
                <span className="font-semibold text-cream-100">{currentOrder.customer_name}</span>
              </div>
              {currentOrder.mobile_number && (
                <a
                  href={`tel:${currentOrder.mobile_number}`}
                  className="flex items-center gap-1 text-xs text-cream-400 hover:text-cream-300 font-medium"
                >
                  <Phone size={12} />
                  {currentOrder.mobile_number}
                </a>
              )}
            </div>

            {/* Special Instructions */}
            {currentOrder.special_instructions && (
              <div className="mt-2.5 bg-charcoal-900/80 rounded-xl p-2.5 border border-gold-500/20 text-xs text-gold-300">
                <span className="font-bold text-gold-400">Note: </span>
                {currentOrder.special_instructions}
              </div>
            )}
          </div>

          {/* Ordered Items */}
          <div className="bg-charcoal-800/60 rounded-2xl p-4 border border-charcoal-700/40 space-y-2">
            <h4 className="text-xs font-semibold text-charcoal-300 uppercase tracking-wider mb-2">
              Items Ordered
            </h4>
            {currentOrder.order_items && currentOrder.order_items.length > 0 ? (
              currentOrder.order_items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between text-sm py-1 border-b border-charcoal-700/20 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cream-400/10 text-cream-400 font-bold text-xs flex items-center justify-center">
                      {item.quantity}
                    </span>
                    <span className="text-cream-100">{item.item_name}</span>
                  </div>
                  <span className="font-medium text-cream-300">
                    ₹{(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-charcoal-400 italic">No item breakdown available</p>
            )}

            <div className="pt-3 mt-2 border-t border-charcoal-700/60 flex items-center justify-between">
              <span className="font-heading font-semibold text-cream-200 text-sm">Total Amount</span>
              <span className="font-heading font-extrabold text-xl text-cream-400">
                ₹{Number(currentOrder.total).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Multiple Orders Switcher */}
          {orders.length > 1 && (
            <div className="flex items-center justify-between text-xs text-charcoal-400 px-1">
              <button
                onClick={onPrev}
                className="flex items-center gap-1 hover:text-cream-200 transition-colors"
              >
                <ChevronLeft size={14} /> Previous Order
              </button>
              <span>
                {orders.length} unhandled orders pending
              </span>
              <button
                onClick={onNext}
                className="flex items-center gap-1 hover:text-cream-200 transition-colors"
              >
                Next Order <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-charcoal-900 border-t border-charcoal-700/50 flex gap-3">
          <button
            onClick={() => onReject(currentOrder.id)}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-rust-500/15 hover:bg-rust-500/25 text-rust-300 border border-rust-500/40 font-heading font-bold text-sm py-3 px-4 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <X size={17} strokeWidth={2.5} />
            )}
            Reject Order
          </button>

          <button
            onClick={() => onAccept(currentOrder.id)}
            disabled={isLoading}
            className="flex-[1.5] flex items-center justify-center gap-2 bg-gradient-to-r from-cream-400 to-gold-500 hover:from-cream-300 hover:to-gold-400 text-charcoal-950 font-heading font-extrabold text-sm py-3 px-5 rounded-xl shadow-lg shadow-gold-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={18} strokeWidth={3} />
            )}
            ACCEPT ORDER
          </button>
        </div>
      </div>
    </div>
  );
}
