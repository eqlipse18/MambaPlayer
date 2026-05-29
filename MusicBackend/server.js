const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const ITUNES_API = 'https://itunes.apple.com';

// 🔍 Search
app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`${ITUNES_API}/search`, {
      params: {
        term: q,
        media: 'music',
        limit: 20,
      },
    });

    const songs = response.data.results.map(track => ({
      id: String(track.trackId),
      title: track.trackName,
      artist: track.artistName,
      thumbnail: track.artworkUrl100,
      duration: Math.floor(track.trackTimeMillis / 1000),
      preview: track.previewUrl,
    }));

    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🎵 Stream
app.get('/stream/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    const response = await axios.get(`${ITUNES_API}/lookup`, {
      params: { id: trackId },
    });

    const track = response.data.results[0];
    if (!track) throw new Error('Track not found');

    res.json({
      streamUrl: track.previewUrl,
      title: track.trackName,
      artist: track.artistName,
      duration: Math.floor(track.trackTimeMillis / 1000),
      thumbnail: track.artworkUrl100,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 Trending — iTunes top charts
app.get('/trending', async (req, res) => {
  try {
    const response = await axios.get(
      'https://rss.applemarketingtools.com/api/v2/np/music/most-played/20/songs.json',
    );

    const songs = response.data.feed.results.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artistName,
      thumbnail: track.artworkUrl100,
      duration: 0,
      preview: null,
    }));

    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
