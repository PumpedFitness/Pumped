import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WorkoutTemplateColor } from '@/data/local/enums';
import { colors } from '@/theme/tokens';
import { ColorSwatchPicker, type ColorSwatchOption } from './ColorSwatchPicker';
import { FormSection } from './FormSection';
import {
  getWorkoutTemplateColor,
  WORKOUT_TEMPLATE_COLORS,
} from '@/components/workout/workoutTemplatePresentation';

type WorkoutTemplateAppearanceSectionProps = {
  color: WorkoutTemplateColor;
  onColorChange: (color: WorkoutTemplateColor) => void;
};

export function WorkoutTemplateAppearanceSection({
  color,
  onColorChange,
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

  return (
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
  );
}
