// Vercel serverless function.
// GET /api/fetch-photo?name=Ibrahim%20Mbaye
//
// Tries a chain of free image sources until one hits.
// The order is optimised for football players present in EA FC 26.

type Res = { url: string; source: string } | { error: string };

async function tryWiki(name: string): Promise<Res | null> {
  try {
    const q = encodeURIComponent(name.replace(/\s+/g, '_'));
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${q}`);
    if (!r.ok) return null;
    const j: any = await r.json();
    const url = j?.originalimage?.source || j?.thumbnail?.source;
    return url ? { url, source: 'wikipedia' } : null;
  } catch { return null; }
}

async function tryFutbin(name: string): Promise<Res | null> {
  try {
    const q = encodeURIComponent(name);
    const r = await fetch(`https://www.futbin.com/search?year=26&term=${q}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!r.ok) return null;
    const html = await r.text();
    // Very naive: pull the first image src from a player card.
    const m = html.match(/https:\/\/cdn\.futbin\.com\/[^"']+player[^"']+\.png/i);
    return m ? { url: m[0], source: 'futbin' } : null;
  } catch { return null; }
}

export default async function handler(req: any, res: any) {
  const name = String(req.query?.name ?? '').trim();
  if (!name) { res.status(400).json({ error: 'name required' }); return; }

  const providers = [tryFutbin, tryWiki];
  for (const p of providers) {
    const hit = await p(name);
    if (hit) { res.status(200).json(hit); return; }
  }
  res.status(404).json({ error: 'not found' });
}
