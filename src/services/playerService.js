import { Platform } from 'react-native';

let _currentSong = null;
let _playerRef = null;
let _onProgressCallback = null;
let _onStateChangeCallback = null;

// Player ref register karo (PlayerScreen se aayega)
export const registerPlayerRef = ref => {
  _playerRef = ref;
};

export const setCurrentSongData = song => {
  _currentSong = song;
};

export const getCurrentSong = () => _currentSong;

export const onProgressUpdate = callback => {
  _onProgressCallback = callback;
};

export const onStateChange = callback => {
  _onStateChangeCallback = callback;
};

export const notifyProgress = data => {
  _onProgressCallback && _onProgressCallback(data);
};

export const notifyStateChange = state => {
  _onStateChangeCallback && _onStateChangeCallback(state);
};
