import axios from 'axios';
import ytdl from 'react-native-ytdl';
// Apni YouTube API key yahan daalo
const YOUTUBE_API_KEY = 'AIzaSyD134MNsYcotYylXwSQ3DHvHZjE0EEdNtU';
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';

// Invidious instances for stream URLs (Piped se alag infrastructure)
const INVIDIOUS_INSTANCES = [
  'https://inv.nadeko.net',
  'https://invidious.nerdvpn.de',
  'https://iv.datura.network',
  'https://invidious.privacyredirect.com',
];

let invidiousIndex = 0;

const getInvidiousBase = () => INVIDIOUS_INSTANCES[invidiousIndex];

const switchInvidious = () => {
  invidiousIndex = (invidiousIndex + 1) % INVIDIOUS_INSTANCES.length;
  console.log('Invidious switched to:', getInvidiousBase());
};

// 🔍 YouTube se search karo
export const searchSongs = async query => {
  try {
    const response = await axios.get(`${YOUTUBE_API}/search`, {
      params: {
        part: 'snippet',
        q: query + ' song',
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults: 20,
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000,
    });

    return response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      duration: 0,
    }));
  } catch (error) {
    console.error(
      'YouTube search error:',
      error.response?.data || error.message,
    );
    throw new Error(
      'Search failed: ' +
        (error.response?.data?.error?.message || error.message),
    );
  }
};

// 🎵 Invidious se stream URL lao

export const getSongStream = async videoId => {
  try {
    const youtubeURL = `https://www.youtube.com/watch?v=${videoId}`;

    const urls = await ytdl(youtubeURL, { quality: 'highestaudio' });

    if (!urls || urls.length === 0) throw new Error('No stream found');

    // Pehla URL best audio hoga
    const bestStream = urls[0];

    return {
      streamUrl: bestStream.url,
      headers: bestStream.headers, // Important! Yeh bhi chahiye
      title: '', // YouTube search se already hai
      artist: '',
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      videoId,
    };
  } catch (error) {
    console.error('ytdl error:', error.message);
    throw new Error('Stream fetch failed: ' + error.message);
  }
};

// 🔥 Trending — YouTube se
export const getTrending = async () => {
  try {
    const response = await axios.get(`${YOUTUBE_API}/videos`, {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        videoCategoryId: '10', // Music
        regionCode: 'NP',
        maxResults: 20,
        key: YOUTUBE_API_KEY,
      },
      timeout: 10000,
    });

    return response.data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      duration: 0,
    }));
  } catch {
    return [];
  }
};
