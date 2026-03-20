import type { VercelRequest, VercelResponse } from '@vercel/node';

const SERPER_API_KEY = process.env.SERPER_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.q;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  const trimmed = q.trim();
  if (!trimmed) {
    return res.json({ results: [] });
  }

  if (!SERPER_API_KEY) {
    return res.status(500).json({ error: 'Serper API key not configured' });
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: trimmed, num: 10 }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.message || 'Search request failed';
      return res.status(response.status).json({ error: msg });
    }

    const results = (data.organic || []).map((item: any) => {
      let displayUrl: string;
      try {
        displayUrl = new URL(item.link).hostname;
      } catch {
        displayUrl = item.link;
      }

      return {
        title: item.title || 'Untitled',
        url: item.link,
        snippet: item.snippet || '',
        displayUrl,
        imageUrl: item.imageUrl || item.thumbnail || null,
      };
    });

    return res.json({ results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Search failed' });
  }
}
