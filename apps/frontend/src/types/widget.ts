import type { IconName } from '@/components/icons/ClayIcon';
import type { TranslationResource } from '@/i18n/resources';

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

export type WidgetNameKey = `widgets.names.${Extract<
  keyof TranslationResource['widgets']['names'],
  string
>}`;

export type WidgetMeta = {
  type: WidgetType;
  nameKey: WidgetNameKey;
  icon: IconName;
  allowedSpans: number[];
  defaultSpan: number;
};
