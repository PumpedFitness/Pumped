import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useUserProfile } from '@/hooks/useUserProfile';
import { IndexRowChevron } from './components/IndexRowChevron';
import { SettingsScaffold } from './components/SettingsScaffold';
import { SETTINGS_GROUPS } from './settingsGroups';

const chevron = <IndexRowChevron />;

/**
 * Settings, one level up: four destinations instead of one long scroll.
 *
 * The screen used to stack every section end to end, which made "where is the
 * rest timer" a scrolling problem. Grouping puts each answer one tap away and
 * gives the recovery settings — which have grown a scale and four thresholds —
 * somewhere to live that is not the bottom of the profile.
 */
export function ProfileScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useUserProfile();

  return (
    <SettingsScaffold
      testID="screen-profile"
      title={t('profile.title')}
      subtitle={profile.name || undefined}
    >
      <SettingsSection label={t('profile.sections.all')}>
        {SETTINGS_GROUPS.map((group, index) => (
          <ListRow
            key={group.id}
            icon={
              <ClayIcon name={group.icon} size={18} color={colors.accent} />
            }
            label={t(group.titleKey)}
            subtitle={t(group.subtitleKey)}
            trailing={chevron}
            divider={index < SETTINGS_GROUPS.length - 1}
            testID={`settings-group-${group.id}`}
            onPress={() =>
              navigation.navigate('SettingsGroup', { group: group.id })
            }
          />
        ))}
      </SettingsSection>
    </SettingsScaffold>
  );
}
