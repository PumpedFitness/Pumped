import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@pumped/ui/clay/Card';
import { Badge } from '@pumped/ui/clay/Pill';
import { BarGroup } from '@pumped/ui/clay/BarRow';
import { colors } from '@pumped/ui/theme/tokens';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import { WidgetLabelRow } from '../shell/WidgetLabelRow';

type WidgetProps = { colSpan: number; width: number };

// bar-idle for all but the last two bars (ink, accent) per the v2 spec.
function barColors(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    if (i === n - 1) return colors.accent;
    if (i === n - 2) return colors.ink;
    return colors.barIdle;
  });
}

function TonnageValue({ value }: { value: number }) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-baseline">
      <Text className="text-[30px] font-[800] tracking-[-0.9px] text-foreground">
        {value.toFixed(1)}
      </Text>
      <Text className="ml-[3px] text-[13px] font-[600] text-muted">
        {t('widgets.tonnage.unit')}
      </Text>
    </View>
  );
}

export function TonnageCompactWidget(_props: WidgetProps) {
  const { t } = useTranslation();
  const { tonnageTonnes } = useHomeWidgetData();
  return (
    <Card radius="lg" pad={15}>
      <View className="gap-[10px]">
        <WidgetLabelRow label={t('widgets.tonnage.title')} />
        <TonnageValue value={tonnageTonnes} />
      </View>
    </Card>
  );
}

export function TonnageWideWidget(_props: WidgetProps) {
  const { t } = useTranslation();
  const { tonnageTonnes, tonnageBars } = useHomeWidgetData();
  const heights =
    tonnageBars.length > 0 ? tonnageBars : [0.34, 0.52, 0.44, 0.68, 0.6, 0.82, 1];
  return (
    <Card radius="lg" pad={16}>
      <View className="gap-[12px]">
        <WidgetLabelRow
          label={t('widgets.tonnage.title')}
          right={<Badge tone="accent">ƒx</Badge>}
        />
        <TonnageValue value={tonnageTonnes} />
        <BarGroup
          heights={heights}
          height={34}
          gap={4}
          colors={barColors(heights.length)}
        />
      </View>
    </Card>
  );
}
