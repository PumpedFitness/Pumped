import { Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/AppShell';
import { UserSettings } from './components/UserSettings';
import { AppSettings } from './components/AppSettings';

export function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <AppShell showTabBar>
      <ScrollView
        contentContainerClassName="px-5 pb-8 pt-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-[30px] font-bold text-foreground tracking-[-0.6px] mb-6">
          {t('profile.title')}
        </Text>

        <UserSettings />
        <AppSettings />
      </ScrollView>
    </AppShell>
  );
}
