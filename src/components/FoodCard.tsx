import { useCart } from '@/lib/cart-context';
import type { MenuItem } from '@/lib/types';
import QuantitySelector from './QuantitySelector';
import { Plus, Star } from 'lucide-react';

interface FoodCardProps {
  item: MenuItem;
  onClick: () => void;
}

export default function FoodCard({ item, onClick }: FoodCardProps) {
  const { addToCart, getQuantity, updateQuantity } = useCart();
  const quantity = getQuantity(item.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item, 1);
  };

  return (
    <div
      onClick={onClick}
      className="group bg-charcoal-800 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 border border-charcoal-700/50"
    >
      <div className="relative aspect-square overflow-hidden img-shimmer">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'}
          alt={item.name}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80';
            target.className = 'w-full h-full object-cover';
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {item.is_popular && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-rust-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
            <Star size={10} className="fill-current" />
            POPULAR
          </div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-charcoal-900/70 flex items-center justify-center">
            <span className="text-cream-300 font-heading font-semibold text-sm">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-4">
        <h3 className="font-heading font-semibold text-cream-50 text-xs sm:text-sm sm:text-base leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-charcoal-300 text-[11px] sm:text-xs mt-1 line-clamp-2 min-h-[1.75rem] sm:min-h-[2rem]">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between mt-2.5 sm:mt-3 gap-1.5 sm:gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-cream-400 font-heading font-bold text-sm sm:text-base sm:text-lg">
              &#8377;{item.price}
            </span>
          </div>

          {quantity > 0 ? (
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => updateQuantity(item.id, quantity + 1)}
              onDecrement={() => updateQuantity(item.id, quantity - 1)}
              size="sm"
            />
          ) : (
            <button
              onClick={handleAdd}
              disabled={!item.is_available}
              className="flex items-center gap-1 bg-cream-400 hover:bg-cream-300 text-charcoal-900 text-xs font-bold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full transition-all duration-200 active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} strokeWidth={3} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
