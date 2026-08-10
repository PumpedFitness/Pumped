import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@pumped/ui/clay/Card';
import { colors } from '@pumped/ui/theme/tokens';
import {
  useHomeWidgetData,
  type AdherenceDay,
} from '@/hooks/useHomeWidgetData';
import { WidgetLabelRow } from '../shell/WidgetLabelRow';

type WidgetProps = { colSpan: number; width: number };

const DOT_COLORS: Record<AdherenceDay, string> = {
  done: colors.ink,
  missed: colors.barIdle,
  rest: 'rgba(27,26,24,0.07)',
  future: 'rgba(27,26,24,0.22)',
};

const COLS = 7;

function chunkRows(days: AdherenceDay[]): AdherenceDay[][] {
  const rows: AdherenceDay[][] = [];
  for (let i = 0; i < days.length; i += COLS) {
    rows.push(days.slice(i, i + COLS));
  }
  return rows;
}

function AdherenceContent() {
  const { t } = useTranslation();
  const { adherence, adherencePercent } = useHomeWidgetData();
  const rows = chunkRows(adherence.slice(-28));
  return (
    <View className="gap-[12px]">
      <WidgetLabelRow label={t('widgets.adherence.title')} />
      <View className="flex-row items-baseline">
        <Text className="text-[30px] font-[800] tracking-[-0.9px] text-foreground">
          {adherencePercent}
        </Text>
        <Text className="ml-[3px] text-[13px] font-[600] text-muted">%</Text>
      </View>
      <View className="gap-[5px]">
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row gap-[5px]">
            {row.map((day, colIndex) => (
              <View
                key={colIndex}
                className="h-[13px] flex-1 rounded-full"
                style={{ backgroundColor: DOT_COLORS[day] }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

export function AdherenceWideWidget(_props: WidgetProps) {
  return (
    <Card radius="lg" pad={16}>
      <AdherenceContent />
    </Card>
  );
}

export function AdherenceFullWidget(_props: WidgetProps) {
  return (
    <Card radius="lg" pad={18}>
      <AdherenceContent />
    </Card>
  );
}
