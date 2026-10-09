import { useCallback } from 'react';
import { Alert, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { resetAllData } from '@/data/local/resetAllData';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { useAuthStore } from '@/stores/authStore';
import { IndexRowChevron } from './IndexRowChevron';

const chevron = <IndexRowChevron />;

/** Import, receiving shares, and the one irreversible button in the app. */
export function DataSettings() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { discardWorkout } = useCurrentWorkout();
  const resetOnboarding = useAuthStore(s => s.resetOnboarding);

  const handleResetAll = useCallback(() => {
    Alert.alert(t('profile.alerts.resetTitle'), t('profile.alerts.resetBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.continue'),
        style: 'destructive',
        onPress: () => {
          Alert.alert(
            t('profile.alerts.resetConfirmTitle'),
            t('profile.alerts.resetConfirmBody'),
            [
              { text: t('common.cancel'), style: 'cancel' },
              {
                text: t('profile.alerts.resetEverything'),
                style: 'destructive',
                onPress: () => {
                  // Drop any in-progress workout first — it would
                  // reference rows the reset is about to delete.
                  discardWorkout();
                  resetAllData();
                  resetOnboarding();

                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Onboarding' }],
                    }),
                  );
                },
              },
            ],
          );
        },
      },
    ]);
  }, [t, discardWorkout, resetOnboarding, navigation]);

  return (
    <SettingsSection label={t('profile.sections.data')}>
      <ListRow
        icon={<ClayIcon name="arrowUp" size={18} color={colors.accent} />}
        label={t('profile.importCsv')}
        trailing={chevron}
        onPress={() => navigation.navigate('CsvImport')}
      />
      <ListRow
        icon={<ClayIcon name="archive" size={18} color={colors.accent} />}
        label={t('profile.importHistory')}
        trailing={chevron}
        divider
        onPress={() => navigation.navigate('ImportHistory')}
      />
      <ListRow
        icon={<ClayIcon name="search" size={18} color={colors.accent} />}
        label={t('share.receive.entry')}
        trailing={chevron}
        divider
        onPress={() => navigation.navigate('ScanShare')}
      />
      <ListRow
        icon={<ClayIcon name="warning" size={18} color={colors.danger} />}
        label={
          <Text className="text-[15px] font-medium text-danger">
            {t('profile.resetAllData')}
          </Text>
        }
        trailing={chevron}
        divider
        onPress={handleResetAll}
      />
    </SettingsSection>
  );
}
