import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import { SCREENS, TabsScaffold, type MainTabParamList } from './mainTabsShared';

// Android uses a JS bottom tab bar (the native bar loads icons through Fresco,
// which can't render the vector-XML drawables). Styled to mimic the iOS bar:
// a light bar with vector icons over labels, accent for the active tab.
const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const { t } = useTranslation();

  return (
    <TabsScaffold>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          // Subtle cross-fade between tabs, to match the iOS native bar (the JS
          // bar switches instantly by default).
          animation: 'fade',
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        {SCREENS.map(({ name, component, labelKey, icon }) => (
          <Tab.Screen
            key={name}
            name={name}
            component={component}
            options={{
              tabBarLabel: t(labelKey),
              tabBarIcon: ({ color, focused }) => (
                <ClayIcon
                  name={icon}
                  size={24}
                  stroke={focused ? 2.1 : 1.8}
                  color={color}
                />
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </TabsScaffold>
  );
}
