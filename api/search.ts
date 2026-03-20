import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.q;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  const trimmed = q.trim();
  if (!trimmed) {
    return res.json({ results: [] });
  }

  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    return res.status(500).json({ error: 'Google API credentials not configured' });
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(trimmed)}&num=10`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      const msg = data?.error?.message || 'Google search request failed';
      return res.status(response.status).json({ error: msg });
    }

    const results = (data.items || []).map((item: any) => {
      let imageUrl: string | null = null;
      if (item.pagemap?.cse_image?.[0]?.src) {
        imageUrl = item.pagemap.cse_image[0].src;
      } else if (item.pagemap?.cse_thumbnail?.[0]?.src) {
        imageUrl = item.pagemap.cse_thumbnail[0].src;
      }

      let displayUrl: string;
      try {
        displayUrl = new URL(item.link).hostname;
      } catch {
        displayUrl = item.displayLink || item.link;
      }

      return {
        title: item.title || 'Untitled',
        url: item.link,
        snippet: item.snippet || '',
        displayUrl,
        imageUrl,
      };
    });

    return res.json({ results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Search failed' });
  }
}
