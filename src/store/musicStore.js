import { useState, createContext, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [queue, setQueue] = useState([]);

  // Favorites load karo app start pe
  const loadFavorites = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem('favorites');
      if (data) setFavorites(JSON.parse(data));
    } catch {}
  }, []);

  const toggleFavorite = async song => {
    const isFav = favorites.some(f => f.id === song.id);
    let updated;
    if (isFav) {
      updated = favorites.filter(f => f.id !== song.id);
    } else {
      updated = [...favorites, song];
    }
    setFavorites(updated);
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };

  const isFavorite = songId => favorites.some(f => f.id === songId);

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        setCurrentSong,
        isPlayerVisible,
        setIsPlayerVisible,
        favorites,
        toggleFavorite,
        isFavorite,
        loadFavorites,
        queue,
        setQueue,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
