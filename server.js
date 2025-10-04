import express from "express";
import path from "path";
import fs from "fs";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (images, CSS, etc.)
app.use(express.static(path.join(process.cwd())));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "index.html"));
});

// Movies API
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

// Movie embed proxy
app.get("/movie/embed", async (req, res) => {
  const { tmdb } = req.query;
  if (!tmdb) return res.status(400).send("Missing tmdb query parameter.");

  const target = `https://vidsrc.net/embed/movie?tmdb=${tmdb}`;

  try {
    const remoteRes = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "text/html",
        "Referer": "https://vidsrc.net/"
      }
    });

    if (!remoteRes.ok) return res.status(remoteRes.status).send("Remote server error");

    const body = await remoteRes.text();

    res.set({
      "Content-Type": "text/html",
      "Cache-Control": "no-store"
    });

    res.send(body);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(502).send("Failed to proxy embed page.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
