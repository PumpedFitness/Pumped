import { createNativeBottomTabNavigator } from '@react-navigation/bottom-tabs/unstable';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { SCREENS, TabsScaffold, type MainTabParamList } from './mainTabsShared';

// iOS uses the OS-native bottom tab bar (translucent "glass" bar on iOS 26).
const Tab = createNativeBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { t } = useTranslation();

  return (
    <TabsScaffold>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
        }}
      >
        {SCREENS.map(({ name, component, labelKey, sf, sfFocused }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            options={{
              tabBarLabel: t(labelKey),
              // Keep the glass bar (with labels) fixed on scroll; the native bar
              // only offers an all-or-nothing collapse-to-pill, which we don't
              // want, so disable it.
              tabBarMinimizeBehavior: 'none',
              tabBarIcon: ({ focused }) => ({
                type: 'sfSymbol',
                name: focused ? sfFocused : sf,
              }),
            }}
          />
        ))}
      </Tab.Navigator>
    </TabsScaffold>
  );
}
