import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import PagerView from 'react-native-pager-view';
import type { WeightUnit } from '@/data/local/schema/userProfile';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import { WorkoutCalendarSummarySlide } from './WorkoutCalendarSummarySlide';
import { WorkoutFocusSummarySlide } from './WorkoutFocusSummarySlide';
import { WorkoutVolumeSummarySlide } from './WorkoutVolumeSummarySlide';

type WorkoutHistorySummaryProps = {
  workouts: WorkoutHistoryItem[];
  weightUnit: WeightUnit;
};

const PAGE_COUNT = 3;

export function WorkoutHistorySummary({
  workouts,
  weightUnit,
}: WorkoutHistorySummaryProps) {
  const { t } = useTranslation();
  const pagerRef = useRef<PagerView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <View className="overflow-hidden rounded-[28px] bg-moss">
      <PagerView
        ref={pagerRef}
        initialPage={0}
        onPageSelected={event => setCurrentPage(event.nativeEvent.position)}
        style={{ height: 420 }}
      >
        <WorkoutCalendarSummarySlide key="calendar" workouts={workouts} />
        <WorkoutVolumeSummarySlide
          key="volume"
          workouts={workouts}
          weightUnit={weightUnit}
        />
        <WorkoutFocusSummarySlide key="focus" workouts={workouts} />
      </PagerView>

      <View className="h-10 flex-row items-center justify-center gap-2 border-t border-border-on-moss">
        {Array.from({ length: PAGE_COUNT }, (_, index) => (
          <Pressable
            key={index}
            accessibilityRole="button"
            accessibilityLabel={t('history.summary.pageA11y', {
              page: index + 1,
              total: PAGE_COUNT,
            })}
            className={`h-1.5 rounded-full ${
              currentPage === index ? 'w-6 bg-accent' : 'w-1.5 bg-white/20'
            }`}
            onPress={() => pagerRef.current?.setPage(index)}
          />
        ))}
      </View>
    </View>
  );
}
