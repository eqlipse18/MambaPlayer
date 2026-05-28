import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const formatDuration = seconds => {
  if (!seconds) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function SongCard({ song, onPress, rightComponent }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: song.thumbnail || 'https://via.placeholder.com/50' }}
        style={styles.thumbnail}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
        {rightComponent}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  info: { flex: 1, marginLeft: 12 },
  title: { color: '#fff', fontSize: 15, fontWeight: '600' },
  artist: { color: '#888', fontSize: 13, marginTop: 2 },
  right: { alignItems: 'flex-end', marginLeft: 10 },
  duration: { color: '#666', fontSize: 12 },
});
