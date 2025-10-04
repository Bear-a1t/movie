app.get("/proxy/embed", async (req, res) => {
  const { type, tmdb } = req.query;

  if (!type || !tmdb) {
    return res.status(400).send("Missing type or tmdb query parameters.");
  }

  const target = `https://vidsrc.net/embed/${type}?tmdb=${tmdb}`;

  try {
    const remoteRes = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://vidsrc.net/"
      }
    });

    if (!remoteRes.ok) {
      return res.status(remoteRes.status).send("Remote server error");
    }

    const contentType = remoteRes.headers.get("content-type") || "text/html";
    const body = await remoteRes.text();

    res.removeHeader("X-Frame-Options");
    res.set("Content-Type", contentType);
    res.set("Content-Security-Policy", "frame-ancestors 'self';");
    res.set("Cache-Control", "no-store");
    
    res.send(body);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502).send("Failed to proxy embed page.");
  }
});
