import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { AppShell } from '@/components/layout/AppShell';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import { HomeMessage } from './components/HomeMessage';

export function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const layout = useHomescreenStore(s => s.layout);
  const setLayout = useHomescreenStore(s => s.setLayout);
  const removeWidget = useHomescreenStore(s => s.removeWidget);
  const { profile } = useUserProfile();

  const startEditing = useCallback(() => setEditing(true), []);

  return (
    <AppShell showTabBar padTop={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        <View className="px-5 pt-6 pb-5">
          <View className="flex-row items-center gap-4">
            <HomeMessage name={profile.name} />
            <View className="flex-row items-center gap-2">
              <Pressable
                accessibilityLabel={t('home.addWidget')}
                accessibilityRole="button"
                onPress={() => navigation.navigate('WidgetPicker')}
                className="h-12 w-12 items-center justify-center rounded-full border border-border-soft bg-surface-card active:opacity-70"
              >
                <ClayIcon name="plus" size={20} color={colors.ink} />
              </Pressable>
              {editing && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setEditing(false)}
                  className="h-10 justify-center rounded-full bg-foreground px-4 active:opacity-80"
                >
                  <Text className="text-[13.5px] font-bold text-cream">
                    {t('home.doneEditing')}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <View className="px-5">
          <WidgetGrid
            layout={layout}
            editing={editing}
            onEditStart={startEditing}
            onLayoutChange={setLayout}
            onRemove={removeWidget}
          />
        </View>

        <TabBarInsetSpacer />
      </ScrollView>
    </AppShell>
  );
}
