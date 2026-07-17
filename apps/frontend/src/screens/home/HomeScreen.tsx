import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { TFunction } from 'i18next';
import { AppShell } from '@/components/layout/AppShell';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

function getDayGreeting(t: TFunction, language: string): string {
  const now = new Date();
  const hour = now.getHours();
  let timeOfDay: string;
  if (hour < 12) timeOfDay = t('home.timeOfDay.morning');
  else if (hour < 17) timeOfDay = t('home.timeOfDay.afternoon');
  else timeOfDay = t('home.timeOfDay.evening');

  const day = now.toLocaleDateString(language, { weekday: 'long' });

  return t('home.dayGreeting', { day, timeOfDay });
}

export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const layout = useHomescreenStore(s => s.layout);
  const moveWidget = useHomescreenStore(s => s.moveWidget);
  const removeWidget = useHomescreenStore(s => s.removeWidget);
  const { profile } = useUserProfile();

  const timeLabel = getDayGreeting(t, i18n.language);
  const greeting = profile.name
    ? t('home.greeting', { name: profile.name })
    : t('home.greetingNoName');
  const startEditing = useCallback(() => setEditing(true), []);

  return (
    <AppShell showTabBar padTop={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        <View className="flex-row items-end justify-between px-5 pt-4 pb-5">
          <View className="flex-1">
            <Text className="mb-1 text-[12.5px] font-medium text-muted">
              {timeLabel}
            </Text>
            <Text className="text-[30px] font-bold tracking-[-0.5px] text-foreground">
              {greeting}
            </Text>
          </View>
          <View className="mb-1 flex-row items-center gap-2">
            <Pressable
              accessibilityLabel={t('home.addWidget')}
              accessibilityRole="button"
              onPress={() => navigation.navigate('WidgetPicker')}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-card active:opacity-70"
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

        <View className="px-5">
          <WidgetGrid
            layout={layout}
            editing={editing}
            onEditStart={startEditing}
            onMove={moveWidget}
            onRemove={removeWidget}
          />
        </View>

        <TabBarInsetSpacer />
      </ScrollView>
    </AppShell>
  );
}
