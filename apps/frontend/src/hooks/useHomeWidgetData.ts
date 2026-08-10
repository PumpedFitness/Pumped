import { useMemo } from 'react';
import { useTodayWorkout } from './useTodayWorkout';
import { useWorkoutHistory } from './useWorkoutHistory';
import { useWorkoutTemplates } from './useWorkoutTemplates';
import { useUserProfile } from './useUserProfile';
import { useSchedules } from './useSchedules';
import { useScheduleWeek } from './useScheduleWeek';
import { useTrendsData } from '@/screens/trends/useTrendsData';
import {
  localDayIndex,
  templateIdsForDay,
} from '@/data/local/schedules/scheduleResolution';

const WEEK_MS = 7 * 86_400_000;

export type NextSession = {
  templateId: string | null;
  name: string;
  focus: string | null;
  exerciseCount: number;
  setCount: number;
  estimatedMinutes: number;
  targetTonnage: number;
};

export type AdherenceDay = 'done' | 'missed' | 'rest' | 'future';

export type WeekProgress = { done: number; total: number; percent: number };

export type MuscleVolumeRow = { name: string; sets: number; fill: number };

export type HomeWidgetData = {
  nextSession: NextSession | null;
  scheduleName: string | null;
  weekProgress: WeekProgress | null;
  focusLiftName: string | null;
  tonnageBars: number[];
  tonnageTonnes: number;
  e1rmValue: number | null;
  e1rmDelta: number | null;
  e1rmSpark: number[];
  adherence: AdherenceDay[];
  adherencePercent: number;
  bodyweightValue: number | null;
  bodyweightDeltaPerWeek: number | null;
  bodyweightSpark: number[];
  muscleVolume: MuscleVolumeRow[];
  weightUnitLabel: string;
};

// Roughly 2.6 minutes per working set — used only for the hero "~N min" estimate.
const MINUTES_PER_SET = 2.6;

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

type Template = ReturnType<typeof useWorkoutTemplates>['templates'][number];
type HistoryItem = ReturnType<typeof useWorkoutHistory>['workouts'][number];

function buildNextSession(
  today: ReturnType<typeof useTodayWorkout>['today'],
  templates: Template[],
  workouts: HistoryItem[],
): NextSession | null {
  if (today.kind !== 'pending' && today.kind !== 'skipped') return null;
  const { templateId, workoutName } = today;

  const template = templates.find(item => item.id === templateId);
  if (!template) {
    return {
      templateId,
      name: workoutName,
      focus: null,
      exerciseCount: 0,
      setCount: 0,
      estimatedMinutes: 0,
      targetTonnage: 0,
    };
  }

  const setCount = template.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );

  // Target tonnage = what this workout actually moved recently (avg of the
  // last 3 logged sessions of the same template), not a made-up heuristic.
  const pastVolumes = workouts
    .filter(workout => workout.workoutTemplateId === templateId)
    .slice(0, 3)
    .map(workout => workout.totalVolumeKg);
  const targetTonnage =
    pastVolumes.length > 0
      ? round1(
          pastVolumes.reduce((total, volume) => total + volume, 0) /
            pastVolumes.length /
            1000,
        )
      : 0;

  return {
    templateId,
    name: template.name,
    focus: template.description,
    exerciseCount: template.exercises.length,
    setCount,
    estimatedMinutes: Math.max(1, Math.round(setCount * MINUTES_PER_SET)),
    targetTonnage,
  };
}

