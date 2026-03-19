import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_CSE_URL = 'https://www.googleapis.com/customsearch/v1';
const GOOGLE_CSE_API_KEY = 'AIzaSyCWORHOffGMXmiAjvRc2HM6kljlILD9KJs';
const GOOGLE_CSE_SEARCH_ENGINE_ID = '8607676e10f074a90';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.q;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  const trimmed = q.trim();
  if (!trimmed) {
    return res.json({ results: [] });
  }

  try {
    const url = `${GOOGLE_CSE_URL}?key=${GOOGLE_CSE_API_KEY}&cx=${GOOGLE_CSE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(trimmed)}&num=10`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData?.error?.message || `Google API error: ${response.status}`,
      });
    }

    const data = await response.json();

    if (!data.items) {
      return res.json({ results: [] });
    }

    const results = data.items.map((item: any) => ({
      title: item.title || 'Untitled',
      url: item.link,
      snippet: item.snippet || '',
      displayUrl: item.displayLink || new URL(item.link).hostname,
      imageUrl: item.pagemap?.cse_image?.[0]?.src || null,
    }));

    return res.json({ results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Search failed' });
  }
}
