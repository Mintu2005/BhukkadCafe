import { useState, useCallback, lazy, Suspense } from 'react';
import { CartProvider } from '@/lib/cart-context';
import type { MenuItem, Order } from '@/lib/types';
import TopNav from '@/components/TopNav';
import BottomNav, { type PageId } from '@/components/BottomNav';
import FoodDetailModal from '@/components/FoodDetailModal';
import HomePage from '@/pages/HomePage';
import MenuPage from '@/pages/MenuPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import OrdersPage from '@/pages/OrdersPage';
import ContactPage from '@/pages/ContactPage';

const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));

type AppView = 'customer' | 'admin';

function App() {
  const [view, setView] = useState<AppView>(() => {
    return window.location.hash === '#admin' ? 'admin' : 'customer';
  });
  const [page, setPage] = useState<PageId>('home');
  const [menuCategory, setMenuCategory] = useState<string | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [trackOrder, setTrackOrder] = useState<Order | null>(null);

  const handleNavigate = useCallback(
    (newPage: PageId, params?: Record<string, unknown>) => {
      setPage(newPage);
      setTrackOrder(null);
      if (newPage === 'menu' && params?.category) {
        setMenuCategory(params.category as string);
      } else if (newPage !== 'menu') {
        setMenuCategory(undefined);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  const handleItemSelect = useCallback((item: MenuItem) => {
    setSelectedItem(item);
  }, []);

  const handleOrderPlaced = useCallback((order: Order) => {
    setPlacedOrder(order);
    setPage('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleTrackOrder = useCallback((order: Order | null) => {
    if (order === null) {
      setTrackOrder(null);
    } else {
      setTrackOrder(order);
      setPage('orders');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Admin view
  if (view === 'admin') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-cream-400 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <AdminDashboard />
      </Suspense>
    );
  }

  const isCheckout = page === 'checkout';
  const isConfirmation = page === 'confirmation';

  // Determine current page for nav highlighting
  const navPage: PageId = isCheckout ? 'cart' : isConfirmation ? 'orders' : page;

  return (
    <CartProvider>
      <div className="min-h-screen bg-charcoal-900 w-full relative">
        <TopNav currentPage={navPage} onNavigate={handleNavigate} />

        <main className="w-full">
          {page === 'home' && (
            <HomePage onNavigate={handleNavigate} onItemSelect={handleItemSelect} />
          )}
          {page === 'menu' && (
            <MenuPage onItemSelect={handleItemSelect} initialCategory={menuCategory} />
          )}
          {page === 'cart' && <CartPage onNavigate={handleNavigate} />}
          {isCheckout && (
            <CheckoutPage onNavigate={handleNavigate} onOrderPlaced={handleOrderPlaced} />
          )}
          {isConfirmation && placedOrder && (
            <OrderConfirmationPage
              order={placedOrder}
              onNavigate={handleNavigate}
              onTrackOrder={handleTrackOrder}
            />
          )}
          {page === 'orders' && (
            <OrdersPage
              onNavigate={handleNavigate}
              onTrackOrder={handleTrackOrder}
              trackOrder={trackOrder}
            />
          )}
          {page === 'contact' && <ContactPage />}
        </main>

        {/* Food detail modal */}
        <FoodDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onGoToCart={() => handleNavigate('cart')}
        />

        {/* Bottom navigation (mobile only) */}
        <BottomNav currentPage={navPage} onNavigate={handleNavigate} />

        {/* Admin access link (footer) */}
        {page === 'home' && (
          <button
            onClick={() => {
              window.location.hash = 'admin';
              setView('admin');
            }}
            className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full bg-charcoal-800 border border-charcoal-700/50 text-charcoal-500 hover:text-cream-300 flex items-center justify-center transition-colors md:bottom-4 md:right-6"
            aria-label="Admin access"
            title="Admin"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </button>
        )}

        {/* Padding for bottom nav on mobile */}
        <div className="h-16 md:hidden" />
      </div>
    </CartProvider>
  );
}

export default App;
