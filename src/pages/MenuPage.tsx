import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { MenuItem, Category } from '@/lib/types';
import FoodCard from '@/components/FoodCard';
import { Search, X, ArrowUpDown } from 'lucide-react';

interface MenuPageProps {
  onItemSelect: (item: MenuItem) => void;
  initialCategory?: string;
}

type SortOption = 'default' | 'price-low' | 'price-high' | 'popular';

export default function MenuPage({ onItemSelect, initialCategory }: MenuPageProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [itemsRes, catRes] = await Promise.all([
        supabase
          .from('menu_items')
          .select('*, category:categories(*)')
          .order('display_order'),
        supabase
          .from('categories')
          .select('*')
          .order('display_order'),
      ]);
      setItems(itemsRes.data ?? []);
      setCategories(catRes.data ?? []);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory !== 'all') {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) {
        result = result.filter((i) => i.category_id === cat.id);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false)
      );
    }

    const sorted = [...result];
    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        sorted.sort((a, b) => {
          if (a.is_popular === b.is_popular) return a.display_order - b.display_order;
          return a.is_popular ? -1 : 1;
        });
        break;
      default:
        sorted.sort((a, b) => a.display_order - b.display_order);
    }
    return sorted;
  }, [items, categories, selectedCategory, searchQuery, sortBy]);

  const handleCategoryChange = useCallback((slug: string) => {
    setSelectedCategory(slug);
    setShowFilters(false);
  }, []);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSortBy('default');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' || sortBy !== 'default' || searchQuery.trim() !== '';

  return (
    <div className="animate-fade-in pb-28 md:pb-12">
      {/* Header */}
      <div className="bg-charcoal-900 sticky top-0 z-30 border-b border-charcoal-700/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-3">
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-cream-50 mb-3">Our Menu</h1>

          {/* Search bar */}
          <div className="relative mb-3">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for food..."
              className="w-full bg-charcoal-800 text-cream-50 placeholder-charcoal-400 text-sm rounded-full pl-11 pr-4 py-3 border border-charcoal-700/50 focus:border-cream-400/50 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-cream-300"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category chips - horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 pb-1">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`flex-shrink-0 px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-cream-400 text-charcoal-900'
                  : 'bg-charcoal-800 text-charcoal-200 hover:bg-charcoal-700 border border-charcoal-700/50'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  selectedCategory === cat.slug
                    ? 'bg-cream-400 text-charcoal-900'
                    : 'bg-charcoal-800 text-charcoal-200 hover:bg-charcoal-700 border border-charcoal-700/50'
                }`}
              >
                {cat.icon && <span className="text-xs">{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort & results count */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-charcoal-300 text-xs sm:text-sm">
            {loading ? 'Loading...' : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-rust-400 hover:text-rust-300 text-xs font-medium flex items-center gap-1"
              >
                <X size={14} />
                Clear
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-charcoal-200 text-xs sm:text-sm font-medium bg-charcoal-800 px-3 py-1.5 rounded-full border border-charcoal-700/50 hover:bg-charcoal-700 transition-colors"
            >
              <ArrowUpDown size={14} />
              Sort
            </button>
          </div>
        </div>

        {/* Sort options dropdown */}
        {showFilters && (
          <div className="mt-2 bg-charcoal-800 rounded-xl border border-charcoal-700/50 p-2 animate-slide-down">
            {[
              { value: 'default' as SortOption, label: 'Default Order' },
              { value: 'popular' as SortOption, label: 'Popular First' },
              { value: 'price-low' as SortOption, label: 'Price: Low to High' },
              { value: 'price-high' as SortOption, label: 'Price: High to Low' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value);
                  setShowFilters(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  sortBy === option.value
                    ? 'bg-cream-400/10 text-cream-400 font-medium'
                    : 'text-charcoal-200 hover:bg-charcoal-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-charcoal-800 rounded-2xl overflow-hidden">
                <div className="aspect-square img-shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-charcoal-700 rounded img-shimmer" />
                  <div className="h-3 bg-charcoal-700 rounded w-2/3 img-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-charcoal-800 flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-charcoal-500" />
            </div>
            <h3 className="font-heading font-semibold text-cream-50 text-lg">No items found</h3>
            <p className="text-charcoal-400 text-sm mt-1">Try a different search or category</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-cream-400 font-medium text-sm hover:text-cream-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} onClick={() => onItemSelect(item)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
