import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { CompletedExerciseHistorySection } from '@/components/exercise/CompletedExerciseHistorySection';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { colors } from '@/theme/tokens';
import type { ExerciseHistoryEntry } from '@/hooks/useExerciseAnalytics';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import { formatFullDate } from './exerciseFormat';

const PAGE_SIZE = 5;

type HistoryTabProps = {
  exerciseName: string;
  history: ExerciseHistoryEntry[];
  weightUnit: WeightUnit;
  onOpenWorkout: (workoutId: string) => void;
};

type SetLibrary = ReturnType<typeof useSetTypeLibrary>;

type HistoryCardProps = {
  entry: ExerciseHistoryEntry;
  previousSets: ExerciseHistoryEntry['sets'] | undefined;
  exerciseName: string;
  weightUnit: WeightUnit;
  isCollapsed: boolean;
  onToggle: () => void;
  onOpen: () => void;
  setTypeOptions: SetLibrary['options'];
  setTypesById: SetLibrary['byId'];
};

function HistoryCard({
  entry,
  previousSets,
  exerciseName,
  weightUnit,
  isCollapsed,
  onToggle,
  onOpen,
  setTypeOptions,
  setTypesById,
}: HistoryCardProps) {
  const { t, i18n } = useTranslation();

  return (
    <View className="overflow-hidden rounded-[18px] border border-border-hairline bg-surface-card">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('exerciseOverview.history.openA11y', {
          name: entry.workoutName,
        })}
        onPress={onOpen}
        className="flex-row items-center gap-3 px-4 pb-3 pt-[14px] active:opacity-70"
      >
        <View className="h-[38px] w-[38px] items-center justify-center rounded-full bg-surface-sunk">
          <ClayIcon name="history" size={18} color={colors.accent} />
        </View>
        <View className="min-w-0 flex-1">
          <Text
            className="text-[13.5px] font-semibold text-foreground"
            numberOfLines={1}
          >
            {entry.workoutName}
          </Text>
          <Text className="mt-[1px] text-[11.5px] text-muted">
            {formatFullDate(entry.startedAt, i18n.language)}
          </Text>
        </View>
        <ClayIcon name="chevron" size={16} color={colors.muted} />
      </Pressable>

      <View className="border-t border-border-soft">
        <CompletedExerciseHistorySection
          index={0}
          name={exerciseName}
          sets={entry.sets}
          previousSets={previousSets}
          weightUnit={weightUnit}
          setTypeOptions={setTypeOptions}
          setTypesById={setTypesById}
          isCollapsed={isCollapsed}
          onToggleCollapsed={onToggle}
          edgeToEdge={false}
          showHeader={false}
        />
      </View>
    </View>
  );
}

type PagerProps = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

function Pager({ page, totalPages, onPrev, onNext }: PagerProps) {
  const { t } = useTranslation();
  const atStart = page === 0;
  const atEnd = page >= totalPages - 1;

  return (
    <View className="mt-1 flex-row items-center justify-center gap-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('exerciseOverview.history.prevPageA11y')}
        disabled={atStart}
        onPress={onPrev}
        className={`h-9 w-9 items-center justify-center rounded-full border border-border-hairline bg-surface-card active:opacity-70 ${
          atStart ? 'opacity-40' : ''
        }`}
      >
        <ClayIcon name="back" size={18} color={colors.ink} />
      </Pressable>
      <Text className="text-[12.5px] font-semibold text-text-secondary">
        {t('exerciseOverview.history.pageIndicator', {
          page: page + 1,
          total: totalPages,
        })}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('exerciseOverview.history.nextPageA11y')}
        disabled={atEnd}
        onPress={onNext}
        className={`h-9 w-9 items-center justify-center rounded-full border border-border-hairline bg-surface-card active:opacity-70 ${
          atEnd ? 'opacity-40' : ''
        }`}
      >
        <ClayIcon name="chevron" size={18} color={colors.ink} />
      </Pressable>
    </View>
  );
}

export function HistoryTab({
  exerciseName,
  history,
  weightUnit,
  onOpenWorkout,
}: HistoryTabProps) {
  const { t } = useTranslation();
  const { options: setTypeOptions, byId: setTypesById } = useSetTypeLibrary();
  const [page, setPage] = useState(0);
  const [expandedWorkoutIds, setExpandedWorkoutIds] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleExpanded = (workoutId: string) => {
    setExpandedWorkoutIds(current => {
      const next = new Set(current);
      if (next.has(workoutId)) next.delete(workoutId);
      else next.add(workoutId);
      return next;
    });
  };

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * PAGE_SIZE;
  const pageItems = history.slice(start, start + PAGE_SIZE);

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-[10px] px-4 pb-7 pt-1"
      showsVerticalScrollIndicator={false}
    >
      {history.length > 0 ? (
        <>
          <Text className="px-1 pb-1 text-[11px] font-bold uppercase tracking-[1.32px] text-muted">
            {t('exerciseOverview.details.workouts', { count: history.length })}
          </Text>
          {pageItems.map((entry, index) => (
            <HistoryCard
              key={entry.workoutId}
              entry={entry}
              previousSets={history[start + index + 1]?.sets}
              exerciseName={exerciseName}
              weightUnit={weightUnit}
              isCollapsed={!expandedWorkoutIds.has(entry.workoutId)}
              onToggle={() => toggleExpanded(entry.workoutId)}
              onOpen={() => onOpenWorkout(entry.workoutId)}
              setTypeOptions={setTypeOptions}
              setTypesById={setTypesById}
            />
          ))}
          {totalPages > 1 ? (
            <Pager
              page={safePage}
              totalPages={totalPages}
              onPrev={() => setPage(p => Math.max(0, p - 1))}
              onNext={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            />
          ) : null}
        </>
      ) : (
        <View className="rounded-[18px] border border-dashed border-border-soft px-4 py-6">
          <Text className="text-center text-[13.5px] font-semibold text-foreground">
            {t('exerciseOverview.history.emptyTitle')}
          </Text>
          <Text className="mt-2 text-center text-[12.5px] text-text-secondary">
            {t('exerciseOverview.history.emptyBody')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
