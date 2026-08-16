import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { desc } from 'drizzle-orm';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useRepository } from '@/data/local/useRepository';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '@/data/local/schema/bodyMetrics';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatWeight } from '@/utils/units';
import { IndexRowChevron } from './IndexRowChevron';

const chevron = <IndexRowChevron />;

/** The measured body: latest weigh-in and body-fat reading, each a history. */
export function BodyTrackingSettings() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useUserProfile();

  const weightRepo = useRepository(bodyWeightEntries);
  const fatRepo = useRepository(bodyFatEntries);

  const latestWeight = weightRepo.query({
    orderBy: desc(bodyWeightEntries.recordedAt),
    limit: 1,
  });
  const latestFat = fatRepo.query({
    orderBy: desc(bodyFatEntries.recordedAt),
    limit: 1,
  });

  return (
    <SettingsSection label={t('profile.sections.bodyTracking')}>
      <ListRow
        icon={<ClayIcon name="scale" size={18} color={colors.accent} />}
        label={t('profile.weight')}
        detail={
          latestWeight.length > 0
            ? formatWeight(latestWeight[0].value, profile.weightUnit)
            : t('common.noEntries')
        }
        trailing={chevron}
        onPress={() =>
          navigation.navigate('MetricHistory', { metric: 'weight' })
        }
      />
      <ListRow
        icon={<ClayIcon name="percent" size={18} color={colors.accent} />}
        label={t('profile.bodyFat')}
        detail={
          latestFat.length > 0
            ? `${latestFat[0].value.toFixed(1)}%`
            : t('common.noEntries')
        }
        trailing={chevron}
        divider
        onPress={() =>
          navigation.navigate('MetricHistory', { metric: 'bodyFat' })
        }
      />
    </SettingsSection>
  );
}
