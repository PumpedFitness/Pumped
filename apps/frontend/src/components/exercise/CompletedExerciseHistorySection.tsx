import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { resolveSetWeightReps } from '@/data/local/sets/setTypes';
import { displayWeight } from '@/utils/units';
import { ExerciseSectionHeader } from '@/components/exercise/ExerciseSectionHeader';
import { ExerciseSetTable } from '@/components/exercise/set-table';
import type { ExerciseSetTableProps } from '@/components/exercise/set-table/exerciseSetTableModel';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { colors } from '@/theme/tokens';
import type { PerformedSet } from '@/types/workout';

type ExerciseStats = {
  sets: number;
  volumeKg: number;
  topWeightKg: number | null;
};

type StatTileProps = {
  label: string;
  value: string;
};

type CompletedExerciseHistorySectionProps = {
  index: number;
  name: string;
  sets: ExerciseSetTableProps['sets'];
  previousSets?: PerformedSet[];
  weightUnit: WeightUnit;
  setTypeOptions: ExerciseSetTableProps['setTypeOptions'];
  setTypesById: ExerciseSetTableProps['setTypesById'];
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  collapseControlPosition?: 'header' | 'overview';
  edgeToEdge?: boolean;
  showHeader?: boolean;
  onOpen?: () => void;
};

function buildExerciseStats(
  sets: ExerciseSetTableProps['sets'],
): ExerciseStats {
  return sets.reduce<ExerciseStats>(
    (stats, set) => {
      const { weight, reps } = resolveSetWeightReps(set);
      const weightKg = weight ?? 0;
      const volumeKg = weight !== null && reps !== null ? weight * reps : 0;

      return {
        sets: stats.sets + 1,
        volumeKg: stats.volumeKg + volumeKg,
        topWeightKg:
          weightKg > 0
            ? Math.max(stats.topWeightKg ?? 0, weightKg)
            : stats.topWeightKg,
      };
    },
    { sets: 0, volumeKg: 0, topWeightKg: null },
  );
}

function formatVolume(volumeKg: number, weightUnit: WeightUnit): string {
  const value = displayWeight(volumeKg, weightUnit);
  return `${Math.round(value).toLocaleString()} ${weightUnit}`;
}

function ExerciseStatPill({ label, value }: StatTileProps) {
  return (
    <View className="min-w-0 flex-1">
      <Text className="text-[9px] font-bold uppercase tracking-[0.6px] text-muted">
        {label}
      </Text>
      <Text className="mt-0.5 text-[13px] font-bold tabular-nums text-foreground">
        {value}
      </Text>
    </View>
  );
}

type ExerciseStatsOverviewProps = {
  stats: ExerciseStats;
  topWeight: string;
  weightUnit: WeightUnit;
};

function ExerciseStatsOverview({
  stats,
  topWeight,
  weightUnit,
}: ExerciseStatsOverviewProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row gap-3">
      <ExerciseStatPill
        label={t('completedWorkout.exerciseStats.sets')}
        value={`${stats.sets}`}
      />
      <ExerciseStatPill
        label={t('completedWorkout.exerciseStats.volume')}
        value={formatVolume(stats.volumeKg, weightUnit)}
      />
      <ExerciseStatPill
        label={t('completedWorkout.exerciseStats.topWeight')}
        value={topWeight}
      />
    </View>
  );
}

export function CompletedExerciseHistorySection({
  index,
  name,
  sets,
  previousSets,
  weightUnit,
  setTypeOptions,
  setTypesById,
  isCollapsed,
  edgeToEdge = true,
  showHeader = true,
  collapseControlPosition = showHeader ? 'header' : 'overview',
  onOpen,
  onToggleCollapsed,
}: CompletedExerciseHistorySectionProps) {
  const { t } = useTranslation();
  const stats = buildExerciseStats(sets);
  const setCount = stats.sets;
  const topWeight =
    stats.topWeightKg == null
      ? t('common.notAvailable')
      : `${displayWeight(stats.topWeightKg, weightUnit)}`;
  const containerClassName = edgeToEdge
    ? '-mx-5 overflow-hidden border-y border-border-hairline bg-background'
    : 'overflow-hidden';
  const statsRowClassName = edgeToEdge
    ? 'border-b border-border-hairline bg-surface-card px-4 py-2.5'
    : 'border-b border-border-hairline px-4 py-2.5';
  const showOverviewCollapseControl = collapseControlPosition === 'overview';

  return (
    <View className={containerClassName}>
      {showHeader ? (
        <ExerciseSectionHeader
          index={index}
          name={name}
          doneCount={setCount}
          totalCount={setCount}
          state="finished"
          onOpen={onOpen}
          isCollapsed={isCollapsed}
          onToggleCollapsed={
            collapseControlPosition === 'header' ? onToggleCollapsed : undefined
          }
        />
      ) : null}
      <View className={statsRowClassName}>
        {!showOverviewCollapseControl ? (
          <ExerciseStatsOverview
            stats={stats}
            topWeight={topWeight}
            weightUnit={weightUnit}
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={name}
            className="flex-row items-center gap-3"
            onPress={onToggleCollapsed}
          >
            <View className="min-w-0 flex-1">
              <ExerciseStatsOverview
                stats={stats}
                topWeight={topWeight}
                weightUnit={weightUnit}
              />
            </View>
            <View className="h-8 w-8 items-center justify-center rounded-full active:bg-surface-sunk">
              <ClayIcon
                name={isCollapsed ? 'chevron' : 'chevronDown'}
                size={17}
                color={colors.muted}
              />
            </View>
          </Pressable>
        )}
      </View>
      {!isCollapsed ? (
        <View className="px-4 py-3">
          <ExerciseSetTable
            readOnly
            sets={sets}
            previousSets={previousSets}
            setTypeOptions={setTypeOptions}
            setTypesById={setTypesById}
            weightUnit={weightUnit}
          />
        </View>
      ) : null}
    </View>
  );
}
