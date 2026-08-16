import { useTranslation } from 'react-i18next';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { SettingsScaffold } from './components/SettingsScaffold';
import { settingsGroup } from './settingsGroups';

type SettingsGroupRoute = RouteProp<RootStackParamList, 'SettingsGroup'>;

/** One settings group, rendered from the registry. */
export function SettingsGroupScreen() {
  const { t } = useTranslation();
  const route = useRoute<SettingsGroupRoute>();
  const group = settingsGroup(route.params.group);

  return (
    <SettingsScaffold
      testID={`screen-settings-${group.id}`}
      title={t(group.titleKey)}
      subtitle={t(group.subtitleKey)}
    >
      {group.sections.map((Section, index) => (
        <Section key={index} />
      ))}
    </SettingsScaffold>
  );
}