export function useHomeWidgetData(): HomeWidgetData {
  const { today } = useTodayWorkout();
  const { workouts } = useWorkoutHistory();
  const { templates } = useWorkoutTemplates();
  const { profile } = useUserProfile();
  const { activeSchedule } = useSchedules();
  const week = useScheduleWeek();
  const trends = useTrendsData();

  const nextSession = useMemo(
    () => buildNextSession(today, templates, workouts),
    [today, templates, workouts],
  );

  const weekProgress = useMemo<WeekProgress | null>(() => {
    if (!week.hasActiveSchedule) return null;
    const trainingDays = week.days.filter(day => day.status !== 'rest');
    const done = trainingDays.filter(day => day.status === 'done').length;
    const total = trainingDays.length;
    return {
      done,
      total,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }, [week]);

  const tonnage = useMemo(() => {
    const now = Date.now();
    const buckets: number[] = new Array(7).fill(0);
    for (const workout of workouts) {
      const weeksAgo = Math.floor((now - workout.startedAt) / WEEK_MS);
      if (weeksAgo >= 0 && weeksAgo < 7) {
        buckets[6 - weeksAgo] += workout.totalVolumeKg / 1000;
      }
    }
    const max = Math.max(...buckets, 1);
    return { bars: buckets.map(value => value / max), tonnes: round1(buckets[6]) };
  }, [workouts]);

  const strength = useMemo(() => {
    const points = trends.strengthPoints;
    if (points.length === 0) {
      return { value: null, delta: null, spark: [] as number[] };
    }
    const spark = points.slice(-8).map(point => point.value);
    const value = spark[spark.length - 1] ?? null;
    const first = spark[0];
    const delta = value != null && first != null ? round1(value - first) : null;
    return { value, delta, spark };
  }, [trends.strengthPoints]);

  const bodyweight = useMemo(() => {
    const points = trends.bodyweightPoints;
    if (points.length === 0) {
      return { value: null, deltaPerWeek: null, spark: [] as number[] };
    }
    const spark = points.slice(-8).map(point => point.value);
    const value = spark[spark.length - 1] ?? null;
    const first = spark[0];
    const span = spark.length - 1;
    const deltaPerWeek =
      value != null && first != null && span > 0
        ? round1((value - first) / span)
        : null;
    return { value, deltaPerWeek, spark };
  }, [trends.bodyweightPoints]);

  const adherence = useMemo<{ days: AdherenceDay[]; percent: number }>(() => {
    const todayIndex = localDayIndex();
    const doneIndexes = new Set(
      workouts.map(workout => localDayIndex(workout.startedAt)),
    );
    const days: AdherenceDay[] = [];
    let done = 0;
    let missed = 0;
    // 28 days ending today. A day only counts as "missed" if the active
    // schedule actually planned a workout there — rest days are rest days.
    for (let i = 27; i >= 0; i -= 1) {
      const dayIndex = todayIndex - i;
      const scheduled = activeSchedule
        ? templateIdsForDay(activeSchedule, dayIndex).length > 0
        : false;
      if (doneIndexes.has(dayIndex)) {
        days.push('done');
        done += 1;
      } else if (scheduled && dayIndex < todayIndex) {
        days.push('missed');
        missed += 1;
      } else if (scheduled) {
        days.push('future');
      } else {
        days.push('rest');
      }
    }
    const tracked = done + missed;
    const percent = tracked > 0 ? Math.round((done / tracked) * 100) : 0;
    return { days, percent };
  }, [workouts, activeSchedule]);

  const muscleVolume = useMemo<MuscleVolumeRow[]>(() => {
    const now = Date.now();
    const counts = new Map<string, number>();
    for (const workout of workouts) {
      if (now - workout.startedAt > WEEK_MS) continue;
      const muscles = workout.muscleGroupNames;
      const perMuscle = workout.sets.length / Math.max(1, muscles.length);
      for (const name of muscles) {
        counts.set(name, (counts.get(name) ?? 0) + perMuscle);
      }
    }
    const rows = [...counts.entries()]
      .map(([name, sets]) => ({ name, sets: Math.round(sets) }))
      .sort((a, b) => b.sets - a.sets)
      .slice(0, 5);
    const max = Math.max(...rows.map(row => row.sets), 1);
    return rows.map(row => ({ ...row, fill: row.sets / max }));
  }, [workouts]);

  return {
    nextSession,
    scheduleName: week.scheduleName,
    weekProgress,
    focusLiftName: trends.focusExerciseName,
    tonnageBars: tonnage.bars,
    tonnageTonnes: tonnage.tonnes,
    e1rmValue: strength.value,
    e1rmDelta: strength.delta,
    e1rmSpark: strength.spark,
    adherence: adherence.days,
    adherencePercent: adherence.percent,
    bodyweightValue: bodyweight.value,
    bodyweightDeltaPerWeek: bodyweight.deltaPerWeek,
    bodyweightSpark: bodyweight.spark,
    muscleVolume,
    weightUnitLabel: profile.weightUnit,
  };
}
