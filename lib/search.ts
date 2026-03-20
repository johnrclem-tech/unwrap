import { SearchResult } from '@/types';

// Simple in-memory cache (5 min TTL)
const cache = new Map<string, { results: SearchResult[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// Always call the production Vercel API for search (local dev has no API routes)
const API_BASE = 'https://unwrap-psi.vercel.app';

export async function searchWeb(queryText: string): Promise<SearchResult[]> {
  const trimmed = queryText.trim();
  if (!trimmed) return [];

  // Check cache
  const cached = cache.get(trimmed);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results;
  }

  const url = `${API_BASE}/api/search?q=${encodeURIComponent(trimmed)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || `Search failed (${response.status})`);
  }

  const data = await response.json();
  const results: SearchResult[] = data.results || [];

  cache.set(trimmed, { results, timestamp: Date.now() });
  return results;
}
