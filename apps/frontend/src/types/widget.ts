import type { IconName } from '@pumped/ui/icons/ClayIcon';
import type { TranslationResource } from '@/i18n/resources';

export type WidgetType =
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
};
