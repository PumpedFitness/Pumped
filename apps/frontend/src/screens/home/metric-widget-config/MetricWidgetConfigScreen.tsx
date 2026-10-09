import { useState } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { SettingsSection } from '@pumped/ui/clay/SettingsSection';
import { LibraryPicker } from '@pumped/ui/forms/LibraryPicker';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { AppView } from '@/components/layout/AppView';
import { ModalHeader } from '@/components/layout/ModalHeader';
import { GAP } from '@/components/widgets/grid/gridConstants';
import { widgetRegistry } from '@/components/widgets/registry';
import { MetricTrackerCard } from '@/components/widgets/metric-tracker/MetricTrackerCard';
import { METRIC_CATALOG } from '@/components/widgets/metric-tracker/metricCatalog';
import {
  DEFAULT_RANGE_BUCKET,
  RANGE_BUCKETS,
} from '@/components/widgets/metric-tracker/metricSeries';
import {
  METRIC_CHARTS,
  METRIC_RANGES,
  parseMetricTrackerConfig,
  type MetricTrackerConfig,
} from '@/components/widgets/metric-tracker/metricTrackerConfig';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { ConfigSegment } from './components/ConfigSegment';
import { MetricPickerSection } from './components/MetricPickerSection';

type MetricWidgetConfigRouteProp = RouteProp<
  RootStackParamList,
  'MetricWidgetConfig'
>;

// Home's horizontal padding (px-[18px]) on both sides.
const HOME_GUTTER = 36;

export function MetricWidgetConfigScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<MetricWidgetConfigRouteProp>();
  const { width: windowWidth } = useWindowDimensions();
  const exerciseOptions = useExerciseOptions();
  const layout = useHomescreenStore(s => s.layout);
  const addWidget = useHomescreenStore(s => s.addWidget);
  const updateWidgetConfig = useHomescreenStore(s => s.updateWidgetConfig);

  const existing =
    'widgetId' in params
      ? layout.find(widget => widget.id === params.widgetId)
      : undefined;
  const type = 'type' in params ? params.type : existing?.type;
  const colSpan = type ? widgetRegistry[type].meta.colSpan : 3;

  const [draft, setDraft] = useState<MetricTrackerConfig>(() =>
    parseMetricTrackerConfig(existing?.config),
  );
  const [exercisePickerVisible, setExercisePickerVisible] = useState(false);

  const needsExercise = METRIC_CATALOG[draft.metric].needsExercise;
  const exerciseName = exerciseOptions.find(
    option => option.id === draft.exerciseId,
  )?.name;

  const unitWidth = (windowWidth - HOME_GUTTER - GAP * 2) / 3;
  const previewWidth = colSpan * unitWidth + (colSpan - 1) * GAP;

  const update = (patch: Partial<MetricTrackerConfig>) =>
    setDraft(current => ({ ...current, ...patch }));

  const handleSave = () => {
    if (needsExercise && !draft.exerciseId) {
      setExercisePickerVisible(true);
      return;
    }
    const config: MetricTrackerConfig = needsExercise
      ? draft
      : { ...draft, exerciseId: null };
    if (existing) {
      updateWidgetConfig(existing.id, config);
      navigation.goBack();
    } else if (type) {
      addWidget(type, config);
      navigation.popTo('Main');
    }
  };

  return (
    <AppView>
      <ModalHeader
        title={t('widgets.metricTracker.config.title')}
        rightLabel={existing ? t('common.save') : t('common.add')}
        onLeftPress={() => navigation.goBack()}
        onRightPress={handleSave}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-10 pt-5"
      >
        <View className="mb-6 items-center">
          <View pointerEvents="none" style={{ width: previewWidth }}>
            <MetricTrackerCard
              config={draft}
              colSpan={colSpan}
              width={previewWidth}
            />
          </View>
        </View>

        <MetricPickerSection
          value={draft.metric}
          onChange={metric => {
            update({ metric });
            if (METRIC_CATALOG[metric].needsExercise && !draft.exerciseId) {
              setExercisePickerVisible(true);
            }
          }}
        />

        {needsExercise ? (
          <SettingsSection label={t('widgets.metricTracker.config.exercise')}>
            <ListRow
              testID="metric-exercise-row"
              icon={
                <ClayIcon name="dumbbell" size={17} color={colors.accent} />
              }
              label={
                exerciseName ?? t('widgets.metricTracker.config.chooseExercise')
              }
              trailing={
                <ClayIcon name="chevron" size={16} color={colors.muted} />
              }
              onPress={() => setExercisePickerVisible(true)}
            />
          </SettingsSection>
        ) : null}

        <ConfigSegment
          label={t('widgets.metricTracker.config.chart')}
          value={draft.chart}
          options={METRIC_CHARTS.map(chart => ({
            value: chart,
            label: t(`widgets.metricTracker.charts.${chart}`),
          }))}
          onChange={chart => update({ chart })}
        />
        <ConfigSegment
          label={t('widgets.metricTracker.config.range')}
          value={draft.range}
          options={METRIC_RANGES.map(range => ({
            value: range,
            label: t(`widgets.metricTracker.rangeOptions.${range}`),
          }))}
          onChange={range =>
            update({
              range,
              bucket: RANGE_BUCKETS[range].includes(draft.bucket)
                ? draft.bucket
                : DEFAULT_RANGE_BUCKET[range],
            })
          }
        />
        <ConfigSegment
          label={t('widgets.metricTracker.config.groupBy')}
          value={draft.bucket}
          options={RANGE_BUCKETS[draft.range].map(bucket => ({
            value: bucket,
            label: t(`widgets.metricTracker.buckets.${bucket}`),
          }))}
          onChange={bucket => update({ bucket })}
        />
      </ScrollView>

      <LibraryPicker
        visible={exercisePickerVisible}
        title={t('widgets.metricTracker.config.chooseExercise')}
        items={exerciseOptions}
        selectedIds={draft.exerciseId ? [draft.exerciseId] : []}
        onClose={() => setExercisePickerVisible(false)}
        onChange={ids => update({ exerciseId: ids[0] ?? null })}
      />
    </AppView>
  );
}
