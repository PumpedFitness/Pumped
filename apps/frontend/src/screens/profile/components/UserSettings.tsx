import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { DateWheelPicker } from '@/components/forms/DateWheelPicker';
import { BottomSheet, Button } from 'heroui-native';
import { desc } from 'drizzle-orm';
import { SettingsSection } from '@/components/clay/SettingsSection';
import { EditableRow } from '@/components/clay/EditableRow';
import { ListRow } from '@/components/clay/ListRow';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { OptionSelectorSheet } from '@/components/forms/OptionSelectorSheet';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRepository } from '@/data/local/useRepository';
import type { Gender } from '@/data/local/schema/userProfile';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '@/data/local/schema/bodyMetrics';
import { formatWeight } from '@/utils/units';
import { colors } from '@/theme/tokens';

function buildGenderOptions(t: TFunction): { value: Gender; label: string }[] {
  return [
    { value: 'MALE', label: t('onboarding.gender.male') },
    { value: 'FEMALE', label: t('onboarding.gender.female') },
    { value: 'OTHER', label: t('onboarding.gender.other') },
  ];
}

function formatGender(t: TFunction, gender: Gender | null): string {
  const option = buildGenderOptions(t).find(item => item.value === gender);
  return option ? option.label : t('common.notSet');
}

function formatBirthdate(
  t: TFunction,
  language: string,
  iso: string | null,
): string {
  if (!iso) return t('common.notSet');
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString(language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const chevron = <ClayIcon name="chevron" size={16} color={colors.muted} />;

export function UserSettings() {
  const { t, i18n } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { profile, set } = useUserProfile();

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

  const [genderSheet, setGenderSheet] = useState(false);
  const [birthdateSheet, setBirthdateSheet] = useState(false);
  const [birthdateDate, setBirthdateDate] = useState(
    profile.birthdate
      ? new Date(profile.birthdate + 'T00:00:00')
      : new Date(2000, 0, 1),
  );

  return (
    <>
      {/* ── Profile ──────────────────────────── */}
      <SettingsSection label={t('profile.sections.profile')}>
        <EditableRow
          icon={<ClayIcon name="user" size={18} color={colors.accent} />}
          label={t('profile.name')}
          value={profile.name}
          placeholder={t('profile.namePlaceholder')}
          onSave={v => set({ name: v })}
        />
        <ListRow
          icon={<ClayIcon name="user" size={18} color={colors.accent} />}
          label={t('profile.gender')}
          detail={formatGender(t, profile.gender)}
          trailing={chevron}
          divider
          onPress={() => setGenderSheet(true)}
        />
        <ListRow
          icon={<ClayIcon name="calendar" size={18} color={colors.accent} />}
          label={t('profile.birthdate')}
          detail={formatBirthdate(t, i18n.language, profile.birthdate)}
          trailing={chevron}
          divider
          onPress={() => {
            setBirthdateDate(
              profile.birthdate
                ? new Date(profile.birthdate + 'T00:00:00')
                : new Date(2000, 0, 1),
            );
            setBirthdateSheet(true);
          }}
        />
        <EditableRow
          icon={<ClayIcon name="ruler" size={18} color={colors.accent} />}
          label={t('profile.height')}
          value={profile.heightCm ? String(profile.heightCm) : ''}
          placeholder={t('profile.heightPlaceholder')}
          keyboardType="decimal-pad"
          divider
          onSave={v => {
            const n = parseFloat(v);
            if (!isNaN(n) && n > 0) set({ heightCm: n });
          }}
        />
      </SettingsSection>

      {/* ── Body Tracking ────────────────────── */}
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

      {/* ── Sheets ───────────────────────────── */}
      <OptionSelectorSheet
        visible={genderSheet}
        title={t('profile.gender')}
        value={profile.gender ?? ''}
        options={buildGenderOptions(t)}
        onClose={() => setGenderSheet(false)}
        onChange={v => set({ gender: v as Gender })}
      />

      <BottomSheet
        isOpen={birthdateSheet}
        onOpenChange={open => {
          if (!open) setBirthdateSheet(false);
        }}
      >
        <BottomSheet.Portal>
          <BottomSheet.Overlay />
          <BottomSheet.Content backgroundClassName="bg-background">
            <BottomSheet.Title className="text-center text-[21px] font-bold text-foreground">
              {t('profile.birthdateSheetTitle')}
            </BottomSheet.Title>

            <DateWheelPicker
              value={birthdateDate}
              onChange={setBirthdateDate}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />

            <Button
              className="mt-4 h-13 rounded-full bg-accent"
              feedbackVariant="scale"
              onPress={() => {
                const y = birthdateDate.getFullYear();
                const m = String(birthdateDate.getMonth() + 1).padStart(2, '0');
                const d = String(birthdateDate.getDate()).padStart(2, '0');
                set({ birthdate: `${y}-${m}-${d}` });
                setBirthdateSheet(false);
              }}
            >
              <Button.Label className="font-bold text-accent-foreground">
                {t('common.save')}
              </Button.Label>
            </Button>
          </BottomSheet.Content>
        </BottomSheet.Portal>
      </BottomSheet>
    </>
  );
}
