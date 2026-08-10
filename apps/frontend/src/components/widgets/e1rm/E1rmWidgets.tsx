import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@pumped/ui/clay/Card';
import { DeltaChip } from '@pumped/ui/clay/Pill';
import { Sparkline } from '@pumped/ui/clay/Sparkline';
import { colors } from '@pumped/ui/theme/tokens';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import { WidgetLabelRow } from '../shell/WidgetLabelRow';

type WidgetProps = { colSpan: number; width: number };

function useE1rmLabel(): string {
  const { t } = useTranslation();
  const { focusLiftName } = useHomeWidgetData();
  return focusLiftName
    ? t('widgets.e1rm.titleFor', { name: focusLiftName })
    : t('widgets.e1rm.title');
}

export function E1rmCompactWidget(_props: WidgetProps) {
  const { t } = useTranslation();
  const label = useE1rmLabel();
  const { e1rmValue, weightUnitLabel } = useHomeWidgetData();
  return (
    <Card radius="lg" pad={15}>
      <View className="gap-[10px]">
        <WidgetLabelRow label={label} />
        {e1rmValue == null ? (
          <Text className="text-[13px] font-[500] leading-[1.4] text-muted">
            {t('widgets.e1rm.empty')}
          </Text>
        ) : (
          <View className="flex-row items-baseline">
            <Text className="text-[30px] font-[800] tracking-[-0.9px] text-foreground">
              {e1rmValue.toFixed(1)}
            </Text>
            <Text className="ml-[3px] text-[13px] font-[600] text-muted">
              {weightUnitLabel}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}

export function E1rmWideWidget(_props: WidgetProps) {
  const { t } = useTranslation();
  const label = useE1rmLabel();
  const { e1rmValue, e1rmDelta, e1rmSpark, weightUnitLabel } =
    useHomeWidgetData();
  return (
    <Card radius="lg" pad={16}>
      <View className="gap-[12px]">
        <WidgetLabelRow label={label} />
        {e1rmValue == null ? (
          <Text className="text-[13px] font-[500] leading-[1.4] text-muted">
            {t('widgets.e1rm.empty')}
          </Text>
        ) : (
          <>
            <View className="flex-row items-baseline">
              <Text className="text-[30px] font-[800] tracking-[-0.9px] text-foreground">
                {e1rmValue.toFixed(1)}
              </Text>
              <Text className="ml-[3px] text-[13px] font-[600] text-muted">
                {weightUnitLabel}
              </Text>
            </View>
            {e1rmDelta != null ? (
              <DeltaChip
                value={`${e1rmDelta >= 0 ? '+' : ''}${e1rmDelta.toFixed(1)}`}
                suffix={t('widgets.e1rm.days28')}
              />
            ) : null}
            {e1rmSpark.length > 1 ? (
              <Sparkline
                data={e1rmSpark}
                color={colors.ink}
                width={120}
                height={30}
              />
            ) : null}
          </>
        )}
      </View>
    </Card>
  );
}
