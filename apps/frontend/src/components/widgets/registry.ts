import type { ComponentType } from 'react';
import type { WidgetGroup, WidgetType, WidgetMeta } from '@/types/widget';
import {
  TonnageCompactWidget,
  TonnageWideWidget,
} from './tonnage/TonnageWidgets';
import { E1rmCompactWidget, E1rmWideWidget } from './e1rm/E1rmWidgets';
import {
  AdherenceWideWidget,
  AdherenceFullWidget,
} from './adherence/AdherenceWidgets';
import {
  BodyweightCompactWidget,
  BodyweightWideWidget,
} from './bodyweight/BodyweightWidgets';
import { MuscleVolumeFullWidget } from './muscle-volume/MuscleVolumeFullWidget';

type WidgetComponentProps = {
  colSpan: number;
  width: number;
};

type WidgetRegistryEntry = {
  component: ComponentType<WidgetComponentProps>;
  meta: WidgetMeta;
};

export const widgetRegistry: Record<WidgetType, WidgetRegistryEntry> = {
  tonnageCompact: {
    component: TonnageCompactWidget,
    meta: {
      type: 'tonnageCompact',
      group: 'tonnage',
      nameKey: 'widgets.names.tonnage',
      icon: 'trend',
      colSpan: 1,
    },
  },
  tonnageWide: {
    component: TonnageWideWidget,
    meta: {
      type: 'tonnageWide',
      group: 'tonnage',
      nameKey: 'widgets.names.tonnage',
      icon: 'trend',
      colSpan: 2,
    },
  },
  e1rmCompact: {
    component: E1rmCompactWidget,
    meta: {
      type: 'e1rmCompact',
      group: 'e1rm',
      nameKey: 'widgets.names.e1rm',
      icon: 'award',
      colSpan: 1,
    },
  },
  e1rmWide: {
    component: E1rmWideWidget,
    meta: {
      type: 'e1rmWide',
      group: 'e1rm',
      nameKey: 'widgets.names.e1rm',
      icon: 'award',
      colSpan: 2,
    },
  },
  adherenceWide: {
    component: AdherenceWideWidget,
    meta: {
      type: 'adherenceWide',
      group: 'adherence',
      nameKey: 'widgets.names.adherence',
      icon: 'calendar',
      colSpan: 2,
    },
  },
  adherenceFull: {
    component: AdherenceFullWidget,
    meta: {
      type: 'adherenceFull',
      group: 'adherence',
      nameKey: 'widgets.names.adherence',
      icon: 'calendar',
      colSpan: 3,
    },
  },
  bodyweightCompact: {
    component: BodyweightCompactWidget,
    meta: {
      type: 'bodyweightCompact',
      group: 'bodyweight',
      nameKey: 'widgets.names.bodyweight',
      icon: 'scale',
      colSpan: 1,
    },
  },
  bodyweightWide: {
    component: BodyweightWideWidget,
    meta: {
      type: 'bodyweightWide',
      group: 'bodyweight',
      nameKey: 'widgets.names.bodyweight',
      icon: 'scale',
      colSpan: 2,
    },
  },
  muscleVolumeFull: {
    component: MuscleVolumeFullWidget,
    meta: {
      type: 'muscleVolumeFull',
      group: 'muscleVolume',
      nameKey: 'widgets.names.muscleVolume',
      icon: 'dumbbell',
      colSpan: 3,
    },
  },
};

// Picker gallery ordering: one card per family, variants in size order.
export const widgetGroups: Array<{
  group: WidgetGroup;
  variants: WidgetType[];
}> = [
  { group: 'tonnage', variants: ['tonnageCompact', 'tonnageWide'] },
  { group: 'e1rm', variants: ['e1rmCompact', 'e1rmWide'] },
  { group: 'adherence', variants: ['adherenceWide', 'adherenceFull'] },
  { group: 'bodyweight', variants: ['bodyweightCompact', 'bodyweightWide'] },
  { group: 'muscleVolume', variants: ['muscleVolumeFull'] },
];
