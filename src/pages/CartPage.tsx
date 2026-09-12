import { useCart } from '@/lib/cart-context';
import QuantitySelector from '@/components/QuantitySelector';
import type { PageId } from '@/components/BottomNav';
import { Trash2, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { getOptimizedImageUrl } from '@/lib/image-utils';

interface CartPageProps {
  onNavigate: (page: PageId) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { items, updateQuantity, removeFromCart, clearCart, getSubtotal, getTotalItems } = useCart();

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <div className="animate-fade-in min-h-[70vh] flex flex-col items-center justify-center px-6 pb-28 md:pb-12">
        <div className="w-24 h-24 rounded-full bg-charcoal-800 flex items-center justify-center mb-5">
          <ShoppingBag size={40} className="text-charcoal-500" />
        </div>
        <h2 className="font-heading font-bold text-xl text-cream-50 mb-2">Your cart is empty</h2>
        <p className="text-charcoal-400 text-sm text-center mb-6">
          Looks like you haven't added anything yet. <br />Let's fix that!
        </p>
        <button
          onClick={() => onNavigate('menu')}
          className="inline-flex items-center gap-2 bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-bold text-sm px-6 py-3 rounded-full transition-all duration-200 active:scale-95"
        >
          Browse Menu
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-28 md:pb-12 touch-pan-y">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-cream-50">Your Cart</h1>
            <p className="text-charcoal-400 text-sm mt-0.5">
              {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-rust-400 hover:text-rust-300 text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {items.map((cartItem) => (
            <div
              key={cartItem.menuItem.id}
              className="bg-charcoal-800 rounded-2xl p-3 flex gap-3 border border-charcoal-700/30 animate-slide-up"
            >
              {/* Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-charcoal-700">
                {cartItem.menuItem.image_url && (
                  <img
                    src={getOptimizedImageUrl(cartItem.menuItem.image_url, 200)}
                    alt={cartItem.menuItem.name}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none select-none"
                  />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-semibold text-cream-50 text-sm sm:text-base leading-tight">
                    {cartItem.menuItem.name}
                  </h3>
                  <button
                    onClick={() => removeFromCart(cartItem.menuItem.id)}
                    className="text-charcoal-400 hover:text-rust-400 transition-colors flex-shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-cream-400 font-bold text-sm mt-1">
                  &#8377;{cartItem.menuItem.price}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <QuantitySelector
                    quantity={cartItem.quantity}
                    onIncrement={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                    onDecrement={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                    size="sm"
                  />
                  <span className="font-heading font-bold text-cream-50 text-base">
                    &#8377;{cartItem.menuItem.price * cartItem.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30">
          <h3 className="font-heading font-semibold text-cream-50 text-base mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-charcoal-300">
              <span>Subtotal ({totalItems} items)</span>
              <span>&#8377;{subtotal}</span>
            </div>
            <div className="flex justify-between text-charcoal-300">
              <span>Delivery</span>
              <span className="text-cream-400 font-medium">Free</span>
            </div>
            <div className="border-t border-charcoal-700/50 pt-2 mt-2 flex justify-between">
              <span className="text-cream-50 font-heading font-bold text-base">Total</span>
              <span className="text-cream-400 font-heading font-bold text-xl">
                &#8377;{subtotal}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout button */}
        <button
          onClick={() => onNavigate('checkout')}
          className="mt-4 w-full bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-heading font-bold text-base py-4 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          Proceed to Checkout
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
