import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { getDownloadedSongs, deleteSong } from '../services/downloadService';
import { playSong } from '../services/playerService';
import { useMusic } from '../store/musicStore';
import SongCard from '../components/SongCard';

export default function DownloadsScreen({ navigation }) {
  const [songs, setSongs] = useState([]);
  const { setCurrentSong, setIsPlayerVisible } = useMusic();

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    const data = await getDownloadedSongs();
    setSongs(data);
  };

  const handlePlay = async song => {
    setCurrentSong(song);
    setIsPlayerVisible(true);
    await playSong({ ...song, streamUrl: `file://${song.localPath}` });
    navigation.navigate('Player', { song });
  };

  const handleDelete = song => {
    Alert.alert('Delete', `"${song.title}" delete karna chahte ho?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSong(song.id);
          loadSongs();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📥 Downloads ({songs.length})</Text>
      {songs.length === 0 ? (
        <Text style={styles.empty}>Abhi koi downloaded song nahi hai</Text>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SongCard
              song={item}
              onPress={() => handlePlay(item)}
              rightComponent={
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Text style={{ color: '#ff4444', fontSize: 18 }}>🗑</Text>
                </TouchableOpacity>
              }
            />
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
