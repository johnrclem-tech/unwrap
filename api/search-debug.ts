import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Debug endpoint: returns raw HTML from DuckDuckGo so we can see
 * what the server is actually receiving. Hit /api/search-debug?q=test
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.q;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Missing query parameter "q"' });
  }

  const trimmed = q.trim();

  try {
    // Try POST (original approach)
    const postResponse = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: `q=${encodeURIComponent(trimmed)}`,
    });

    const postHtml = await postResponse.text();

    // Check for key markers
    const hasResultA = postHtml.includes('result__a');
    const hasResultSnippet = postHtml.includes('result__snippet');
    const hasResult = postHtml.includes('class="result ');
    const hasCaptcha = postHtml.includes('captcha') || postHtml.includes('bot');

    return res.json({
      status: postResponse.status,
      htmlLength: postHtml.length,
      markers: { hasResultA, hasResultSnippet, hasResult, hasCaptcha },
      // First 2000 chars for inspection
      htmlPreview: postHtml.substring(0, 2000),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Debug fetch failed' });
  }
}
