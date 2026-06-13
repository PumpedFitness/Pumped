import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';

type StreakWidgetProps = {
  colSpan: number;
  width: number;
};

// Dummy: last 7 days (Monday-first) — true = worked out
const WEEK_ACTIVITY = [true, true, true, false, true, true, false];

// Jan 1 2024 is a Monday — used only to derive localized weekday labels
function weekdayLabel(language: string, mondayOffset: number): string {
  return new Date(2024, 0, 1 + mondayOffset)
    .toLocaleDateString(language, { weekday: 'short' })
    .slice(0, 2);
}

export function StreakWidget({ colSpan }: StreakWidgetProps) {
  const { t, i18n } = useTranslation();

  return (
    <Card variant="card" radius="lg" pad={15}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-[6px]">
          <ClayIcon name="flame" size={16} color={colors.sage} />
          <Text className="text-[12.5px] font-semibold text-muted">
            {colSpan >= 2
              ? t('widgets.streak.titleWide', { count: 12 })
              : t('widgets.streak.title')}
          </Text>
        </View>
        {colSpan < 2 && (
          <Text className="text-[15px] font-bold text-foreground">12</Text>
        )}
      </View>

      <View
        className={`flex-row mt-[10px] ${colSpan >= 2 ? 'gap-[6px]' : 'gap-1'}`}
      >
        {WEEK_ACTIVITY.map((active, i) => (
          <View key={i} className="flex-1 items-center gap-1">
            <View
              className={`w-full rounded-md ${colSpan >= 2 ? 'h-6' : 'h-5'} ${
                active ? 'bg-sage' : 'bg-surface-sunk'
              }`}
            />
            {colSpan >= 2 && (
              <Text className="text-[9px] font-medium text-muted">
                {weekdayLabel(i18n.language, i)}
              </Text>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
}
