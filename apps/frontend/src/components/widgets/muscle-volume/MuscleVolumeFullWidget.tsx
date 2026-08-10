import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@pumped/ui/clay/Card';
import { colors } from '@pumped/ui/theme/tokens';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import { WidgetLabelRow } from '../shell/WidgetLabelRow';

type WidgetProps = { colSpan: number; width: number };

// Ink for the top rows, ink-2 for the middle, accent for the lightest — the
// v2 palette walk.
function rowColor(index: number, total: number): string {
  if (index === total - 1) return colors.accent;
  if (index >= total - 3) return colors.ink2;
  return colors.ink;
}

// Meter geometry lives in style objects on purpose: arbitrary height classes
// inside the measured drag grid have burned us twice (uniwind CSS staleness).
const TRACK_STYLE = {
  height: 10,
  borderRadius: 999,
  backgroundColor: colors.track,
  overflow: 'hidden' as const,
  flex: 1,
};

export function MuscleVolumeFullWidget(_props: WidgetProps) {
  const { t } = useTranslation();
  const { muscleVolume } = useHomeWidgetData();
  return (
    <Card radius="lg" pad={18}>
      <View className="gap-[14px]">
        <WidgetLabelRow label={t('widgets.muscleVolume.title')} />
        {muscleVolume.length === 0 ? (
          <Text className="text-[13px] font-[500] leading-[1.4] text-muted">
            {t('widgets.muscleVolume.empty')}
          </Text>
        ) : (
          <View className="gap-[11px]">
            {muscleVolume.map((row, index) => (
              <View
                key={row.name}
                className="flex-row items-center gap-[10px]"
              >
                <Text
                  className="w-[56px] text-[12px] font-[600] text-muted"
                  numberOfLines={1}
                >
                  {row.name}
                </Text>
                <View style={TRACK_STYLE}>
                  <View
                    style={{
                      width: `${Math.max(0, Math.min(1, row.fill)) * 100}%`,
                      height: 10,
                      borderRadius: 999,
                      backgroundColor: rowColor(index, muscleVolume.length),
                    }}
                  />
                </View>
                <Text className="w-[26px] text-right text-[12px] font-[700] text-foreground">
                  {row.sets}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
}
