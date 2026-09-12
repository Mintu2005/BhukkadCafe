import { supabase } from '@/lib/supabase';
import type { MenuItem, Category } from '@/lib/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let categoriesCache: CacheEntry<Category[]> | null = null;
let menuItemsCache: CacheEntry<MenuItem[]> | null = null;
let popularItemsCache: CacheEntry<MenuItem[]> | null = null;
let categoryImagesCache: CacheEntry<Record<string, string>> | null = null;

// Promise deduplication to avoid duplicate concurrent in-flight requests
let pendingCategoriesPromise: Promise<Category[]> | null = null;
let pendingMenuItemsPromise: Promise<MenuItem[]> | null = null;
let pendingPopularItemsPromise: Promise<MenuItem[]> | null = null;

export async function fetchCategories(force = false): Promise<Category[]> {
  const now = Date.now();
  if (!force && categoriesCache && now - categoriesCache.timestamp < CACHE_TTL) {
    return categoriesCache.data;
  }

  if (pendingCategoriesPromise) {
    return pendingCategoriesPromise;
  }

  pendingCategoriesPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      const result = (data ?? []) as Category[];
      categoriesCache = { data: result, timestamp: Date.now() };
      return result;
    } finally {
      pendingCategoriesPromise = null;
    }
  })();

  return pendingCategoriesPromise;
}

export async function fetchMenuItems(force = false): Promise<MenuItem[]> {
  const now = Date.now();
  if (!force && menuItemsCache && now - menuItemsCache.timestamp < CACHE_TTL) {
    return menuItemsCache.data;
  }

  if (pendingMenuItemsPromise) {
    return pendingMenuItemsPromise;
  }

  pendingMenuItemsPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*, category:categories(*)')
        .order('display_order');

      if (error) throw error;
      const result = (data ?? []) as MenuItem[];
      menuItemsCache = { data: result, timestamp: Date.now() };
      return result;
    } finally {
      pendingMenuItemsPromise = null;
    }
  })();

  return pendingMenuItemsPromise;
}

export async function fetchPopularItems(force = false): Promise<MenuItem[]> {
  const now = Date.now();
  if (!force && popularItemsCache && now - popularItemsCache.timestamp < CACHE_TTL) {
    return popularItemsCache.data;
  }

  if (pendingPopularItemsPromise) {
    return pendingPopularItemsPromise;
  }

  pendingPopularItemsPromise = (async () => {
    try {
      const { data } = await supabase
        .from('menu_items')
        .select('*, category:categories(*)')
        .eq('is_popular', true)
        .eq('is_available', true)
        .order('display_order')
        .limit(6);

      let popular = (data ?? []) as MenuItem[];
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

      popularItemsCache = { data: popular, timestamp: Date.now() };
      return popular;
    } finally {
      pendingPopularItemsPromise = null;
    }
  })();

  return pendingPopularItemsPromise;
}

/**
 * Derives one representative image per category in a single query
 * rather than firing N individual queries for each category.
 */
export async function fetchCategoryImages(_categories?: Category[]): Promise<Record<string, string>> {
  const now = Date.now();
  if (categoryImagesCache && now - categoryImagesCache.timestamp < CACHE_TTL) {
    return categoryImagesCache.data;
  }

  try {
    const { data } = await supabase
      .from('menu_items')
      .select('category_id, image_url')
      .eq('is_available', true)
      .not('image_url', 'is', null)
      .order('display_order');

    const imgMap: Record<string, string> = {};
    if (data && Array.isArray(data)) {
      for (const row of data) {
        const catId = String(row.category_id);
        const url = row.image_url ? String(row.image_url).trim() : '';
        if (url && !imgMap[catId] && (url.startsWith('http') || url.startsWith('/'))) {
          imgMap[catId] = url;
        }
      }
    }

    categoryImagesCache = { data: imgMap, timestamp: Date.now() };
    return imgMap;
  } catch {
    return {};
  }
}

export function invalidateMenuCache(): void {
  categoriesCache = null;
  menuItemsCache = null;
  popularItemsCache = null;
  categoryImagesCache = null;
}
