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
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    // Try POST first
    let html = '';
    let results: ParsedResult[] = [];

    const postRes = await fetch(DDG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': ua,
      },
      body: `q=${encodeURIComponent(trimmed)}`,
    });

    if (postRes.ok) {
      html = await postRes.text();
      results = parseResults(html);
    }

    // Fallback: try GET if POST returned no results
    if (results.length === 0) {
      console.log('[search] POST returned no results, trying GET fallback');
      const getRes = await fetch(
        `https://html.duckduckgo.com/html/?q=${encodeURIComponent(trimmed)}`,
        { headers: { 'User-Agent': ua } },
      );
      if (getRes.ok) {
        html = await getRes.text();
        results = parseResults(html);
      }
    }

    // Fallback: try DuckDuckGo lite
    if (results.length === 0) {
      console.log('[search] GET returned no results, trying lite fallback');
      const liteRes = await fetch(
        `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(trimmed)}`,
        { headers: { 'User-Agent': ua } },
      );
      if (liteRes.ok) {
        html = await liteRes.text();
        results = parseLiteResults(html);
      }
    }

    if (results.length === 0) {
      console.log(`[search] All methods failed for query: "${trimmed}" (html: ${html.length} bytes)`);
    }

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

  // Split HTML into individual result blocks
  const blocks = html.split(/class="result\s/);

  for (const block of blocks) {
    if (results.length >= 10) break;

    // Extract the link from result__a
    const linkMatch = block.match(/class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/);
    if (!linkMatch) continue;

    const rawUrl = linkMatch[1];
    const rawTitle = linkMatch[2];

    // Extract snippet - match any tag with class="result__snippet"
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|span|div|td)>/);
    const rawSnippet = snippetMatch ? snippetMatch[1] : '';

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

function parseLiteResults(html: string): ParsedResult[] {
  const results: ParsedResult[] = [];

  // DuckDuckGo Lite uses a table-based layout with links in <a class="result-link">
  // or simple <a> tags inside result rows
  const linkRegex = /<a[^>]+href="([^"]*)"[^>]*class="result-link"[^>]*>([\s\S]*?)<\/a>/g;
  let match;

  while ((match = linkRegex.exec(html)) !== null && results.length < 10) {
    const rawUrl = match[1];
    const rawTitle = match[2];

    const url = extractUrl(rawUrl);
    if (!url) continue;

    const title = stripHtml(rawTitle).trim() || 'Untitled';
    let displayUrl: string;
    try {
      displayUrl = new URL(url).hostname;
    } catch {
      displayUrl = url;
    }

    results.push({ title, url, snippet: '', displayUrl, imageUrl: null });
  }

  // If the class-based regex didn't work, try a broader approach
  // Lite results often have links followed by snippet text in <td> tags
  if (results.length === 0) {
    const rows = html.split(/<tr>/);
    for (const row of rows) {
      if (results.length >= 10) break;
      const aMatch = row.match(/<a[^>]+href="(\/\/duckduckgo\.com\/l\/[^"]*|https?:\/\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/);
      if (!aMatch) continue;

      const rawUrl = aMatch[1];
      const rawTitle = aMatch[2];

      const url = extractUrl(rawUrl.startsWith('//') ? 'https:' + rawUrl : rawUrl);
      if (!url) continue;

      const title = stripHtml(rawTitle).trim();
      if (!title) continue;

      // Try to get snippet from the next <td class="result-snippet">
      const snippetMatch = row.match(/class="result-snippet"[^>]*>([\s\S]*?)<\/td>/);
      const snippet = snippetMatch ? stripHtml(snippetMatch[1]).trim() : '';

      let displayUrl: string;
      try {
        displayUrl = new URL(url).hostname;
      } catch {
        displayUrl = url;
      }

      results.push({ title, url, snippet, displayUrl, imageUrl: null });
    }
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
