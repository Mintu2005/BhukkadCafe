import { useEffect, useState } from 'react';
import { fetchCategories, fetchPopularItems, fetchCategoryImages } from '@/lib/menu-service';
import { fetchTodayOffers, fetchTodayOffersSetting } from '@/lib/offers-service';
import { getOptimizedImageUrl, DEFAULT_FOOD_IMAGE } from '@/lib/image-utils';
import type { MenuItem, Category, Offer } from '@/lib/types';
import QuantitySelector from '@/components/QuantitySelector';
import { useCart } from '@/lib/cart-context';
import type { PageId } from '@/components/BottomNav';
import { ArrowRight, MapPin, Phone, Clock, Star, Flame, Truck, Utensils, Sparkles, Plus, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId, params?: Record<string, unknown>) => void;
  onItemSelect: (item: MenuItem) => void;
}

interface ImageFramingStyle {
  scale: number;
  objectPosition: string;
}

/**
 * Calibrated visual framing for each popular menu item based on its actual source image.
 * Normalizes visual presence across all cards on mobile devices.
 */
function getPopularItemImageStyle(item: MenuItem): ImageFramingStyle {
  const id = item.id || '';
  const name = (item.name || '').toLowerCase().trim();
  const url = (item.image_url || '').toLowerCase();

  // Fried Rice (Unsplash photo-1603133872878): Small rice mound in distance on huge white plate -> scale 1.58
  if (name.includes('fried rice') || id === 'bb81bda7-c169-4f2c-bca5-78041e89c524' || url.includes('photo-1603133872878')) {
    return { scale: 1.58, objectPosition: '50% 50%' };
  }
  // Plain Maggi (item_1789229464844): Bowl in lower half with empty table above -> focal center 70% & scale 1.34
  if (name.includes('maggi') || id === '97fad591-836d-40bc-a347-e1c1eeb71881' || url.includes('item_1789229464844')) {
    return { scale: 1.34, objectPosition: '50% 70%' };
  }
  // Pav Bhaji (item_1789465390964): Tall vertical platter -> align focal point to keep pav buns & bhaji bowl framed
  if (name.includes('pav bhaji') || id === '574a814a-934b-495d-af13-039260b5cf10' || url.includes('item_1789465390964')) {
    return { scale: 1.18, objectPosition: '46% 36%' };
  }
  // Paneer Sandwich (item_1789465604929): Already wide close-up filling 80% width -> standard 1.02 scale
  if (name.includes('sandwich') || id === 'fa307540-014e-4d96-b2d5-99550fd505f4' || url.includes('item_1789465604929')) {
    return { scale: 1.02, objectPosition: '50% 50%' };
  }
  // Cheese Macroni (item_1789465944474): Close-up bowl shot -> standard 1.02 scale
  if (name.includes('macroni') || name.includes('macaroni') || id === '0e57252c-3cd1-438a-8708-418a3daeab9d' || url.includes('item_1789465944474')) {
    return { scale: 1.02, objectPosition: '50% 50%' };
  }
  // Creamy Chaap (item_1789465275112): Close-up bowl shot -> standard 1.02 scale
  if (name.includes('chaap') || id === '9652a76b-0240-4ba8-b2ab-2d4fc9231b3e' || url.includes('item_1789465275112')) {
    return { scale: 1.02, objectPosition: '50% 48%' };
  }
  // Aaloo Tikki Burger (item_1789465817900): Full-height macro shot -> slight scale-back so full burger fits
  if (name.includes('burger') || id === '58911bca-844f-42ee-af7d-0d2a679c3737' || url.includes('item_1789465817900')) {
    return { scale: 0.98, objectPosition: '50% 50%' };
  }
  // Farm House Pizza (item_1789465685247): Pizza on board with cheese pull -> focal center 58%
  if (name.includes('pizza') || id === 'fc8c7b12-258b-40f0-ae28-4ccf0d0311f1' || url.includes('item_1789465685247')) {
    return { scale: 1.05, objectPosition: '50% 58%' };
  }
  return { scale: 1.06, objectPosition: '50% 50%' };
}

interface HomeFoodCardProps {
  item: MenuItem;
  onClick: () => void;
}

