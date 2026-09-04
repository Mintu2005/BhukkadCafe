import { useCart } from '@/lib/cart-context';
import Logo from './Logo';
import type { PageId } from './BottomNav';
import { Home, UtensilsCrossed, ShoppingBag, ClipboardList, Phone } from 'lucide-react';

interface TopNavProps {
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

export default function TopNav({ currentPage, onNavigate }: TopNavProps) {
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-charcoal-900/90 backdrop-blur-lg border-b border-charcoal-700/50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className="hover:opacity-80 transition-opacity">
          <Logo size="md" />
        </button>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-cream-400 bg-charcoal-800'
                    : 'text-charcoal-300 hover:text-cream-200 hover:bg-charcoal-800/50'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
                {item.id === 'cart' && cartCount > 0 && (
                  <span className="bg-rust-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
