// Vercel serverless catch-all proxy for adsb.lol
// Handles: /api/adsb/v2/lat/.../lon/.../dist/...
export default async function handler(req, res) {
    const { path } = req.query;
    const upstreamPath = '/' + (Array.isArray(path) ? path.join('/') : path);
    const upstream = `https://api.adsb.lol${upstreamPath}`;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const r = await fetch(upstream, {
            headers: { 'User-Agent': 'RufforthRadar/2.0', 'Accept': 'application/json' },
            signal: AbortSignal.timeout(9000)
        });
        if (!r.ok) return res.status(r.status).json({ error: `Upstream ${r.status}` });
        const data = await r.json();
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json(data);
    } catch (err) {
        return res.status(502).json({ error: 'proxy_error', detail: err.message });
    }
}
