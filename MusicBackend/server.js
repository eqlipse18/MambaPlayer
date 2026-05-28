require('dotenv').config();
const express = require('express');
const ytdl = require('ytdl-core');
const cors = require('cors');
const axios = require('axios');

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
    const info = await ytdl.getInfo(
      `https://www.youtube.com/watch?v=${videoId}`,
    );
    const format = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    res.json({
      streamUrl: format.url,
      title: info.videoDetails.title,
      artist: info.videoDetails.author.name,
      duration: parseInt(info.videoDetails.lengthSeconds),
      thumbnail: info.videoDetails.thumbnails?.pop()?.url,
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
