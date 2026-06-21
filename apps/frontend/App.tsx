import './global.css';
// Initialize i18next before the first render (side-effect import).
import '@/i18n';

import { useEffect, useState } from 'react';
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { StatusBar, ActivityIndicator, Text, View } from 'react-native';
import { Uniwind } from 'uniwind';
import { AppNavigator } from '@/navigation/AppNavigator';
import { UndoToastProvider } from '@/components/feedback/UndoToast';
import { initDatabase } from '@/data/local/database';
import { useAuthStore } from '@/stores/authStore';
import { useHomescreenStore } from '@/stores/homescreenStore';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const authReady = useAuthStore(s => s.isReady);
  const userId = useAuthStore(s => s.userId);
  const initializeAuth = useAuthStore(s => s.initialize);
  const initializeHomescreen = useHomescreenStore(s => s.initialize);

  useEffect(() => {
    Uniwind.setTheme('light');
  }, []);

  // Auth initializes from MMKV (no DB needed), so it can run first
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Homescreen layout initializes from MMKV once per launch (not per
  // HomeScreen mount, which would reset user widget customization).
  useEffect(() => {
    initializeHomescreen();
  }, [initializeHomescreen]);

  // Initialize the database once the local user identity is available.
  useEffect(() => {
    if (authReady && userId) {
      initDatabase()
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
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <HeroUINativeProvider>
          <UndoToastProvider>
            <StatusBar barStyle="dark-content" />
            <AppNavigator />
          </UndoToastProvider>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
