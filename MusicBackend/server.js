require('dotenv').config();
const express = require('express');
const ytdlp = require('yt-dlp-exec');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';

// 🔍 Search endpoint
app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`${YOUTUBE_API}/search`, {
      params: {
        part: 'snippet',
        q: q + ' song',
        type: 'video',
        videoCategoryId: '10',
        maxResults: 20,
        key: YOUTUBE_API_KEY,
      },
    });

    const songs = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url,
    }));

    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🎵 Stream endpoint
app.get('/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const cookiesPath =
      process.env.NODE_ENV === 'production'
        ? '/etc/secrets/cookies.txt' // Render pe
        : path.join(__dirname, 'cookies.txt'); // Local pe

    const info = await ytdlp(`https://www.youtube.com/watch?v=${videoId}`, {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'bestaudio',
      cookies: cookiesPath, // ← cookies add kiya
      extractorArgs: 'youtube:player_client=web',
    });

    const audioFormat =
      info.formats
        .filter(f => f.acodec !== 'none' && f.vcodec === 'none')
        .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0] || info.formats[0];

    res.json({
      streamUrl: audioFormat.url,
      title: info.title,
      artist: info.uploader,
      duration: info.duration,
      thumbnail: info.thumbnail,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 🔥 Trending endpoint
app.get('/trending', async (req, res) => {
  try {
    const response = await axios.get(`${YOUTUBE_API}/videos`, {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        videoCategoryId: '10',
        regionCode: 'NP',
        maxResults: 20,
        key: YOUTUBE_API_KEY,
      },
    });

    const songs = response.data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url,
    }));

    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
