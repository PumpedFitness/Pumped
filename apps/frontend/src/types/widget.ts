import type { IconName } from '@pumped/ui/icons/ClayIcon';
import type { TranslationResource } from '@/i18n/resources';

export type WidgetType =
  | 'todaySession'
  | 'quickActions'
  | 'notifications'
  | 'tonnageCompact'
  | 'tonnageWide'
  | 'e1rmCompact'
  | 'e1rmWide'
  | 'adherenceWide'
  | 'adherenceFull'
  | 'bodyweightCompact'
  | 'bodyweightWide'
  | 'muscleVolumeFull';

export type WidgetGroup =
  | 'todaySession'
  | 'quickActions'
  | 'notifications'
  | 'tonnage'
  | 'e1rm'
  | 'adherence'
  | 'bodyweight'
  | 'muscleVolume';

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
  /**
   * Roughly how tall this widget renders, in points.
   *
   * Used only before the real thing has been measured: it sizes the loading
   * skeleton and seeds the grid's row heights. A flat fallback for every type
   * put the tall session card in a 112px slot, so the whole grid visibly
   * reflowed one frame after mount.
   *
   * Approximations are fine — every value here is replaced by the measured
   * height as soon as the widget lays out. Being within ~20px is enough for the
   * correction to go unnoticed.
   */
  estimatedHeight: number;
};
