import { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/next"
import "./App.css";

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

const STORAGE_KEY = "youtube-links";

function loadLinks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLinks(links) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

function App() {
  const [links, setLinks] = useState(loadLinks);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    saveLinks(links);
  }, [links]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a YouTube URL");
      return;
    }

    const id = extractYouTubeId(trimmed);
    if (!id) {
      setError("Invalid YouTube URL");
      return;
    }

    if (links.some((l) => l.id === id)) {
      setError("This video is already added");
      return;
    }

    const newLink = {
      id,
      url: trimmed,
      title: `Video ${links.length + 1}`,
      addedAt: new Date().toISOString(),
    };

    setLinks((prev) => [newLink, ...prev]);
    setUrl("");
  }

  function removeLink(id) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function clearAll() {
    if (links.length > 0 && confirm("Remove all videos?")) {
      setLinks([]);
    }
  }

  return (
    <div className="app">
      <h1>YouTube Links</h1>
      <Analytics />

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Paste a YouTube URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}
      <p className="count">{links.length} video{links.length !== 1 ? "s" : ""} saved</p>

      {links.length > 0 && (
        <button className="clear-btn" onClick={clearAll}>
          Clear All
        </button>
      )}

      <div className="grid">
        {links.map((link) => (
          <div key={link.id} className="card">
            <div className="iframe-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${link.id}`}
                title={link.title}
                allowFullScreen
              />
            </div>
            <button className="remove-btn" onClick={() => removeLink(link.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
