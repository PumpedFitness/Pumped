import { Pressable, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { WidgetComponentProps } from '@/types/widget';
import { MetricTrackerCard } from './MetricTrackerCard';
import { parseMetricTrackerConfig } from './metricTrackerConfig';

/**
 * A user-configured number tracker: any catalog metric, any range, shown as a
 * plain number, a line or bars. Unlike the other widget types it can be placed
 * many times — each placement carries its own config. In edit mode a gear
 * opens the config screen for this placement.
 */
export function MetricTrackerWidget({
  widgetId,
  config,
  colSpan,
  width,
  editing,
}: WidgetComponentProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const parsed = parseMetricTrackerConfig(config);

  return (
    <View>
      <MetricTrackerCard config={parsed} colSpan={colSpan} width={width} />
      {editing && widgetId ? (
        <View className="absolute -left-2 -top-2">
          <Pressable
            accessibilityLabel={t('widgets.metricTracker.configure')}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() =>
              navigation.navigate('MetricWidgetConfig', { widgetId })
            }
            className="h-7 w-7 items-center justify-center rounded-full bg-foreground active:opacity-80"
          >
            <ClayIcon name="settings" size={15} color={colors.cream} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
