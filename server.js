import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve index.html from the root directory
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

// Movie embed proxy
app.get("/movie/embed", async (req, res) => {
  const { tmdb } = req.query;

  if (!tmdb) {
    return res.status(400).send("Missing tmdb query parameter.");
  }

  const target = `https://vidsrc.net/embed/movie?tmdb=${tmdb}`;

  try {
    const remoteRes = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": "https://vidsrc.net/",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      }
    });

    if (!remoteRes.ok) {
      return res.status(remoteRes.status).send("Remote server error");
    }

    const contentType = remoteRes.headers.get("content-type") || "text/html";
    const body = await remoteRes.text();

    res.set({
      "Content-Type": contentType,
      "Content-Security-Policy": "frame-ancestors 'self';",
      "Cache-Control": "no-store"
    });

    res.send(body);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502).send("Failed to proxy embed page.");
  }
});

// Serve movies.json via API
app.get("/api/movies", (req, res) => {
  const filePath = path.join(process.cwd(), "movies.json");

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const movies = JSON.parse(raw);
    res.json(movies);
  } catch (err) {
    console.error("Error reading movies.json:", err);
    res.status(500).send("Failed to read movies data.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
