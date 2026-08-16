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
import { TodaySessionWidget } from './today/TodaySessionWidget';
import { QuickActionsWidget } from './quick-actions/QuickActionsWidget';
import { NotificationsWidget } from './notifications/NotificationsWidget';

type WidgetComponentProps = {
  colSpan: number;
  width: number;
  /** The grid's edit mode — widgets with their own edit affordances read it. */
  editing: boolean;
};

type WidgetRegistryEntry = {
  component: ComponentType<WidgetComponentProps>;
  meta: WidgetMeta;
};

export const widgetRegistry: Record<WidgetType, WidgetRegistryEntry> = {
  todaySession: {
    component: TodaySessionWidget,
    meta: {
      type: 'todaySession',
      group: 'todaySession',
      nameKey: 'widgets.names.todaySession',
      icon: 'play',
      colSpan: 3,
      estimatedHeight: 340,
    },
  },
  quickActions: {
    component: QuickActionsWidget,
    meta: {
      type: 'quickActions',
      group: 'quickActions',
      nameKey: 'widgets.names.quickActions',
      icon: 'bolt',
      colSpan: 3,
      estimatedHeight: 92,
    },
  },
  notifications: {
    component: NotificationsWidget,
    meta: {
      type: 'notifications',
      group: 'notifications',
      nameKey: 'widgets.names.notifications',
      icon: 'warning',
      colSpan: 3,
      estimatedHeight: 120,
    },
  },
  tonnageCompact: {
    component: TonnageCompactWidget,
    meta: {
      type: 'tonnageCompact',
      group: 'tonnage',
      nameKey: 'widgets.names.tonnage',
      icon: 'trend',
      colSpan: 1,
      estimatedHeight: 96,
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
      estimatedHeight: 118,
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
      estimatedHeight: 96,
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
      estimatedHeight: 118,
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
      estimatedHeight: 132,
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
      estimatedHeight: 172,
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
      estimatedHeight: 96,
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
      estimatedHeight: 118,
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
      estimatedHeight: 200,
    },
  },
};

// Picker gallery ordering: one card per family, variants in size order.
export const widgetGroups: Array<{
  group: WidgetGroup;
  variants: WidgetType[];
}> = [
  { group: 'todaySession', variants: ['todaySession'] },
  { group: 'quickActions', variants: ['quickActions'] },
  { group: 'notifications', variants: ['notifications'] },
  { group: 'tonnage', variants: ['tonnageCompact', 'tonnageWide'] },
  { group: 'e1rm', variants: ['e1rmCompact', 'e1rmWide'] },
  { group: 'adherence', variants: ['adherenceWide', 'adherenceFull'] },
  { group: 'bodyweight', variants: ['bodyweightCompact', 'bodyweightWide'] },
  { group: 'muscleVolume', variants: ['muscleVolumeFull'] },
];
