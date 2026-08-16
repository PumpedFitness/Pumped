import { useCallback, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from 'heroui-native';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { Button } from '@pumped/ui/clay/Button';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { resetAllData } from '@/data/local/resetAllData';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { useHandover } from '@/hooks/useHandover';
import { useAuthStore } from '@/stores/authStore';
import { IndexRowChevron } from './IndexRowChevron';

const chevron = <IndexRowChevron />;

/** Import, hand-over, and the one irreversible button in the app. */
export function DataSettings() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [uuid, setUuid] = useState('');
  const { receive } = useHandover();
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

  const handleImportDataHandover = async () => {
    const result = await receive<unknown>(uuid);

    if (result.status === 'success') {
      Alert.alert(
        t('profile.alerts.importSuccessTitle'),
        t('profile.alerts.importSuccessBody'),
        [{ text: t('common.ok') }],
      );
    } else {
      Alert.alert(
        t('profile.alerts.importErrorTitle'),
        t('profile.alerts.importErrorBody', { code: result.code }),
        [{ text: t('common.ok') }],
      );
    }
  };

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

      <View className="flex flex-row gap-2 items-center">
        <Button
          onPress={() => void handleImportDataHandover()}
          size="sm"
          variant="ghost"
        >
          {t('common.load')}
        </Button>
        <Input
          value={uuid}
          onChangeText={setUuid}
          className="w-full"
          placeholder={t('profile.uuidPlaceholder')}
        ></Input>
      </View>
    </SettingsSection>
  );
}
