import type { IconName } from '@/components/icons/ClayIcon';
import type { TranslationResource } from '@/i18n/resources';

export type WidgetType =
  | 'recoveryFull'
  | 'lastSessionFull'
  | 'streakCompact'
  | 'streakWide'
  | 'scheduleWide'
  | 'scheduleFull'
  | 'timeCompact'
  | 'weeklyVolumeCompact'
  | 'trendWide'
  | 'trendFull';

export type WidgetGroup =
  | 'recovery'
  | 'lastSession'
  | 'streak'
  | 'schedule'
  | 'time'
  | 'weeklyVolume'
  | 'trend';

export type WidgetPlacement = {
  id: string;
  type: WidgetType;
  colSpan: number; // 1, 2, or 3
  row: number;
  column: number;
};

export type WidgetNameKey = `widgets.names.${Extract<
  keyof TranslationResource['widgets']['names'],
  string
>}`;

export type WidgetMeta = {
  type: WidgetType;
  group: WidgetGroup;
  nameKey: WidgetNameKey;
  icon: IconName;
  colSpan: 1 | 2 | 3;
};
