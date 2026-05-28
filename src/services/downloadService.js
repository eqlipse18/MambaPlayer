import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSongStream } from '../api/pipedApi';

const DOWNLOADS_DIR = `${RNFS.DocumentDirectoryPath}/MusicDownloads`;
const DOWNLOADS_KEY = 'downloaded_songs';

// Downloads folder banao
export const initDownloads = async () => {
  const exists = await RNFS.exists(DOWNLOADS_DIR);
  if (!exists) {
    await RNFS.mkdir(DOWNLOADS_DIR);
  }
};

// Song download karo
export const downloadSong = async (song, onProgress) => {
  try {
    await initDownloads();

    // Pehle stream URL lao
    const streamData = await getSongStream(song.id);

    const fileName = `${song.id}.mp3`;
    const filePath = `${DOWNLOADS_DIR}/${fileName}`;

    // Already downloaded hai?
    const exists = await RNFS.exists(filePath);
    if (exists) {
      console.log('Already downloaded:', song.title);
      return filePath;
    }

    console.log('Downloading:', song.title);

    // Download karo
    const downloadResult = RNFS.downloadFile({
      fromUrl: streamData.streamUrl,
      toFile: filePath,
      progress: res => {
        const progress = (res.bytesWritten / res.contentLength) * 100;
        onProgress && onProgress(Math.round(progress));
      },
    });

    await downloadResult.promise;

    // Metadata save karo AsyncStorage mein
    const savedSongs = await getDownloadedSongs();
    const updatedSongs = [
      ...savedSongs.filter(s => s.id !== song.id),
      {
        id: song.id,
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail,
        duration: song.duration,
        localPath: filePath,
        downloadedAt: Date.now(),
      },
    ];
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updatedSongs));

    console.log('Download complete:', song.title);
    return filePath;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Saare downloaded songs lao
export const getDownloadedSongs = async () => {
  try {
    const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Song delete karo
export const deleteSong = async songId => {
  try {
    const filePath = `${DOWNLOADS_DIR}/${songId}.mp3`;
    const exists = await RNFS.exists(filePath);
    if (exists) await RNFS.unlink(filePath);

    const savedSongs = await getDownloadedSongs();
    const updated = savedSongs.filter(s => s.id !== songId);
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Delete failed:', error);
  }
};

// Check karo — downloaded hai ya nahi
export const isDownloaded = async songId => {
  const filePath = `${DOWNLOADS_DIR}/${songId}.mp3`;
  return await RNFS.exists(filePath);
};
