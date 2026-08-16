import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { SegmentedControl } from '@pumped/ui/clay/SegmentedControl';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { OptionSelectorSheet } from '@pumped/ui/forms/OptionSelectorSheet';
import { colors } from '@pumped/ui/theme/tokens';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import {
  type HomeMessageTone,
  useAppSettingsStore,
} from '@/stores/appSettingsStore';
import { IndexRowChevron } from './IndexRowChevron';
import { LanguageSwitcher } from './LanguageSwitcher';

const chevron = <IndexRowChevron />;

function HomeMessageToneSetting() {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const tone = useAppSettingsStore(state => state.homeMessageTone);
  const setTone = useAppSettingsStore(state => state.setHomeMessageTone);
  const options: { value: HomeMessageTone; label: string }[] = [
    { value: 'supportive', label: t('home.messageTones.supportive') },
    { value: 'tough', label: t('home.messageTones.tough') },
    { value: 'savage', label: t('home.messageTones.savage') },
  ];

  return (
    <>
      <ListRow
        icon={<ClayIcon name="bolt" size={18} color={colors.accent} />}
        label={t('settings.homeMessageTone')}
        detail={options.find(option => option.value === tone)?.label}
        trailing={chevron}
        divider
        onPress={() => setSheetOpen(true)}
      />
      <OptionSelectorSheet
        visible={sheetOpen}
        title={t('settings.homeMessageTone')}
        value={tone}
        options={options}
        onClose={() => setSheetOpen(false)}
        onChange={setTone}
      />
    </>
  );
}

/** How the app presents itself: units, language, tone of voice. */
export function PreferenceSettings() {
  const { t } = useTranslation();
  const weightUnit = useAppSettingsStore(state => state.weightUnit);
  const setWeightUnit = useAppSettingsStore(state => state.setWeightUnit);

  return (
    <SettingsSection label={t('profile.sections.preferences')}>
      <ListRow
        icon={<ClayIcon name="settings" size={18} color={colors.accent} />}
        label={t('profile.units')}
        paddingVertical={10}
        trailing={
          <View className="w-40">
            <SegmentedControl
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'lbs', label: 'lbs' },
              ]}
              value={weightUnit}
              onChange={value => setWeightUnit(value as WeightUnit)}
            />
          </View>
        }
      />
      <ListRow
        icon={<ClayIcon name="swap" size={18} color={colors.accent} />}
        label={t('settings.language')}
        paddingVertical={10}
        divider
        trailing={
          <View className="w-40 items-end">
            <LanguageSwitcher compact />
          </View>
        }
      />
      <HomeMessageToneSetting />
    </SettingsSection>
  );
}
