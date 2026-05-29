require('dotenv').config();
const express = require('express');
const ytdlp = require('yt-dlp-exec');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const fs = require('fs');
const os = require('os');
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

const getCookiesPath = () => {
  const cookiesB64 = process.env.YOUTUBE_COOKIES_BASE64;
  if (!cookiesB64) return null;

  const tmpPath = path.join(os.tmpdir(), 'yt_cookies.txt');
  const content = Buffer.from(cookiesB64, 'base64').toString('utf-8');
  fs.writeFileSync(tmpPath, content);
  return tmpPath;
};
// 🎵 Stream endpoint
app.get('/stream/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const cookiesPath = getCookiesPath();

    const options = {
      dumpSingleJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      format: 'bestaudio',
      extractorArgs: 'youtube:player_client=web',
    };

    if (cookiesPath) options.cookies = cookiesPath;

    const info = await ytdlp(
      `https://www.youtube.com/watch?v=${videoId}`,
      options,
    );

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
