const express = require("express");
const path = require("path");
const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/movies", (req, res) => {
  try {
    const movies = JSON.parse(fs.readFileSync(path.join(__dirname, "movies.json"), "utf-8"));
    res.json(movies);
  } catch (err) {
    console.error("Failed to read movies.json", err);
    res.status(500).json({ error: "Failed to load movies" });
  }
});

app.get("/proxy/embed/:id", async (req, res) => {
  const id = req.params.id;
  const target = `https://vidsrc.to/embed/movie/${id}`;
  
  try {
    const remoteRes = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://vidsrc.to/"
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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});