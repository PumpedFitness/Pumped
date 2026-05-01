import './global.css';

import {useEffect, useState} from 'react';
import {HeroUINativeProvider} from 'heroui-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StatusBar, ActivityIndicator, View} from 'react-native';
import {Uniwind} from 'uniwind';
import {AppNavigator} from './src/navigation/AppNavigator';
import {initDatabase} from './src/data/local/database';
import {useAuthStore} from './src/stores/authStore';
import {useExerciseStore} from './src/stores/exerciseStore';
import {useSyncStore} from './src/stores/syncStore';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const authReady = useAuthStore((s) => s.isReady);
  const initializeAuth = useAuthStore((s) => s.initialize);
  const loadExercises = useExerciseStore((s) => s.loadExercises);
  const initializeSync = useSyncStore((s) => s.initialize);

  useEffect(() => {
    Uniwind.setTheme('dark');
  }, []);

  useEffect(() => {
    try {
      initDatabase();
      setDbReady(true);
    } catch (e) {
      console.error('Failed to initialize database:', e);
    }
  }, []);

  useEffect(() => {
    if (dbReady) {
      initializeAuth();
      loadExercises();
      initializeSync();
    }
  }, [dbReady, initializeAuth, loadExercises, initializeSync]);

  if (!dbReady || !authReady) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F1113'}}>
        <ActivityIndicator size="large" color="#D4A574" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}} className="flex-1">
      <HeroUINativeProvider>
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
