import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import { randomUUID } from 'expo-crypto';
import type { WidgetPlacement, WidgetType } from '@/types/widget';
import { widgetRegistry } from '@/components/widgets/registry';
import {
  packPlacements,
  removeLeadingEmptyRows,
} from '@/components/widgets/grid/widgetGridModel';

const storage = createMMKV({ id: 'homescreen-storage' });

const LAYOUT_KEY = 'widget_layout';

const DEFAULT_LAYOUT = packPlacements([
  { id: 'default-recovery', type: 'recoveryFull', colSpan: 3 },
  { id: 'default-lastSession', type: 'lastSessionFull', colSpan: 3 },
  { id: 'default-streak', type: 'streakWide', colSpan: 2 },
  {
    id: 'default-weeklyVolume',
    type: 'weeklyVolumeCompact',
    colSpan: 1,
  },
  { id: 'default-trend', type: 'trendFull', colSpan: 3 },
]);

type LegacyWidgetType =
  | 'recovery'
  | 'nextWorkout'
  | 'streak'
  | 'schedule'
  | 'time'
  | 'weeklyVolume'
  | 'chart';

type StoredWidgetPlacement = {
  id: string;
  type: string;
  colSpan: number;
  row?: number;
  column?: number;
};

function migrateType(type: string, colSpan: number): WidgetType | null {
  if (type in widgetRegistry) return type as WidgetType;
  const legacyVariants: Record<LegacyWidgetType, WidgetType> = {
    recovery: 'recoveryFull',
    nextWorkout: 'lastSessionFull',
    streak: colSpan === 1 ? 'streakCompact' : 'streakWide',
    schedule: colSpan === 3 ? 'scheduleFull' : 'scheduleWide',
    time: 'timeCompact',
    weeklyVolume: 'weeklyVolumeCompact',
    chart: colSpan === 2 ? 'trendWide' : 'trendFull',
  };
  return legacyVariants[type as LegacyWidgetType] ?? null;
}

function normalizeLayout(layout: StoredWidgetPlacement[]): WidgetPlacement[] {
  const normalized = layout.flatMap(item => {
    const type = migrateType(item.type, item.colSpan);
    return type
      ? [{ ...item, type, colSpan: widgetRegistry[type].meta.colSpan }]
      : [];
  });
  const hasCompleteGrid = normalized.every(
    item => Number.isInteger(item.row) && Number.isInteger(item.column),
  );
  if (!hasCompleteGrid) {
    return packPlacements(
      normalized.map(({ row: _row, column: _column, ...item }) => item),
    );
  }
  const positioned = normalized.map(item => ({
    ...item,
    row: Math.max(0, item.row!),
    column: Math.max(0, Math.min(3 - item.colSpan, item.column!)),
  }));
  const maxRow = positioned.reduce((max, item) => Math.max(max, item.row), 0);

  // Repair layouts affected by the edge-scroll bug that could create an
  // unbounded trail of empty rows. Normal user-created gaps remain untouched.
  if (maxRow >= positioned.length) {
    return packPlacements(
      [...positioned]
        .sort((a, b) => a.row - b.row || a.column - b.column)
        .map(({ row: _row, column: _column, ...item }) => item),
    );
  }
  return removeLeadingEmptyRows(positioned);
}

function persist(layout: WidgetPlacement[]) {
  storage.set(LAYOUT_KEY, JSON.stringify(layout));
}

type HomescreenState = {
  layout: WidgetPlacement[];
  initialize: () => void;
  setLayout: (layout: WidgetPlacement[]) => void;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  resetToDefault: () => void;
};

export const useHomescreenStore = create<HomescreenState>((set, get) => ({
  layout: DEFAULT_LAYOUT,

  initialize: () => {
    const stored = storage.getString(LAYOUT_KEY);
    if (!stored) {
      set({ layout: DEFAULT_LAYOUT });
      return;
    }
    try {
      const parsed = JSON.parse(stored) as StoredWidgetPlacement[];
      const layout = normalizeLayout(parsed);
      persist(layout);
      set({ layout });
    } catch {
      persist(DEFAULT_LAYOUT);
      set({ layout: DEFAULT_LAYOUT });
    }
  },

  setLayout: (layout: WidgetPlacement[]) => {
    persist(layout);
    set({ layout });
  },

  addWidget: (type: WidgetType) => {
    const meta = widgetRegistry[type].meta;
    const layout = [
      ...get().layout,
      {
        id: randomUUID(),
        type,
        colSpan: meta.colSpan,
        row: get().layout.reduce(
          (max, widget) => Math.max(max, widget.row + 1),
          0,
        ),
        column: 0,
      },
    ];
    persist(layout);
    set({ layout });
  },

  removeWidget: (id: string) => {
    const layout = get().layout.filter(w => w.id !== id);
    persist(layout);
    set({ layout });
  },

  resetToDefault: () => {
    persist(DEFAULT_LAYOUT);
    set({ layout: DEFAULT_LAYOUT });
  },
}));
