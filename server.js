import express from "express";
import path from "path";
import fs from "fs";

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

// Movie embed via MultiEmbed (TMDB only)
app.get("/movie/embed", (req, res) => {
  const { tmdb } = req.query;
  if (!tmdb) return res.status(400).send("Missing tmdb query parameter.");

  const url = `https://multiembed.mov/?video_id=${tmdb}&tmdb=1`;
  res.redirect(url);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
