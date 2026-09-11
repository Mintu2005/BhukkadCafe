import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import type { MenuItem } from '@/lib/types';
import QuantitySelector from '@/components/QuantitySelector';
import { X, Star, Plus, ArrowLeft } from 'lucide-react';

interface FoodDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onGoToCart: () => void;
}

export default function FoodDetailModal({ item, onClose, onGoToCart }: FoodDetailModalProps) {
  const { addToCart, getQuantity, updateQuantity } = useCart();
  const [localQty, setLocalQty] = useState(1);

  useEffect(() => {
    setLocalQty(item ? getQuantity(item.id) || 1 : 1);
  }, [item]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (item) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  if (!item) return null;

  const handleAddToCart = () => {
    const currentQty = getQuantity(item.id);
    if (currentQty > 0) {
      updateQuantity(item.id, currentQty + localQty - currentQty);
    } else {
      addToCart(item, localQty);
    }
    onClose();
    onGoToCart();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg max-h-[88vh] sm:max-h-[90vh] overflow-y-auto bg-charcoal-800 rounded-t-3xl sm:rounded-3xl animate-slide-up scrollbar-hide">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-charcoal-900/70 backdrop-blur-sm text-cream-50 flex items-center justify-center hover:bg-charcoal-900 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Back button (mobile) */}
        <button
          onClick={onClose}
          className="sm:hidden absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-charcoal-900/70 backdrop-blur-sm text-cream-50 flex items-center justify-center hover:bg-charcoal-900 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Image */}
        <div className="relative aspect-video sm:aspect-[4/3] max-h-52 sm:max-h-72 overflow-hidden rounded-t-3xl img-shimmer">
          <img
            src={item.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80'}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement;
              t.onerror = null;
              t.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80';
            }}
          />
          {item.is_popular && (
            <div className="absolute top-3 left-14 sm:left-4 flex items-center gap-1 bg-rust-500 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg">
              <Star size={11} className="fill-current" />
              POPULAR
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h2 className="font-heading font-bold text-lg sm:text-2xl text-cream-50 leading-tight">
              {item.name}
            </h2>
            <span className="font-heading font-bold text-xl sm:text-2xl text-cream-400 flex-shrink-0">
              &#8377;{item.price}
            </span>
          </div>

          {item.description && (
            <p className="text-charcoal-300 text-sm leading-relaxed mb-5">
              {item.description}
            </p>
          )}

          {/* Quantity selector */}
          <div className="flex items-center justify-between mb-5 py-3 border-y border-charcoal-700/50">
            <span className="text-cream-50 font-medium text-sm">Quantity</span>
            <QuantitySelector
              quantity={localQty}
              onIncrement={() => setLocalQty((q) => q + 1)}
              onDecrement={() => setLocalQty((q) => Math.max(1, q - 1))}
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-charcoal-300 text-sm">Total</span>
            <span className="font-heading font-bold text-xl text-cream-50">
              &#8377;{item.price * localQty}
            </span>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={!item.is_available}
            className="w-full bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-heading font-bold text-base py-4 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus size={20} strokeWidth={3} />
            {item.is_available ? `Add ${localQty} to Cart - \u20B9${item.price * localQty}` : 'Currently Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}
