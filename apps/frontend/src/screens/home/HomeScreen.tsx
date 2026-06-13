import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AppShell } from '@/components/layout/AppShell';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { useUserProfile } from '@/hooks/useUserProfile';

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
  const layout = useHomescreenStore(s => s.layout);
  const { profile } = useUserProfile();

  const timeLabel = getDayGreeting(t, i18n.language);
  const greeting = profile.name
    ? t('home.greeting', { name: profile.name })
    : t('home.greetingNoName');

  return (
    <AppShell showTabBar padTop={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-5">
          <Text className="text-[12.5px] text-muted font-medium mb-1">
            {timeLabel}
          </Text>
          <Text className="text-[30px] font-bold text-foreground tracking-[-0.5px]">
            {greeting}
          </Text>
        </View>

        {/* Widget Grid */}
        <View className="px-5">
          <WidgetGrid layout={layout} />
        </View>
      </ScrollView>
    </AppShell>
  );
}
