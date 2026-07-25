import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SegmentedControl } from '@pumped/ui';
import { AppShell } from '@/components/layout/AppShell';
import { TabBarInsetSpacer } from '@/components/layout/TabBarInsetSpacer';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { TrendsHeader } from './components/TrendsHeader';
import { TrendsMetricSummary } from './components/TrendsMetricSummary';
import { TrendsChartCard } from './components/TrendsChartCard';
import { PersonalRecordsSection } from './components/PersonalRecordsSection';
import { CalculationPanel } from './components/CalculationPanel';
import { TrendsHistorySection } from './components/TrendsHistorySection';
import { useTrendsData } from './useTrendsData';
import { buildTrendSeries, type TrendMetric } from './trendsModel';

const METRIC_ORDER: TrendMetric[] = ['strength', 'volume', 'bodyweight'];

export function TrendsScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useUserProfile();
  const { workouts, deleteWorkout } = useWorkoutHistory();
  const data = useTrendsData();

  const [metric, setMetric] = useState<TrendMetric>('strength');

  const options = useMemo(
    () =>
      METRIC_ORDER.map(value => ({
        value,
        label: t(`trends.metric.${value}`),
      })),
    [t],
  );

  const series = useMemo(() => {
    if (metric === 'volume') {
      return buildTrendSeries(data.volumePoints, {
        convertWeight: true,
        weightUnit: profile.weightUnit,
      });
    }
    if (metric === 'bodyweight') {
      return buildTrendSeries(data.bodyweightPoints, {
        convertWeight: true,
        weightUnit: profile.weightUnit,
      });
    }
    return buildTrendSeries(data.strengthPoints, {
      convertWeight: true,
      weightUnit: profile.weightUnit,
    });
  }, [metric, data, profile.weightUnit]);

  const metricTitle =
    metric === 'strength' && data.focusExerciseName
      ? t('trends.metricTitle.strengthNamed', { name: data.focusExerciseName })
      : t(`trends.metricTitle.${metric}`);

  return (
    <AppShell showTabBar>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-8 pt-7"
        showsVerticalScrollIndicator={false}
      >
        <TrendsHeader />

        <SegmentedControl
          options={options}
          value={metric}
          onChange={value => setMetric(value as TrendMetric)}
        />

        <TrendsMetricSummary
          title={metricTitle}
          value={series.latest}
          unit={profile.weightUnit}
          delta={series.delta}
          deltaSuffix={t('trends.deltaSuffix')}
          emptyLabel={t('trends.noData')}
        />

        <TrendsChartCard values={series.values} emptyLabel={t('trends.noData')} />

        <CalculationPanel metric={metric} />

        <PersonalRecordsSection
          prs={data.prs}
          exerciseName={data.focusExerciseName}
          weightUnit={profile.weightUnit}
        />

        <TrendsHistorySection
          workouts={workouts}
          weightUnit={profile.weightUnit}
          onWorkoutPress={workoutId =>
            navigation.navigate('CompletedWorkout', { workoutId })
          }
          onWorkoutDelete={deleteWorkout}
        />

        <TabBarInsetSpacer />
      </ScrollView>
    </AppShell>
  );
}
