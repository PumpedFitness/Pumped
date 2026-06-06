import type { ComponentType } from 'react';
import type { WidgetType, WidgetMeta } from '../../types/widget';
import { RecoveryWidget } from './RecoveryWidget';
import { NextWorkoutWidget } from './NextWorkoutWidget';
import { StreakWidget } from './StreakWidget';
import { ScheduleWidget } from './ScheduleWidget';
import { TimeWidget } from './TimeWidget';
import { WeeklyVolumeWidget } from './WeeklyVolumeWidget';
import { ChartWidget } from './ChartWidget';

export type WidgetComponentProps = {
  colSpan: number;
  width: number;
};

type WidgetRegistryEntry = {
  component: ComponentType<WidgetComponentProps>;
  meta: WidgetMeta;
};

export const widgetRegistry: Record<WidgetType, WidgetRegistryEntry> = {
  recovery: {
    component: RecoveryWidget,
    meta: {
      type: 'recovery',
      displayName: 'Recovery',
      icon: 'target',
      allowedSpans: [3],
      defaultSpan: 3,
    },
  },
  nextWorkout: {
    component: NextWorkoutWidget,
    meta: {
      type: 'nextWorkout',
      displayName: 'Last Session',
      icon: 'dumbbell',
      allowedSpans: [3],
      defaultSpan: 3,
    },
  },
  streak: {
    component: StreakWidget,
    meta: {
      type: 'streak',
      displayName: 'Streak',
      icon: 'flame',
      allowedSpans: [1, 2],
      defaultSpan: 2,
    },
  },
  schedule: {
    component: ScheduleWidget,
    meta: {
      type: 'schedule',
      displayName: 'Schedule',
      icon: 'calendar',
      allowedSpans: [2, 3],
      defaultSpan: 2,
    },
  },
  time: {
    component: TimeWidget,
    meta: {
      type: 'time',
      displayName: 'Time',
      icon: 'clock',
      allowedSpans: [1],
      defaultSpan: 1,
    },
  },
  weeklyVolume: {
    component: WeeklyVolumeWidget,
    meta: {
      type: 'weeklyVolume',
      displayName: 'Weekly Volume',
      icon: 'trend',
      allowedSpans: [1],
      defaultSpan: 1,
    },
  },
  chart: {
    component: ChartWidget,
    meta: {
      type: 'chart',
      displayName: 'Trend',
      icon: 'trend',
      allowedSpans: [2, 3],
      defaultSpan: 3,
    },
  },
};
