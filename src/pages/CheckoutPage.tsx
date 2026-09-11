import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { supabase } from '@/lib/supabase';
import type { OrderType, Order } from '@/lib/types';
import type { PageId } from '@/components/BottomNav';
import { ArrowLeft, User, Phone, Utensils, ShoppingBag, MessageSquare, Loader2, CheckCircle2, MapPin } from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (page: PageId, params?: Record<string, unknown>) => void;
  onOrderPlaced: (order: Order) => void;
}

export default function CheckoutPage({ onNavigate, onOrderPlaced }: CheckoutPageProps) {
  const { items, getSubtotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('takeaway');
  const [tableNumber, setTableNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getSubtotal();

  if (items.length === 0) {
    return (
      <div className="animate-fade-in min-h-[70vh] flex flex-col items-center justify-center px-6 pb-28 md:pb-12">
        <p className="text-charcoal-400 text-sm mb-4">Your cart is empty</p>
        <button
          onClick={() => onNavigate('menu')}
          className="bg-cream-400 text-charcoal-900 font-bold text-sm px-6 py-3 rounded-full hover:bg-cream-300 transition-colors"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.customerName = 'Please enter your name';
    if (!mobileNumber.trim()) {
      errs.mobileNumber = 'Please enter your mobile number';
    } else if (!/^[6-9]\d{9}$/.test(mobileNumber.replace(/\s/g, ''))) {
      errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number';
    }
    if (orderType === 'dine_in' && !tableNumber.trim()) {
      errs.tableNumber = 'Please enter your table number';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      // Build payload for server-side order creation. Do NOT include client-side prices.
      const payload = {
        customer_name: customerName.trim(),
        mobile_number: mobileNumber.replace(/\s/g, ''),
        order_type: orderType,
        table_number: orderType === 'dine_in' ? tableNumber.trim() : null,
        special_instructions: specialInstructions.trim() || null,
        items: items.map((ci) => ({
          menu_item_id: ci.menuItem.id,
          quantity: ci.quantity,
        })),
      } as any;

      const { data, error } = await supabase.rpc('create_order_secure', { p_payload: payload });
      if (error) throw error;

      // RPC returns a row with order_id and view_token
      const row = Array.isArray(data) ? data[0] : data;
      if (!row || !row.order_id || !row.view_token) {
        throw new Error('create_order_secure returned unexpected response');
      }

      // Store view_token in session only for this browser session so tracking/confirmation can use it.
      try {
        sessionStorage.setItem('last_view_token', String(row.view_token));
      } catch (e) {
        // ignore sessionStorage errors
      }

      // Clear cart and navigate/notify parent. We pass a minimal order object with id so
      // confirmation/tracking view will load the full order via get_order_by_token.
      const placeholderOrder: Partial<Order> = { id: row.order_id };
      clearCart();
      onOrderPlaced(placeholderOrder as Order);
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to place order. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in pb-28 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        {/* Back button */}
        <button
          onClick={() => onNavigate('cart')}
          className="flex items-center gap-1.5 text-charcoal-300 hover:text-cream-200 text-sm font-medium mb-4 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </button>

        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-cream-50 mb-6">Checkout</h1>

        <div className="space-y-5">
          {/* Customer Details */}
          <div className="bg-charcoal-800 rounded-2xl p-4 sm:p-5 border border-charcoal-700/30">
            <h2 className="font-heading font-semibold text-cream-50 text-base mb-4 flex items-center gap-2">
              <User size={18} className="text-cream-400" />
              Customer Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-charcoal-200 text-sm font-medium mb-1.5">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
                />
                {errors.customerName && (
                  <p className="text-rust-400 text-xs mt-1">{errors.customerName}</p>
                )}
              </div>

              <div>
                <label className="block text-charcoal-200 text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <Phone size={14} />
                  Mobile Number
                </label>
                <div className="flex items-center gap-2">
                  <span className="bg-charcoal-900 text-charcoal-300 text-sm font-medium px-3 py-3 rounded-xl border border-charcoal-700/50 flex-shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="flex-1 min-w-0 bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
                  />
                </div>
                {errors.mobileNumber && (
                  <p className="text-rust-400 text-xs mt-1">{errors.mobileNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Type */}
          <div className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30">
            <h2 className="font-heading font-semibold text-cream-50 text-base mb-4">Order Type</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderType('dine_in')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  orderType === 'dine_in'
                    ? 'border-cream-400 bg-cream-400/10 text-cream-50'
                    : 'border-charcoal-700/50 text-charcoal-300 hover:border-charcoal-600'
                }`}
              >
                <Utensils size={24} className={orderType === 'dine_in' ? 'text-cream-400' : ''} />
                <span className="font-heading font-semibold text-sm">Dine In</span>
              </button>
              <button
                onClick={() => setOrderType('takeaway')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  orderType === 'takeaway'
                    ? 'border-cream-400 bg-cream-400/10 text-cream-50'
                    : 'border-charcoal-700/50 text-charcoal-300 hover:border-charcoal-600'
                }`}
              >
                <ShoppingBag size={24} className={orderType === 'takeaway' ? 'text-cream-400' : ''} />
                <span className="font-heading font-semibold text-sm">Takeaway</span>
              </button>
            </div>

            {orderType === 'dine_in' && (
              <div className="mt-4 animate-slide-down">
                <label className="block text-charcoal-200 text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <MapPin size={14} />
                  Table Number
                </label>
                <input
                  type="text"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g. T-5"
                  className="w-full bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
                />
                {errors.tableNumber && (
                  <p className="text-rust-400 text-xs mt-1">{errors.tableNumber}</p>
                )}
              </div>
            )}
          </div>

          {/* Special Instructions */}
          <div className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30">
            <h2 className="font-heading font-semibold text-cream-50 text-base mb-3 flex items-center gap-2">
              <MessageSquare size={18} className="text-cream-400" />
              Special Instructions <span className="text-charcoal-400 font-normal text-xs">(Optional)</span>
            </h2>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests? Less spicy, no onions, etc."
              rows={3}
              className="w-full bg-charcoal-900 text-cream-50 placeholder-charcoal-500 text-sm rounded-xl px-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Order Summary */}
          <div className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30">
            <h2 className="font-heading font-semibold text-cream-50 text-base mb-3">Order Summary</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide mb-3">
              {items.map((ci) => (
                <div key={ci.menuItem.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="bg-charcoal-700 text-cream-300 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {ci.quantity}
                    </span>
                    <span className="text-charcoal-200 truncate">{ci.menuItem.name}</span>
                  </div>
                  <span className="text-charcoal-300 flex-shrink-0">
                    &#8377;{ci.menuItem.price * ci.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-charcoal-700/50 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm text-charcoal-300">
                <span>Subtotal</span>
                <span>&#8377;{subtotal}</span>
              </div>
              <div className="flex justify-between text-charcoal-300">
                <span>Delivery</span>
                <span className="text-cream-400">Free</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-cream-50 font-heading font-bold text-base">Total</span>
                <span className="text-cream-400 font-heading font-bold text-xl">&#8377;{subtotal}</span>
              </div>
            </div>
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="bg-rust-500/10 border border-rust-500/30 rounded-xl p-3 text-rust-300 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Place order button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-heading font-bold text-base py-4 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} strokeWidth={2.5} />
                Place Order - &#8377;{subtotal}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
