import type { IconName } from '../components/icons/ClayIcon';

export type WidgetType =
  | 'recovery'
  | 'nextWorkout'
  | 'streak'
  | 'schedule'
  | 'time'
  | 'weeklyVolume'
  | 'chart';

export type WidgetPlacement = {
  id: string;
  type: WidgetType;
  colSpan: number; // 1, 2, or 3
};

export type WidgetMeta = {
  type: WidgetType;
  displayName: string;
  icon: IconName;
  allowedSpans: number[];
  defaultSpan: number;
};
