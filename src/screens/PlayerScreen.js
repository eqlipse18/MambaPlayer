import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import { useMusic } from '../store/musicStore';

const { width } = Dimensions.get('window');

const formatTime = secs => {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function PlayerScreen({ route, navigation }) {
  const { song } = route.params || {};
  const { currentSong, toggleFavorite, isFavorite } = useMusic();
  const videoRef = useRef(null);

  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const displaySong = currentSong || song;

  const onProgress = data => {
    if (!seeking) setPosition(data.currentTime);
  };

  const onLoad = data => {
    setDuration(data.duration);
  };

  const handleSeek = value => {
    setSeeking(false);
    videoRef.current?.seek(value);
    setPosition(value);
  };

  return (
    <View style={styles.container}>
      {/* Hidden Audio Player */}
      {displaySong?.streamUrl && (
        <Video
          ref={videoRef}
          source={{
            uri: displaySong?.streamUrl,
            headers: displaySong?.headers || {}, // ← yeh add karo
          }}
          audioOnly={true}
          paused={paused}
          onProgress={onProgress}
          onLoad={onLoad}
          playInBackground={true}
          playWhenInactive={true}
          style={{ width: 0, height: 0 }}
        />
      )}

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Text style={styles.backText}>↓</Text>
      </TouchableOpacity>

      {/* Album Art */}
      <Image
        source={{
          uri: displaySong?.thumbnail || 'https://via.placeholder.com/300',
        }}
        style={styles.artwork}
      />

      {/* Song Info */}
      <View style={styles.infoRow}>
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {displaySong?.title || 'No song'}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {displaySong?.artist || ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => displaySong && toggleFavorite(displaySong)}
        >
          <Text style={styles.heartIcon}>
            {displaySong && isFavorite(displaySong.id) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          value={position}
          minimumValue={0}
          maximumValue={duration || 1}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#555"
          thumbTintColor="#1DB954"
          onSlidingStart={() => setSeeking(true)}
          onSlidingComplete={handleSeek}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity>
          <Text style={styles.controlIcon}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPaused(!paused)}
          style={styles.playBtn}
        >
          <Text style={styles.playIcon}>{paused ? '▶️' : '⏸'}</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.controlIcon}>⏭</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingTop: 60,
  },
  backBtn: { alignSelf: 'flex-start', paddingLeft: 20, marginBottom: 20 },
  backText: { color: '#fff', fontSize: 28 },
  artwork: {
    width: width - 60,
    height: width - 60,
    borderRadius: 16,
    backgroundColor: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width - 60,
    marginTop: 30,
  },
  songInfo: { flex: 1 },
  songTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  artistName: { color: '#888', fontSize: 15, marginTop: 4 },
  heartIcon: { fontSize: 26 },
  sliderContainer: { width: width - 60, marginTop: 20 },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { color: '#888', fontSize: 12 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width - 100,
    marginTop: 30,
  },
  controlIcon: { fontSize: 32 },
  playBtn: {
    backgroundColor: '#1DB954',
    borderRadius: 40,
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: { fontSize: 32 },
});
