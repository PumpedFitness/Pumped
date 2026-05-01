import './global.css';

import {useEffect} from 'react';
import {HeroUINativeProvider} from 'heroui-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import {Uniwind} from 'uniwind';
import {AppNavigator} from './src/navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    Uniwind.setTheme('dark');
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}} className='flex-1'>
              <HeroUINativeProvider>
                  <StatusBar barStyle="light-content" />
                  <AppNavigator />
              </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
