// Serverless: /api/fetch-photo?name=Player%20Name
// Tries multiple providers, returns first hit. All URLs are proxied through
// images.weserv.nl to avoid CORS problems from the front-end.
type Ok = { url: string; source: string };
type Fail = { error: string };
type Res = Ok | Fail;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

function proxy(url: string): string {
  // strip protocol; weserv wants host+path
  const clean = url.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}`;
}

async function tryWikiSummary(name: string): Promise<Ok | null> {
  try {
    const q = encodeURIComponent(name.replace(/\s+/g, '_'));
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${q}`, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const j: any = await r.json();
    const url = j?.originalimage?.source || j?.thumbnail?.source;
    return url ? { url: proxy(url), source: 'wikipedia' } : null;
  } catch { return null; }
}

async function tryWikiSearch(name: string): Promise<Ok | null> {
  try {
    // Use MediaWiki API to search first, then fetch summary of the top match
    const q = encodeURIComponent(name);
    const s = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${q}&limit=1&namespace=0&format=json&origin=*`, { headers: { 'User-Agent': UA } });
    if (!s.ok) return null;
    const arr: any = await s.json();
    const title = arr?.[1]?.[0];
    if (!title) return null;
    return tryWikiSummary(String(title));
  } catch { return null; }
}

async function tryFutbin(name: string): Promise<Ok | null> {
  try {
    const q = encodeURIComponent(name);
    const r = await fetch(`https://www.futbin.com/search?year=26&term=${q}`, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const html = await r.text();
    const m = html.match(/https:\/\/cdn\.futbin\.com\/[^"']+player[^"']+\.png/i);
    return m ? { url: proxy(m[0]), source: 'futbin' } : null;
  } catch { return null; }
}

async function tryDuckDuckGoImages(name: string): Promise<Ok | null> {
  try {
    // DuckDuckGo image search HTML — quick and dirty regex for first jpg/png
    const q = encodeURIComponent(`${name} footballer portrait`);
    const r = await fetch(`https://duckduckgo.com/html/?q=${q}`, { headers: { 'User-Agent': UA } });
    if (!r.ok) return null;
    const html = await r.text();
    const m = html.match(/https?:\/\/[^"'<>\s]+?\.(?:jpg|jpeg|png|webp)/i);
    return m ? { url: proxy(m[0]), source: 'ddg' } : null;
  } catch { return null; }
}

export default async function handler(req: any, res: any) {
  const name = String(req.query?.name ?? '').trim();
  if (!name) { res.status(400).json({ error: 'name required' } as Fail); return; }
  const providers: Array<(n: string) => Promise<Ok | null>> = [tryFutbin, tryWikiSummary, tryWikiSearch, tryDuckDuckGoImages];
  for (const p of providers) {
    try {
      const hit = await p(name);
      if (hit) {
        // set a small cache header so Vercel edge / browsers can cache
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
        res.status(200).json(hit);
        return;
      }
    } catch {}
  }
  res.status(404).json({ error: 'not found' } as Fail);
}

export const config = { runtime: 'nodejs' };