function HomeFoodCard({ item, onClick }: HomeFoodCardProps) {
  const { addToCart, getQuantity, updateQuantity } = useCart();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const quantity = getQuantity(item.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(item, 1);
  };

  const optimizedSrc = getOptimizedImageUrl(item.image_url, 400);
  const imgStyle = getPopularItemImageStyle(item);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-charcoal-800 rounded-2xl overflow-hidden cursor-pointer transition-transform transition-shadow duration-200 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 border border-charcoal-700/50 touch-pan-y flex flex-col h-full"
    >
      <div className={`relative w-full aspect-[4/3] overflow-hidden flex-shrink-0 ${!imageLoaded ? 'img-shimmer' : 'bg-charcoal-900'}`}>
        <img
          src={optimizedSrc}
          alt={item.name}
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src = DEFAULT_FOOD_IMAGE;
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover pointer-events-none select-none ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectPosition: imgStyle.objectPosition,
            transform: `scale(${isHovered ? imgStyle.scale * 1.05 : imgStyle.scale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease-out, opacity 0.2s ease-out',
          }}
        />
        {item.is_popular && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-rust-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg pointer-events-none select-none">
            <Star size={10} className="fill-current" />
            POPULAR
          </div>
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-charcoal-900/70 flex items-center justify-center pointer-events-none select-none">
            <span className="text-cream-300 font-heading font-semibold text-sm">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-heading font-semibold text-cream-50 text-xs sm:text-sm sm:text-base leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-charcoal-300 text-[11px] sm:text-xs mt-1 line-clamp-2 min-h-[1.75rem] sm:min-h-[2rem]">
              {item.description}
            </p>
          )}
        </div>

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

export default function HomePage({ onNavigate, onItemSelect }: HomePageProps) {
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [todayOffers, setTodayOffers] = useState<Offer[]>([]);
  const [showTodayOffers, setShowTodayOffers] = useState(true);
  const [offersLoading, setOffersLoading] = useState(true);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [popular, cats, offers, isOffersEnabled] = await Promise.all([
          fetchPopularItems(),
          fetchCategories(),
          fetchTodayOffers(),
          fetchTodayOffersSetting(),
        ]);
        if (!mounted) return;
        setPopularItems(popular);
        setCategories(cats);
        setTodayOffers(offers);
        setShowTodayOffers(isOffersEnabled);
        setOffersLoading(false);
        setLoading(false);

        if (cats.length > 0) {
          const imgMap = await fetchCategoryImages(cats);
          if (mounted) {
            setCategoryImages(imgMap);
          }
        }
      } catch {
        if (mounted) {
          setOffersLoading(false);
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-advance carousel for multiple today offers
  useEffect(() => {
    if (!showTodayOffers || todayOffers.length <= 1) return;
    const interval = setInterval(() => {
      setActiveOfferIndex((prev) => (prev + 1) % todayOffers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [showTodayOffers, todayOffers.length]);

  return (
    <div className="animate-fade-in touch-pan-y">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden hero-warm">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/11439363/pexels-photo-11439363.jpeg?auto=compress&cs=tinysrgb&h=1200&w=1920"
            alt="Cafe interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/80 via-charcoal-900/70 to-charcoal-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/60 to-transparent" />
          <div className="hero-blur-overlay" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 max-w-6xl mx-auto pt-10 sm:pt-16 pb-14 sm:pb-20 w-full">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 sm:gap-8">
            {/* Left: sign image */}
            <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center md:justify-start">
              <img
                src="/images/logo.png"
                alt="Bhukkad signboard"
                className="rounded-full w-40 h-40 sm:w-56 sm:h-56 md:w-72 md:h-72 max-w-full object-contain shadow-2xl"
                style={{ filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.6))' }}
              />
            </div>

            {/* Right: text */}
            <div className="text-center md:text-left w-full md:w-1/2">
              <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl text-cream-50 font-bold mb-3 sm:mb-4">Good Food. Good Mood.</h1>
              <p className="text-cream-200/80 text-xs sm:text-sm sm:text-base max-w-lg mb-3 mx-auto md:mx-0">
                Where every craving meets its match. Fresh, bold, and full of flavour — made just for you at Bhukkad Cafe.
              </p>
              <div className="inline-flex items-center gap-2 bg-charcoal-900/60 px-3 py-1 rounded-full mb-4">
                <span className="text-cream-300 text-xs">Fresh</span>
                <span className="text-charcoal-600">•</span>
                <span className="text-cream-300 text-xs">Fast</span>
                <span className="text-charcoal-600">•</span>
                <span className="text-cream-300 text-xs">Delicious</span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3">
                <button
                  onClick={() => onNavigate('menu')}
                  className="group inline-flex items-center gap-2 bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-heading font-bold text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Order Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => onNavigate('menu')}
                  className="inline-flex items-center gap-2 border border-charcoal-700 text-cream-200 text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 rounded-full hover:bg-charcoal-800/60 transition-colors"
                >
                  Explore Menu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:block">
          <div className="w-6 h-10 border-2 border-cream-300/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-cream-300/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="px-4 sm:px-6 mt-6 sm:mt-8 relative z-10 max-w-6xl mx-auto w-full">
        {offersLoading ? (
          <div className="bg-charcoal-800/80 border border-charcoal-700/40 rounded-2xl p-4 sm:p-5 flex items-center gap-4 img-shimmer">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-charcoal-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-charcoal-700 rounded w-1/3" />
              <div className="h-3 bg-charcoal-700 rounded w-2/3" />
            </div>
            <div className="w-24 h-9 bg-charcoal-700 rounded-full flex-shrink-0 hidden sm:block" />
          </div>
        ) : !showTodayOffers || todayOffers.length === 0 ? (
          /* Clean No Offers Today State */
          <div className="bg-gradient-to-r from-charcoal-850 via-charcoal-800 to-charcoal-850 border border-charcoal-700/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-lg text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cream-400/10 border border-cream-400/20 flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} className="text-cream-300" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-cream-50 text-sm sm:text-base">No Special Offers Today</h3>
                <p className="text-charcoal-300 text-xs sm:text-sm">Explore our full menu for our complete range of delicious cafe favorites!</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('menu')}
              className="w-full sm:w-auto bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-heading font-bold text-xs sm:text-sm px-4 py-2 rounded-full transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 shadow-sm"
            >
              <span>Explore Menu</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          /* Active Today's Special Offers */
          <div className="relative">
            {todayOffers.length === 1 ? (
              /* Single Offer */
              <div className="bg-gradient-to-r from-rust-600 via-rust-500 to-rust-600 rounded-2xl p-3.5 sm:p-5 shadow-xl border border-rust-400/30 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5 text-center sm:text-left">
                  {todayOffers[0].image_url ? (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-charcoal-900 flex-shrink-0 shadow-md border border-cream-400/20">
                      <img
                        src={getOptimizedImageUrl(todayOffers[0].image_url, 300)}
                        alt={todayOffers[0].title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-cream-400 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Flame size={24} className="text-rust-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1">
                      <span className="bg-cream-400 text-charcoal-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Today's Special
                      </span>
                      {todayOffers[0].discount_text && (
                        <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30">
                          {todayOffers[0].discount_text}
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-cream-50 text-base sm:text-lg leading-snug">
                      {todayOffers[0].title}
                    </h3>
                    {todayOffers[0].description && (
                      <p className="text-cream-100/90 text-xs sm:text-sm mt-0.5 line-clamp-2">
                        {todayOffers[0].description}
                      </p>
                    )}
                    <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-2">
                      <span className="text-cream-300 font-heading font-bold text-base sm:text-lg">
                        ₹{todayOffers[0].offer_price}
                      </span>
                      {todayOffers[0].original_price != null && todayOffers[0].original_price > todayOffers[0].offer_price && (
                        <span className="text-cream-200/60 line-through text-xs sm:text-sm">
                          ₹{todayOffers[0].original_price}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('menu')}
                    className="w-full sm:w-auto bg-cream-50 hover:bg-cream-100 text-rust-600 font-heading font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow transition-all active:scale-95 flex-shrink-0"
                  >
                    Grab Offer
                  </button>
                </div>
              </div>
            ) : (
              /* Multiple Offers Carousel */
              <div className="bg-gradient-to-r from-rust-600 via-rust-500 to-rust-600 rounded-2xl p-3.5 sm:p-5 shadow-xl border border-rust-400/30 overflow-hidden relative">
                {(() => {
                  const activeOffer = todayOffers[activeOfferIndex] || todayOffers[0];
                  return (
                    <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5 text-center sm:text-left">
                      {activeOffer.image_url ? (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-charcoal-900 flex-shrink-0 shadow-md border border-cream-400/20">
                          <img
                            src={getOptimizedImageUrl(activeOffer.image_url, 300)}
                            alt={activeOffer.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-cream-400 flex items-center justify-center flex-shrink-0 shadow-md">
                          <Flame size={24} className="text-rust-600" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-1">
                          <span className="bg-cream-400 text-charcoal-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Special {activeOfferIndex + 1} of {todayOffers.length}
                          </span>
                          {activeOffer.discount_text && (
                            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30">
                              {activeOffer.discount_text}
                            </span>
                          )}
                        </div>
                        <h3 className="font-heading font-bold text-cream-50 text-base sm:text-lg leading-snug">
                          {activeOffer.title}
                        </h3>
                        {activeOffer.description && (
                          <p className="text-cream-100/90 text-xs sm:text-sm mt-0.5 line-clamp-2">
                            {activeOffer.description}
                          </p>
                        )}
                        <div className="flex items-baseline justify-center sm:justify-start gap-2 mt-2">
                          <span className="text-cream-300 font-heading font-bold text-base sm:text-lg">
                            ₹{activeOffer.offer_price}
                          </span>
                          {activeOffer.original_price != null && activeOffer.original_price > activeOffer.offer_price && (
                            <span className="text-cream-200/60 line-through text-xs sm:text-sm">
                              ₹{activeOffer.original_price}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => onNavigate('menu')}
                          className="flex-1 sm:flex-none w-full sm:w-auto bg-cream-50 hover:bg-cream-100 text-rust-600 font-heading font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow transition-all active:scale-95 flex-shrink-0"
                        >
                          Grab Offer
                        </button>

                        {/* Navigation controls */}
                        <div className="flex items-center gap-1.5 justify-center">
                          <button
                            onClick={() =>
                              setActiveOfferIndex((prev) => (prev - 1 + todayOffers.length) % todayOffers.length)
                            }
                            aria-label="Previous offer"
                            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <div className="flex gap-1">
                            {todayOffers.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setActiveOfferIndex(idx)}
                                aria-label={`Go to offer ${idx + 1}`}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === activeOfferIndex ? 'bg-cream-300 w-4' : 'bg-white/40 hover:bg-white/70'
                                }`}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() =>
                              setActiveOfferIndex((prev) => (prev + 1) % todayOffers.length)
                            }
                            aria-label="Next offer"
                            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Category Shortcuts */}
      <section className="px-4 sm:px-6 mt-8 sm:mt-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="font-heading font-bold text-lg sm:text-2xl text-cream-50">Browse Categories</h2>
          <button
            onClick={() => onNavigate('menu')}
            className="text-cream-400 text-xs sm:text-sm font-medium hover:text-cream-300 transition-colors flex items-center gap-1"
          >
            See all
            <ArrowRight size={15} />
          </button>
        </div>
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 touch-pan-x">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-24 aspect-[4/3] sm:w-36 sm:aspect-[4/3] bg-charcoal-800 rounded-2xl img-shimmer" />
              ))
            : categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onNavigate('menu', { category: cat.slug })}
                  className="flex-shrink-0 w-24 sm:w-36 flex flex-col items-center gap-1.5 sm:gap-2 group"
                >
                  <div className="w-24 aspect-[4/3] sm:w-36 sm:aspect-[4/3] rounded-2xl bg-charcoal-800 border border-charcoal-700/50 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg flex-shrink-0">
                    {categoryImages[cat.id] ? (
                      <img
                        src={getOptimizedImageUrl(categoryImages[cat.id], 300)}
                        alt={cat.name}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="w-full h-full object-cover object-center pointer-events-none select-none"
                      />
                    ) : (
                      <div className="text-2xl sm:text-3xl">{cat.icon}</div>
                    )}
                  </div>
                  <span className="text-charcoal-200 text-xs sm:text-sm font-medium text-center leading-tight group-hover:text-cream-300 transition-colors">
                    {cat.name}
                  </span>
                </button>
              ))}
        </div>
      </section>

      {/* Popular Items */}
      <section className="px-4 sm:px-6 mt-8 sm:mt-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-cream-400 fill-current sm:w-5 sm:h-5" />
            <h2 className="font-heading font-bold text-lg sm:text-2xl text-cream-50">Popular Picks</h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-cream-400 text-xs sm:text-sm font-medium hover:text-cream-300 transition-colors flex items-center gap-1"
          >
            See all
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-charcoal-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="w-full aspect-[4/3] img-shimmer flex-shrink-0" />
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="h-4 bg-charcoal-700 rounded img-shimmer" />
                  <div className="h-3 bg-charcoal-700 rounded w-2/3 img-shimmer" />
                </div>
              </div>
            ))
          ) : popularItems && popularItems.length > 0 ? (
            popularItems.slice(0, 4).map((item) => (
              <HomeFoodCard
                key={item.id}
                item={item}
                onClick={() => onItemSelect(item)}
              />
            ))
          ) : (
            <div className="col-span-2 sm:col-span-2 lg:col-span-4 bg-charcoal-800 rounded-2xl p-6 border border-charcoal-700/30 text-center">
              <p className="text-charcoal-400">No popular items available right now. Check the full menu.</p>
              <div className="mt-3">
                <button
                  onClick={() => onNavigate('menu')}
                  className="inline-flex items-center gap-2 bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-heading font-bold text-sm px-4 py-2 rounded-full"
                >
                  See Menu
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-4 sm:px-6 mt-10 sm:mt-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            { icon: Sparkles, title: 'Fresh Daily', desc: 'Every dish made fresh to order with quality ingredients.' },
            { icon: Clock, title: 'Quick Service', desc: 'Most orders ready in 20 minutes or less.' },
            { icon: Utensils, title: 'Dine In or Takeaway', desc: 'Enjoy in our cozy cafe or grab and go.' },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-charcoal-800 rounded-2xl p-4 sm:p-5 border border-charcoal-700/30">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cream-400/10 flex items-center justify-center mb-3">
                  <Icon size={20} className="text-cream-400" />
                </div>
                <h3 className="font-heading font-semibold text-cream-50 text-sm sm:text-base mb-1">{feature.title}</h3>
                <p className="text-charcoal-300 text-xs sm:text-sm">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Location & Contact */}
      <section className="px-4 sm:px-6 mt-10 sm:mt-12 max-w-6xl mx-auto pb-28 md:pb-12 w-full">
        <div className="bg-charcoal-800 rounded-2xl overflow-hidden border border-charcoal-700/30">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Info */}
            <div className="p-4 sm:p-8">
              <h2 className="font-heading font-bold text-xl sm:text-2xl text-cream-50 mb-1">Visit Us</h2>
              <p className="text-cream-400 text-sm mb-6 font-display">Come say hi at Bhukkad Cafe</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-charcoal-700 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-cream-400" />
                  </div>
                  <div>
                    <h3 className="text-cream-50 font-medium text-sm">Location</h3>
                    <p className="text-charcoal-300 text-sm">Paraw, area main bazar kandaghat.<br />Kandaghat, Himachal Pradesh, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-charcoal-700 flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-cream-400" />
                  </div>
                  <div>
                    <h3 className="text-cream-50 font-medium text-sm">Contact</h3>
                    <a href="tel:+918544723922" className="text-charcoal-300 text-sm hover:text-cream-300 transition-colors">
                      +91 85447 23922
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-charcoal-700 flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-cream-400" />
                  </div>
                  <div>
                    <h3 className="text-cream-50 font-medium text-sm">Opening Hours</h3>
                    <p className="text-charcoal-300 text-sm">Monday - Sunday: 10 AM - 11 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-charcoal-700 flex items-center justify-center flex-shrink-0">
                    <Truck size={18} className="text-cream-400" />
                  </div>
                  <div>
                    <h3 className="text-cream-50 font-medium text-sm">Order Options</h3>
                    <p className="text-charcoal-300 text-sm">Dine In, Takeaway & Online Delivery</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('contact')}
                className="mt-6 inline-flex items-center gap-2 bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-bold text-sm px-5 py-3 rounded-full transition-all duration-200 active:scale-95"
              >
                Get in Touch
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Map placeholder */}
            <div className="relative min-h-[200px] bg-charcoal-900">
              <iframe
                title="Bhukkad Cafe Location"
                src="https://www.openstreetmap.org/export/embed.html?bbox=76.0,27.0,76.1,27.1&layer=mapnik"
                className="w-full h-full min-h-[200px] grayscale opacity-70"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
