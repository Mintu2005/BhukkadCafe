export const DEFAULT_FOOD_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=75';

/**
 * Optimizes an image URL for the requested display width.
 * For Unsplash images, replaces/adds width and quality parameters for fast loading.
 * Non-Unsplash images and local images are returned untouched.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  width = 400,
  quality = 75
): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_FOOD_IMAGE;
  }

  const trimmed = url.trim();

  // If it's an Unsplash image, optimize query parameters
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(trimmed);
      urlObj.searchParams.set('w', String(width));
      urlObj.searchParams.set('q', String(quality));
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', 'crop');
      return urlObj.toString();
    } catch {
      // Fallback regex replacement if URL parsing fails
      return trimmed
        .replace(/([?&])w=\d+/, `$1w=${width}`)
        .replace(/([?&])q=\d+/, `$1q=${quality}`);
    }
  }

  return trimmed;
}
