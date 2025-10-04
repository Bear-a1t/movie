import express from "express";
import fetch from "node-fetch";
import path from "path";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve index.html from the same directory
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
