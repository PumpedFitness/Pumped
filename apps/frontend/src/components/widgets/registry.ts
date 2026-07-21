import type { ComponentType } from 'react';
import type { WidgetGroup, WidgetType, WidgetMeta } from '@/types/widget';
import { RecoveryFullWidget } from './recovery/RecoveryFullWidget';
import { LastSessionFullWidget } from './last-session/LastSessionFullWidget';
import { StreakCompactWidget } from './streak/StreakCompactWidget';
import { StreakWideWidget } from './streak/StreakWideWidget';
import { ScheduleWideWidget } from './schedule/ScheduleWideWidget';
import { ScheduleFullWidget } from './schedule/ScheduleFullWidget';
import { TimeCompactWidget } from './time/TimeCompactWidget';
import { WeeklyVolumeCompactWidget } from './weekly-volume/WeeklyVolumeCompactWidget';
import { TrendWideWidget } from './trend/TrendWideWidget';
import { TrendFullWidget } from './trend/TrendFullWidget';
import { ExerciseProgressFullWidget } from './exercise-progress/ExerciseProgressFullWidget';
import { PersonalRecordsWideWidget } from './personal-records/PersonalRecordsWideWidget';
import { MuscleBalanceFullWidget } from './muscle-balance/MuscleBalanceFullWidget';
import { WeeklyGoalWideWidget } from './weekly-goal/WeeklyGoalWideWidget';
import { ConsistencyFullWidget } from './consistency/ConsistencyFullWidget';
import { QuickStartWideWidget } from './quick-start/QuickStartWideWidget';
import { MilestonesCompactWidget } from './milestones/MilestonesCompactWidget';

type WidgetComponentProps = {
  colSpan: number;
  width: number;
};

type WidgetRegistryEntry = {
  component: ComponentType<WidgetComponentProps>;
  meta: WidgetMeta;
};

export const widgetRegistry: Record<WidgetType, WidgetRegistryEntry> = {
  recoveryFull: {
    component: RecoveryFullWidget,
    meta: {
      type: 'recoveryFull',
      group: 'recovery',
      nameKey: 'widgets.names.recovery',
      icon: 'target',
      colSpan: 3,
    },
  },
  lastSessionFull: {
    component: LastSessionFullWidget,
    meta: {
      type: 'lastSessionFull',
      group: 'lastSession',
      nameKey: 'widgets.names.lastSession',
      icon: 'dumbbell',
      colSpan: 3,
    },
  },
  streakCompact: {
    component: StreakCompactWidget,
    meta: {
      type: 'streakCompact',
      group: 'streak',
      nameKey: 'widgets.names.streak',
      icon: 'flame',
      colSpan: 1,
    },
  },
  streakWide: {
    component: StreakWideWidget,
    meta: {
      type: 'streakWide',
      group: 'streak',
      nameKey: 'widgets.names.streak',
      icon: 'flame',
      colSpan: 2,
    },
  },
  scheduleWide: {
    component: ScheduleWideWidget,
    meta: {
      type: 'scheduleWide',
      group: 'schedule',
      nameKey: 'widgets.names.schedule',
      icon: 'calendar',
      colSpan: 2,
    },
  },
  scheduleFull: {
    component: ScheduleFullWidget,
    meta: {
      type: 'scheduleFull',
      group: 'schedule',
      nameKey: 'widgets.names.schedule',
      icon: 'calendar',
      colSpan: 3,
    },
  },
  timeCompact: {
    component: TimeCompactWidget,
    meta: {
      type: 'timeCompact',
      group: 'time',
      nameKey: 'widgets.names.time',
      icon: 'clock',
      colSpan: 1,
    },
  },
  weeklyVolumeCompact: {
    component: WeeklyVolumeCompactWidget,
    meta: {
      type: 'weeklyVolumeCompact',
      group: 'weeklyVolume',
      nameKey: 'widgets.names.weeklyVolume',
      icon: 'trend',
      colSpan: 1,
    },
  },
  trendWide: {
    component: TrendWideWidget,
    meta: {
      type: 'trendWide',
      group: 'trend',
      nameKey: 'widgets.names.trend',
      icon: 'trend',
      colSpan: 2,
    },
  },
  trendFull: {
    component: TrendFullWidget,
    meta: {
      type: 'trendFull',
      group: 'trend',
      nameKey: 'widgets.names.trend',
      icon: 'trend',
      colSpan: 3,
    },
  },
  exerciseProgressFull: {
    component: ExerciseProgressFullWidget,
    meta: {
      type: 'exerciseProgressFull',
      group: 'exerciseProgress',
      nameKey: 'widgets.names.exerciseProgress',
      icon: 'trend',
      colSpan: 3,
    },
  },
  personalRecordsWide: {
    component: PersonalRecordsWideWidget,
    meta: {
      type: 'personalRecordsWide',
      group: 'personalRecords',
      nameKey: 'widgets.names.personalRecords',
      icon: 'award',
      colSpan: 2,
    },
  },
  muscleBalanceFull: {
    component: MuscleBalanceFullWidget,
    meta: {
      type: 'muscleBalanceFull',
      group: 'muscleBalance',
      nameKey: 'widgets.names.muscleBalance',
      icon: 'target',
      colSpan: 3,
    },
  },
  weeklyGoalWide: {
    component: WeeklyGoalWideWidget,
    meta: {
      type: 'weeklyGoalWide',
      group: 'weeklyGoal',
      nameKey: 'widgets.names.weeklyGoal',
      icon: 'target',
      colSpan: 2,
    },
  },
  consistencyFull: {
    component: ConsistencyFullWidget,
    meta: {
      type: 'consistencyFull',
      group: 'consistency',
      nameKey: 'widgets.names.consistency',
      icon: 'calendar',
      colSpan: 3,
    },
  },
  quickStartWide: {
    component: QuickStartWideWidget,
    meta: {
      type: 'quickStartWide',
      group: 'quickStart',
      nameKey: 'widgets.names.quickStart',
      icon: 'play',
      colSpan: 2,
    },
  },
  milestonesCompact: {
    component: MilestonesCompactWidget,
    meta: {
      type: 'milestonesCompact',
      group: 'milestones',
      nameKey: 'widgets.names.milestones',
      icon: 'star',
      colSpan: 1,
    },
  },
};

export const widgetGroups: Array<{
  group: WidgetGroup;
  variants: WidgetType[];
}> = [
  { group: 'recovery', variants: ['recoveryFull'] },
  { group: 'lastSession', variants: ['lastSessionFull'] },
  { group: 'streak', variants: ['streakCompact', 'streakWide'] },
  { group: 'schedule', variants: ['scheduleWide', 'scheduleFull'] },
  { group: 'time', variants: ['timeCompact'] },
  { group: 'weeklyVolume', variants: ['weeklyVolumeCompact'] },
  { group: 'trend', variants: ['trendWide', 'trendFull'] },
  { group: 'exerciseProgress', variants: ['exerciseProgressFull'] },
  { group: 'personalRecords', variants: ['personalRecordsWide'] },
  { group: 'muscleBalance', variants: ['muscleBalanceFull'] },
  { group: 'weeklyGoal', variants: ['weeklyGoalWide'] },
  { group: 'consistency', variants: ['consistencyFull'] },
  { group: 'quickStart', variants: ['quickStartWide'] },
  { group: 'milestones', variants: ['milestonesCompact'] },
];
