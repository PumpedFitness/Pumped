import './global.css';

import { useEffect, useState } from 'react';
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar, ActivityIndicator, Text, View } from 'react-native';
import { Uniwind } from 'uniwind';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/data/local/database';
import { useAuthStore } from './src/stores/authStore';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const authReady = useAuthStore(s => s.isReady);
  const userId = useAuthStore(s => s.userId);
  const initializeAuth = useAuthStore(s => s.initialize);

  useEffect(() => {
    Uniwind.setTheme('light');
  }, []);

  // Auth initializes from MMKV (no DB needed), so it can run first
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Once auth is ready and we have a userId, initialize the DB (seed needs userId)
  useEffect(() => {
    if (authReady && userId) {
      initDatabase(userId)
        .then(() => setDbReady(true))
        .catch(error => {
          console.error('Failed to initialize database:', error);
          setDbError(
            error instanceof Error
              ? error.message
              : 'An unknown database error occurred.',
          );
        });
    }
  }, [authReady, userId]);

  if (dbError) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EAE3D5] px-8">
        <Text className="text-center text-lg font-bold text-[#34362C]">
          Failed to initialize the local database
        </Text>
        <Text className="mt-3 text-center text-[#34362C]">{dbError}</Text>
      </View>
    );
  }

  if (!dbReady || !authReady) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EAE3D5]">
        <ActivityIndicator size="large" color="#C67B52" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} className="flex-1">
      <HeroUINativeProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
