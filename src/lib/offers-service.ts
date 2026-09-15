import { supabase } from '@/lib/supabase';
import type { Offer } from '@/lib/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
let todayOffersCache: CacheEntry<Offer[]> | null = null;
let settingCache: CacheEntry<boolean> | null = null;

/**
 * Check if a Supabase error is due to a missing table (42P01 / 404 relation not found)
 */
function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string; message?: string; status?: number };
  return (
    err.code === '42P01' ||
    err.status === 404 ||
    (typeof err.message === 'string' &&
      (err.message.includes('relation') || err.message.includes('not found') || err.message.includes('does not exist')))
  );
}

/**
 * Fetch all active Today Special offers for the customer-facing Home Page.
 * Returns empty array gracefully if table is not yet created or has no active offers.
 */
export async function fetchTodayOffers(force = false): Promise<Offer[]> {
  const now = Date.now();
  if (!force && todayOffersCache && now - todayOffersCache.timestamp < CACHE_TTL) {
    return todayOffersCache.data;
  }

  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('is_active', true)
      .eq('is_today_special', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        console.warn('The "offers" table is not yet created in Supabase. Returning empty offers.');
        return [];
      }
      throw error;
    }

    const offers = (data ?? []) as Offer[];
    todayOffersCache = { data: offers, timestamp: Date.now() };
    return offers;
  } catch (err) {
    console.error('Failed to fetch today offers:', err);
    return [];
  }
}

/**
 * Fetch the master "show_today_offers" setting from app_settings.
 * Defaults to true if table doesn't exist or setting is missing.
 */
export async function fetchTodayOffersSetting(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && settingCache && now - settingCache.timestamp < CACHE_TTL) {
    return settingCache.data;
  }

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'show_today_offers')
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) {
        return true; // Default to true if table not yet migrated
      }
      throw error;
    }

    // If no row found, default to true
    const isEnabled = data?.value !== 'false';
    settingCache = { data: isEnabled, timestamp: Date.now() };
    return isEnabled;
  } catch (err) {
    console.warn('Could not read show_today_offers setting:', err);
    return true;
  }
}

/**
 * Admin: Update master "show_today_offers" switch.
 */
export async function updateTodayOffersSetting(enabled: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('app_settings').upsert({
      key: 'show_today_offers',
      value: enabled ? 'true' : 'false',
      description: 'Master switch to show/hide Today Special offers on the customer home page',
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    settingCache = { data: enabled, timestamp: Date.now() };
    return { success: true };
  } catch (err) {
    console.error('Failed to update show_today_offers setting:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update setting',
    };
  }
}

/**
 * Admin: Fetch all offers regardless of status.
 */
export async function fetchAllOffers(): Promise<{ data: Offer[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: (data ?? []) as Offer[] };
  } catch (err) {
    console.error('Failed to fetch all offers:', err);
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch offers',
    };
  }
}

/**
 * Admin: Create a new offer.
 */
export async function createOffer(
  payload: Omit<Offer, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Offer | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .insert({
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
        original_price: payload.original_price,
        offer_price: payload.offer_price,
        discount_text: payload.discount_text?.trim() || null,
        image_url: payload.image_url || null,
        is_active: payload.is_active,
        is_today_special: payload.is_today_special,
        display_order: payload.display_order ?? 0,
      })
      .select()
      .single();

    if (error) throw error;

    todayOffersCache = null; // Invalidate cache
    return { data: data as Offer };
  } catch (err) {
    console.error('Failed to create offer:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create offer',
    };
  }
}

/**
 * Admin: Update an existing offer.
 */
export async function updateOffer(
  id: string,
  payload: Partial<Omit<Offer, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Offer | null; error?: string }> {
  try {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (payload.title !== undefined) updateData.title = payload.title.trim();
    if (payload.description !== undefined) updateData.description = payload.description?.trim() || null;
    if (payload.original_price !== undefined) updateData.original_price = payload.original_price;
    if (payload.offer_price !== undefined) updateData.offer_price = payload.offer_price;
    if (payload.discount_text !== undefined) updateData.discount_text = payload.discount_text?.trim() || null;
    if (payload.image_url !== undefined) updateData.image_url = payload.image_url;
    if (payload.is_active !== undefined) updateData.is_active = payload.is_active;
    if (payload.is_today_special !== undefined) updateData.is_today_special = payload.is_today_special;
    if (payload.display_order !== undefined) updateData.display_order = payload.display_order;

    const { data, error } = await supabase
      .from('offers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    todayOffersCache = null; // Invalidate cache
    return { data: data as Offer };
  } catch (err) {
    console.error('Failed to update offer:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update offer',
    };
  }
}

/**
 * Admin: Delete an offer.
 */
export async function deleteOffer(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('offers').delete().eq('id', id);
    if (error) throw error;

    todayOffersCache = null; // Invalidate cache
    return { success: true };
  } catch (err) {
    console.error('Failed to delete offer:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete offer',
    };
  }
}

/**
 * Admin: Upload an offer image to the menu-images storage bucket.
 */
export async function uploadOfferImage(file: File): Promise<string> {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Only JPEG, PNG, WebP, and GIF images are supported.');
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error('Image size must be less than 5MB.');
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const sanitizedExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExt) ? fileExt : 'jpg';
  const fileName = `offer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${sanitizedExt}`;
  const filePath = `offers/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(
      uploadError.message.includes('row-level security') || uploadError.message.includes('policy')
        ? "Storage permission denied. Ensure your admin user has app_metadata.role = 'admin'."
        : `Image upload failed: ${uploadError.message}`
    );
  }

  const { data: urlData } = supabase.storage.from('menu-images').getPublicUrl(filePath);
  if (!urlData?.publicUrl) {
    throw new Error('Failed to retrieve public image URL after upload.');
  }

  return urlData.publicUrl;
}
