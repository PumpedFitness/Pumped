import { Text, View } from 'react-native';
import type {
  WorkoutTemplateColor,
  WorkoutTemplateStatus,
} from '../../../data/local/enums';
import { colors } from '../../../theme/tokens';
import {
  ColorSwatchPicker,
  type ColorSwatchOption,
} from '../../forms/ColorSwatchPicker';
import { FormSection } from '../../forms/FormSection';
import { OptionPill } from '../../forms/OptionPill';
import {
  getWorkoutTemplateColor,
  WORKOUT_TEMPLATE_COLORS,
} from '../services/workoutTemplatePresentationService';

type WorkoutTemplateAppearanceSectionProps = {
  color: WorkoutTemplateColor;
  status: WorkoutTemplateStatus;
  onColorChange: (color: WorkoutTemplateColor) => void;
  onStatusChange: (status: WorkoutTemplateStatus) => void;
};

const COLOR_OPTIONS: ColorSwatchOption<WorkoutTemplateColor>[] =
  WORKOUT_TEMPLATE_COLORS.map(option => ({
    value: option.value,
    label: option.label,
    color: option.hex,
    checkColor: option.value === 'HONEY' ? colors.accentInk : colors.cream,
  }));

export function WorkoutTemplateAppearanceSection({
  color,
  status,
  onColorChange,
  onStatusChange,
}: WorkoutTemplateAppearanceSectionProps) {
  const selectedColor = getWorkoutTemplateColor(color);
  const statusDescription =
    status === 'ACTIVE'
      ? 'Active schedules appear as planned workouts.'
      : status === 'INACTIVE'
      ? 'Inactive templates stay available without adding plans.'
      : 'Archived templates are kept out of your active library.';

  return (
    <>
      <FormSection title="Template color">
        <ColorSwatchPicker
          value={color}
          options={COLOR_OPTIONS}
          onChange={onColorChange}
        />
        <View className="flex-row items-center gap-2">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: selectedColor.hex }}
          />
          <Text className="t-caption">
            {selectedColor.label} marks this template in the calendar.
          </Text>
        </View>
      </FormSection>

      <FormSection title="Template status">
        <View className="flex-row flex-wrap gap-2">
          <OptionPill
            label="Active"
            selected={status === 'ACTIVE'}
            onPress={() => onStatusChange('ACTIVE')}
          />
          <OptionPill
            label="Inactive"
            selected={status === 'INACTIVE'}
            onPress={() => onStatusChange('INACTIVE')}
          />
          <OptionPill
            label="Archived"
            selected={status === 'ARCHIVED'}
            onPress={() => onStatusChange('ARCHIVED')}
          />
        </View>
        <Text className="t-caption">{statusDescription}</Text>
      </FormSection>
    </>
  );
}
