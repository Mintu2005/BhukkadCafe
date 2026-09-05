import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { MenuItem, Category } from '@/lib/types';
import FoodCard from '@/components/FoodCard';
import Logo from '@/components/Logo';
import type { PageId } from '@/components/BottomNav';
import { ArrowRight, MapPin, Phone, Clock, Star, Flame, Truck, Utensils, Sparkles } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId, params?: Record<string, unknown>) => void;
  onItemSelect: (item: MenuItem) => void;
}

export default function HomePage({ onNavigate, onItemSelect }: HomePageProps) {
  const [popularItems, setPopularItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [popularRes, catRes] = await Promise.all([
        supabase
          .from('menu_items')
          .select('*, category:categories(*)')
          .eq('is_popular', true)
          .eq('is_available', true)
          .order('display_order')
          .limit(6),
        supabase
          .from('categories')
          .select('*')
          .order('display_order'),
      ]);
      let popular = (popularRes.data ?? []) as MenuItem[];
      // if no explicit popular items, fallback to available items so the section isn't empty
      if (!popular || popular.length === 0) {
        try {
          const fallback = await supabase
            .from('menu_items')
            .select('*, category:categories(*)')
            .eq('is_available', true)
            .order('display_order')
            .limit(6);
          popular = (fallback.data ?? []) as MenuItem[];
        } catch {
          popular = [];
        }
      }
      setPopularItems(popular);
      setCategories(catRes.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Fetch one image per category from menu_items as a graceful fallback
  useEffect(() => {
    if (categories.length === 0) return;
    const fetchCatImages = async () => {
      try {
        const imgMap: Record<string, string> = {};
        await Promise.all(
          categories.map(async (cat) => {
            try {
              const res = await supabase
                .from('menu_items')
                .select('image_url')
                .eq('category_id', cat.id)
                .eq('is_available', true)
                .not('image_url', 'is', null)
                .order('display_order')
                .limit(1);
              const rows = res.data as Array<{ image_url?: string }> | null;
              const url = rows && rows[0]?.image_url ? String(rows[0].image_url).trim() : '';
              if (url && (url.startsWith('http') || url.startsWith('/'))) {
                imgMap[String(cat.id)] = url;
              }
            } catch {
              // ignore per-category errors
            }
          })
        );
        setCategoryImages(imgMap);
      } catch {
        // ignore
      }
    };
    fetchCatImages();
  }, [categories.length]);

  return (
    <div className="animate-fade-in">
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
        <div className="relative z-10 px-6 max-w-6xl mx-auto pt-16 pb-20">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
            {/* Left: sign image */}
            <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center md:justify-start">
              <img
                src="/images/logo.png"
                alt="Bhukkad signboard"
                className="rounded-full w-56 h-56 md:w-72 md:h-72 object-contain shadow-2xl"
                style={{ filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.6))' }}
              />
            </div>

            {/* Right: text */}
            <div className="text-center md:text-left w-full md:w-1/2">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-cream-50 font-bold mb-4">Good Food. Good Mood.</h1>
              <p className="text-cream-200/80 text-sm sm:text-base max-w-lg mb-3">
                Where every craving meets its match. Fresh, bold, and full of flavour — made just for you at Bhukkad Cafe.
              </p>
              <div className="inline-flex items-center gap-2 bg-charcoal-900/60 px-3 py-1 rounded-full mb-4">
                <span className="text-cream-300 text-xs">Fresh</span>
                <span className="text-charcoal-600">•</span>
                <span className="text-cream-300 text-xs">Fast</span>
                <span className="text-charcoal-600">•</span>
                <span className="text-cream-300 text-xs">Delicious</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <button
                  onClick={() => onNavigate('menu')}
                  className="group inline-flex items-center gap-2 bg-cream-400 hover:bg-cream-300 text-charcoal-900 font-heading font-bold text-base px-6 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  Order Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => onNavigate('menu')}
                  className="inline-flex items-center gap-2 border border-charcoal-700 text-cream-200 px-5 py-3 rounded-full hover:bg-charcoal-800/60 transition-colors"
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

      {/* Special Offers Banner */}
      <section className="px-4 sm:px-6 mt-8 relative z-10 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-rust-600 to-rust-500 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-xl mx-2 sm:mx-0">
          <div className="w-12 h-12 rounded-full bg-cream-400 flex items-center justify-center flex-shrink-0">
            <Flame size={24} className="text-rust-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-bold text-cream-50 text-sm sm:text-base">Today's Special</h3>
            <p className="text-cream-100/90 text-xs sm:text-sm">Free Oreo Shake with any order above &#8377;300</p>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="bg-cream-50 text-rust-600 font-bold text-xs sm:text-sm px-4 py-2 rounded-full hover:bg-cream-100 transition-colors flex-shrink-0"
          >
            Grab Now
          </button>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="px-4 sm:px-6 mt-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-xl sm:text-2xl text-cream-50">Browse Categories</h2>
          <button
            onClick={() => onNavigate('menu')}
            className="text-cream-400 text-sm font-medium hover:text-cream-300 transition-colors flex items-center gap-1"
          >
            See all
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-20 h-28 bg-charcoal-800 rounded-2xl img-shimmer" />
              ))
            : categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onNavigate('menu', { category: cat.slug })}
                  className="flex-shrink-0 w-32 sm:w-36 flex flex-col items-center gap-2 group"
                >
                  <div className="w-28 h-20 sm:w-32 sm:h-24 rounded-2xl bg-charcoal-800 border border-charcoal-700/50 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg">
                    {categoryImages[cat.id] ? (
                      <img src={categoryImages[cat.id]} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-3xl">{cat.icon}</div>
                    )}
                  </div>
                  <span className="text-charcoal-200 text-sm font-medium text-center leading-tight group-hover:text-cream-300 transition-colors">
                    {cat.name}
                  </span>
                </button>
              ))}
        </div>
      </section>

      {/* Popular Items */}
      <section className="px-4 sm:px-6 mt-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-cream-400 fill-current" />
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-cream-50">Popular Picks</h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-cream-400 text-sm font-medium hover:text-cream-300 transition-colors flex items-center gap-1"
          >
            See all
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-charcoal-800 rounded-2xl overflow-hidden">
                <div className="aspect-square img-shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-charcoal-700 rounded img-shimmer" />
                  <div className="h-3 bg-charcoal-700 rounded w-2/3 img-shimmer" />
                </div>
              </div>
            ))
          ) : popularItems && popularItems.length > 0 ? (
            popularItems.slice(0, 4).map((item) => (
              <FoodCard key={item.id} item={item} onClick={() => onItemSelect(item)} />
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
      <section className="px-4 sm:px-6 mt-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Sparkles, title: 'Fresh Daily', desc: 'Every dish made fresh to order with quality ingredients.' },
            { icon: Clock, title: 'Quick Service', desc: 'Most orders ready in 20 minutes or less.' },
            { icon: Utensils, title: 'Dine In or Takeaway', desc: 'Enjoy in our cozy cafe or grab and go.' },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-charcoal-800 rounded-2xl p-5 border border-charcoal-700/30">
                <div className="w-11 h-11 rounded-xl bg-cream-400/10 flex items-center justify-center mb-3">
                  <Icon size={22} className="text-cream-400" />
                </div>
                <h3 className="font-heading font-semibold text-cream-50 text-base mb-1">{feature.title}</h3>
                <p className="text-charcoal-300 text-sm">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Location & Contact */}
      <section className="px-4 sm:px-6 mt-12 max-w-6xl mx-auto pb-28 md:pb-12">
        <div className="bg-charcoal-800 rounded-2xl overflow-hidden border border-charcoal-700/30">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Info */}
            <div className="p-6 sm:p-8">
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
