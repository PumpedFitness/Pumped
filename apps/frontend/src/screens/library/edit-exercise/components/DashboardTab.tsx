import { ScrollView } from 'react-native';
import type { ExerciseAnalytics } from '@/hooks/useExerciseAnalytics';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { DashboardStatHero } from './DashboardStatHero';
import { DashboardVolumeTrend } from './DashboardVolumeTrend';
import { DashboardPrGrid } from './DashboardPrGrid';
import { DashboardLastSession } from './DashboardLastSession';

type DashboardTabProps = {
  analytics: ExerciseAnalytics;
  weightUnit: WeightUnit;
};

export function DashboardTab({ analytics, weightUnit }: DashboardTabProps) {
  const lastSession = analytics.history[0];

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-[14px] px-4 pb-7 pt-1"
      showsVerticalScrollIndicator={false}
    >
      <DashboardStatHero
        chartData={analytics.chartData}
        weightUnit={weightUnit}
      />
      <DashboardVolumeTrend
        chartData={analytics.chartData}
        weightUnit={weightUnit}
      />
      <DashboardPrGrid prs={analytics.prs} weightUnit={weightUnit} />
      {lastSession ? (
        <DashboardLastSession entry={lastSession} weightUnit={weightUnit} />
      ) : null}
    </ScrollView>
  );
}
