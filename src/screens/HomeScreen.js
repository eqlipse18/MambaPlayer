import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { searchSongs, getTrending } from '../api/pipedApi';
import { getSongStream } from '../api/pipedApi';
import { playSong } from '../services/playerService';
import { useMusic } from '../store/musicStore';
import SongCard from '../components/SongCard';

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { setCurrentSong, setIsPlayerVisible } = useMusic();

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setLoading(true);
    const data = await getTrending();
    setTrending(data);
    setLoading(false);
  };

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await searchSongs(query);
      setSongs(results);
      if (results.length === 0) {
        Alert.alert('Koi result nahi mila', 'Doosra keyword try karo!');
      }
    } catch (e) {
      Alert.alert(
        'Search Failed',
        'Internet check karo ya thodi der baad try karo.',
      );
      console.error(e);
    }
    setSearching(false);
  }, [query]);

  const handlePlay = async song => {
    try {
      setCurrentSong({ ...song, loading: true });
      setIsPlayerVisible(true);

      const streamData = await getSongStream(song.id);
      await playSong(streamData);

      setCurrentSong({ ...song, ...streamData, loading: false });
      navigation.navigate('Player', { song: { ...song, ...streamData } });
    } catch (e) {
      console.error('Play error:', e);
    }
  };

  const displaySongs = query.trim() ? songs : trending;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎵 Music</Text>
        <Text style={styles.headerSub}>Nepal ke liye free music</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Koi bhi song dhundo..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        {query.trim() ? 'Search Results' : '🔥 Trending in Nepal'}
      </Text>

      {/* Song List */}
      {loading || searching ? (
        <ActivityIndicator
          color="#1DB954"
          size="large"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={displaySongs}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <SongCard song={item} onPress={() => handlePlay(item)} />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 14, color: '#888', marginTop: 2 },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#282828',
    color: '#fff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchBtnText: { fontSize: 18 },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
});
