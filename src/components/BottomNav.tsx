import { useCart } from '@/lib/cart-context';
import { Home, UtensilsCrossed, ShoppingBag, ClipboardList, Phone } from 'lucide-react';

export type PageId = 'home' | 'menu' | 'cart' | 'orders' | 'contact' | 'checkout' | 'confirmation';

interface BottomNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}

const navItems: { id: PageId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'cart', label: 'Cart', icon: ShoppingBag },
  { id: 'orders', label: 'Orders', icon: ClipboardList },
  { id: 'contact', label: 'Contact', icon: Phone },
];

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-charcoal-800/95 backdrop-blur-lg border-t border-charcoal-700 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const showBadge = item.id === 'cart' && cartCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-cream-400'
                  : 'text-charcoal-300 active:text-cream-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {showBadge && (
                  <span className="absolute -top-2 -right-2 bg-rust-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-scale-in">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? 'font-semibold' : ''
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cream-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
