import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type {
  WorkoutTemplateColor,
  WorkoutTemplateStatus,
} from '@/data/local/enums';
import { colors } from '@/theme/tokens';
import { ColorSwatchPicker, type ColorSwatchOption } from './ColorSwatchPicker';
import { FormSection } from './FormSection';
import { OptionPill } from '@/components/forms/OptionPill';
import {
  getWorkoutTemplateColor,
  WORKOUT_TEMPLATE_COLORS,
} from '@/components/workout/workoutTemplatePresentation';

type WorkoutTemplateAppearanceSectionProps = {
  color: WorkoutTemplateColor;
  status: WorkoutTemplateStatus;
  onColorChange: (color: WorkoutTemplateColor) => void;
  onStatusChange: (status: WorkoutTemplateStatus) => void;
};

export function WorkoutTemplateAppearanceSection({
  color,
  status,
  onColorChange,
  onStatusChange,
}: WorkoutTemplateAppearanceSectionProps) {
  const { t } = useTranslation();

  const colorOptions = useMemo<ColorSwatchOption<WorkoutTemplateColor>[]>(
    () =>
      WORKOUT_TEMPLATE_COLORS.map(option => ({
        value: option.value,
        label: t(option.labelKey),
        color: option.hex,
        checkColor: option.value === 'HONEY' ? colors.accentInk : colors.cream,
      })),
    [t],
  );

  const selectedColor = getWorkoutTemplateColor(color);
  const statusDescription =
    status === 'ACTIVE'
      ? t('templateEditor.appearance.statusDesc.active')
      : status === 'INACTIVE'
      ? t('templateEditor.appearance.statusDesc.inactive')
      : t('templateEditor.appearance.statusDesc.archived');

  return (
    <>
      <FormSection title={t('templateEditor.appearance.colorTitle')}>
        <ColorSwatchPicker
          value={color}
          options={colorOptions}
          onChange={onColorChange}
        />
        <View className="flex-row items-center gap-2">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <Text className="t-caption">
            {t('templateEditor.appearance.colorHint', {
              color: t(selectedColor.labelKey),
            })}
          </Text>
        </View>
      </FormSection>

      <FormSection title={t('templateEditor.appearance.statusTitle')}>
        <View className="flex-row flex-wrap gap-2">
          <OptionPill
            label={t('plan.status.active')}
            selected={status === 'ACTIVE'}
            onPress={() => onStatusChange('ACTIVE')}
          />
          <OptionPill
            label={t('plan.status.inactive')}
            selected={status === 'INACTIVE'}
            onPress={() => onStatusChange('INACTIVE')}
          />
          <OptionPill
            label={t('plan.status.archived')}
            selected={status === 'ARCHIVED'}
            onPress={() => onStatusChange('ARCHIVED')}
          />
        </View>
        <Text className="t-caption">{statusDescription}</Text>
      </FormSection>
    </>
  );
}
