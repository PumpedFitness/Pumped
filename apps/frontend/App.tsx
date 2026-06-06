import './global.css';
import './src/i18n';

import {useEffect, useState} from 'react';
import {HeroUINativeProvider} from 'heroui-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StatusBar, ActivityIndicator, View} from 'react-native';
import {Uniwind} from 'uniwind';
import {AppNavigator} from './src/navigation/AppNavigator';
import {initDatabase} from './src/data/local/database';
import {useAuthStore} from './src/stores/authStore';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const authReady = useAuthStore((s) => s.isReady);
  const initializeAuth = useAuthStore((s) => s.initialize);

  useEffect(() => {
    Uniwind.setTheme('dark');
  }, []);

  useEffect(() => {
    initDatabase()
      .then(() => setDbReady(true))
      .catch(e => console.error('Failed to initialize database:', e));
  }, []);

  useEffect(() => {
    if (dbReady) {
      initializeAuth();
    }
  }, [dbReady, initializeAuth]);

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
