import { ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/AppShell';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { IndexScreenHeader } from './components/IndexScreenHeader';
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
        <View className="mb-6">
          <IndexScreenHeader title={t('profile.title')} />
        </View>

        <UserSettings />
        <AppSettings />

        <TabBarInsetSpacer />
      </ScrollView>
    </AppShell>
  );
}
