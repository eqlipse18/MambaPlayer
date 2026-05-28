import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useMusic } from '../store/musicStore';
import { getSongStream } from '../api/pipedApi';
import { playSong } from '../services/playerService';
import SongCard from '../components/SongCard';

export default function FavoritesScreen({ navigation }) {
  const { favorites, setCurrentSong, setIsPlayerVisible } = useMusic();

  const handlePlay = async song => {
    setCurrentSong({ ...song, loading: true });
    setIsPlayerVisible(true);
    const streamData = await getSongStream(song.id);
    await playSong(streamData);
    setCurrentSong({ ...song, ...streamData, loading: false });
    navigation.navigate('Player', { song: { ...song, ...streamData } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>❤️ Favorites ({favorites.length})</Text>
      {favorites.length === 0 ? (
        <Text style={styles.empty}>Koi favorite song nahi hai abhi!</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SongCard song={item} onPress={() => handlePlay(item)} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 60 },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  empty: { color: '#888', textAlign: 'center', marginTop: 60, fontSize: 16 },
});
