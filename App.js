import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MusicProvider, useMusic } from './src/store/musicStore';
import AppNavigator from './src/navigation/AppNavigator';
import { setupPlayer } from './src/services/playerService';

function AppContent() {
  const { loadFavorites } = useMusic();

  useEffect(() => {
    loadFavorites(); // setupPlayer() hata diya
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <MusicProvider>
      <AppContent />
    </MusicProvider>
  );
}
