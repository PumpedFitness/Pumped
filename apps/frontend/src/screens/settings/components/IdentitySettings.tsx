import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { DateWheelPicker } from '@pumped/ui/forms/DateWheelPicker';
import { BottomSheet, Button } from 'heroui-native';
import { AppBottomSheet } from '@pumped/ui/forms/AppBottomSheet';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { EditableRow } from '@pumped/ui/clay/EditableRow';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { OptionSelectorSheet } from '@pumped/ui/forms/OptionSelectorSheet';
import { colors } from '@pumped/ui/theme/tokens';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { Gender } from '@/data/local/schema/userProfile';
import { IndexRowChevron } from './IndexRowChevron';

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

const chevron = <IndexRowChevron />;

/** Who the user is: name, gender, birthdate, height. */
export function IdentitySettings() {
  const { t, i18n } = useTranslation();
  const { profile, set } = useUserProfile();

  const [genderSheet, setGenderSheet] = useState(false);
  const [birthdateSheet, setBirthdateSheet] = useState(false);
  const [birthdateDate, setBirthdateDate] = useState(
    profile.birthdate
      ? new Date(profile.birthdate + 'T00:00:00')
      : new Date(2000, 0, 1),
  );

  return (
    <>
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

      <OptionSelectorSheet
        visible={genderSheet}
        title={t('profile.gender')}
        value={profile.gender ?? ''}
        options={buildGenderOptions(t)}
        onClose={() => setGenderSheet(false)}
        onChange={v => set({ gender: v as Gender })}
      />

      <AppBottomSheet
        open={birthdateSheet}
        onClose={() => setBirthdateSheet(false)}
      >
        <BottomSheet.Overlay />
        <AppBottomSheet.Content backgroundClassName="bg-background">
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
        </AppBottomSheet.Content>
      </AppBottomSheet>
    </>
  );
}
