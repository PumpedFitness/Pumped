import { Pressable, Text, View } from 'react-native';
import type { WorkoutWeekday } from '../../../data/local/enums';
import { colors } from '../../../theme/tokens';
import { FormSection } from '../../forms/FormSection';
import { OptionPill } from '../../forms/OptionPill';
import { ClayIcon } from '../../icons/ClayIcon';
import type { ScheduleMode } from '../hooks/useWorkoutTemplateEditorDraft';

type WorkoutTemplateScheduleSectionProps = {
  mode: ScheduleMode;
  interval: number;
  weekdays: WorkoutWeekday[];
  onModeChange: (mode: ScheduleMode) => void;
  onIntervalChange: (interval: number) => void;
  onToggleWeekday: (weekday: WorkoutWeekday) => void;
};

const WEEKDAYS: { value: WorkoutWeekday; label: string }[] = [
  { value: 'MONDAY', label: 'M' },
  { value: 'TUESDAY', label: 'T' },
  { value: 'WEDNESDAY', label: 'W' },
  { value: 'THURSDAY', label: 'T' },
  { value: 'FRIDAY', label: 'F' },
  { value: 'SATURDAY', label: 'S' },
  { value: 'SUNDAY', label: 'S' },
];

export function WorkoutTemplateScheduleSection({
  mode,
  interval,
  weekdays,
  onModeChange,
  onIntervalChange,
  onToggleWeekday,
}: WorkoutTemplateScheduleSectionProps) {
  const intervalUnit =
    mode === 'DAYS'
      ? interval === 1
        ? 'day'
        : 'days'
      : interval === 1
      ? 'week'
      : 'weeks';

  return (
    <FormSection title="Schedule">
      <View className="flex-row flex-wrap gap-2">
        <OptionPill
          label="Flexible"
          selected={mode === 'NONE'}
          onPress={() => onModeChange('NONE')}
        />
        <OptionPill
          label="Every few days"
          selected={mode === 'DAYS'}
          onPress={() => onModeChange('DAYS')}
        />
        <OptionPill
          label="Weekly"
          selected={mode === 'WEEKS'}
          onPress={() => onModeChange('WEEKS')}
        />
      </View>

      {mode !== 'NONE' && (
        <View className="gap-4 rounded-[22px] bg-moss p-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="t-label text-cream">Repeat interval</Text>
              <Text className="t-caption mt-0.5 text-cream-dim">
                Every {interval} {intervalUnit}
              </Text>
            </View>
            <View className="flex-row items-center rounded-full bg-moss-deep p-1">
              <Pressable
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full"
                onPress={() => onIntervalChange(Math.max(1, interval - 1))}
              >
                <ClayIcon name="minus" size={17} color={colors.cream} />
              </Pressable>
              <Text className="min-w-9 text-center text-[17px] font-bold tabular-nums text-cream">
                {interval}
              </Text>
              <Pressable
                accessibilityRole="button"
                className="h-10 w-10 items-center justify-center rounded-full"
                onPress={() => onIntervalChange(interval + 1)}
              >
                <ClayIcon name="plus" size={17} color={colors.cream} />
              </Pressable>
            </View>
          </View>

          {mode === 'WEEKS' && (
            <View className="flex-row justify-between">
              {WEEKDAYS.map(day => {
                const selected = weekdays.includes(day.value);
                return (
                  <Pressable
                    key={day.value}
                    accessibilityRole="button"
                    accessibilityLabel={day.value.toLowerCase()}
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      selected ? 'bg-accent' : 'bg-moss-deep'
                    }`}
                    onPress={() => onToggleWeekday(day.value)}
                  >
                    <Text
                      className={`text-[13px] font-bold ${
                        selected ? 'text-accent-ink' : 'text-cream'
                      }`}
                    >
                      {day.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      )}
    </FormSection>
  );
}
