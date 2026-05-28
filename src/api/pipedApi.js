import axios from 'axios';

const BACKEND_URL = 'https://mamba-backend-xxxx.onrender.com'; // apna URL

export const searchSongs = async query => {
  const response = await axios.get(`${BACKEND_URL}/search`, {
    params: { q: query },
    timeout: 10000,
  });
  return response.data;
};

export const getSongStream = async videoId => {
  const response = await axios.get(`${BACKEND_URL}/stream/${videoId}`, {
    timeout: 15000,
  });
  return { ...response.data, videoId };
};

export const getTrending = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/trending`, {
      timeout: 10000,
    });
    return response.data;
  } catch {
    return [];
  }
};
