import { Product } from '@/types';
import { GOOGLE_CSE_API_KEY, GOOGLE_CSE_SEARCH_ENGINE_ID } from '@/constants/Config';

const GOOGLE_CSE_URL = 'https://www.googleapis.com/customsearch/v1';

// Simple in-memory cache (5 min TTL)
const cache = new Map<string, { results: Product[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function extractPrice(item: any): string | null {
  // Try structured data first
  const offer = item.pagemap?.offer?.[0];
  if (offer?.price) {
    return `$${offer.price}`;
  }
  if (offer?.pricecurrency && offer?.price) {
    return `${offer.pricecurrency} ${offer.price}`;
  }

  // Fall back to regex on snippet
  const snippet = item.snippet || '';
  const match = snippet.match(/\$[\d,]+\.?\d{0,2}/);
  return match ? match[0] : null;
}

export async function searchProducts(queryText: string): Promise<Product[]> {
  const trimmed = queryText.trim();
  if (!trimmed) return [];

  // Check cache
  const cached = cache.get(trimmed);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results;
  }

  try {
    const url = `${GOOGLE_CSE_URL}?key=${GOOGLE_CSE_API_KEY}&cx=${GOOGLE_CSE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(trimmed + ' buy')}&num=10`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) return [];

    const results: Product[] = data.items.map((item: any) => ({
      title: item.title?.replace(/ - .*$/, '') || 'Unknown Product',
      price: extractPrice(item),
      imageUrl: item.pagemap?.cse_image?.[0]?.src || null,
      sourceUrl: item.link,
      sourceName: new URL(item.link).hostname.replace('www.', ''),
    }));

    cache.set(trimmed, { results, timestamp: Date.now() });
    return results;
  } catch (error) {
    console.error('Search failed:', error);
    return [];
  }
}
