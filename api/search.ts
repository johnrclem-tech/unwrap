import type { VercelRequest, VercelResponse } from '@vercel/node';

const DDG_URL = 'https://html.duckduckgo.com/html/';

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
    const response = await fetch(DDG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: `q=${encodeURIComponent(trimmed)}`,
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Search error: ${response.status}`,
      });
    }

    const html = await response.text();
    const results = parseResults(html);

    return res.json({ results });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Search failed' });
  }
}

interface ParsedResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl: string;
  imageUrl: string | null;
}

function parseResults(html: string): ParsedResult[] {
  const results: ParsedResult[] = [];

  // Match each result block in DuckDuckGo HTML
  const resultRegex = /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

  let match;
  while ((match = resultRegex.exec(html)) !== null && results.length < 10) {
    const rawUrl = match[1];
    const rawTitle = match[2];
    const rawSnippet = match[3];

    // DuckDuckGo wraps URLs in a redirect — extract the actual URL
    const url = extractUrl(rawUrl);
    if (!url) continue;

    const title = stripHtml(rawTitle).trim() || 'Untitled';
    const snippet = stripHtml(rawSnippet).trim();

    let displayUrl: string;
    try {
      displayUrl = new URL(url).hostname;
    } catch {
      displayUrl = url;
    }

    results.push({
      title,
      url,
      snippet,
      displayUrl,
      imageUrl: null,
    });
  }

  return results;
}

function extractUrl(ddgUrl: string): string | null {
  // DuckDuckGo uses //duckduckgo.com/l/?uddg=<encoded_url>&... redirect links
  try {
    const decoded = decodeURIComponent(ddgUrl);
    const uddgMatch = decoded.match(/[?&]uddg=([^&]+)/);
    if (uddgMatch) {
      return decodeURIComponent(uddgMatch[1]);
    }
    // Sometimes the URL is direct
    if (decoded.startsWith('http')) {
      return decoded;
    }
  } catch {
    // ignore
  }
  return null;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&nbsp;/g, ' ');
}
