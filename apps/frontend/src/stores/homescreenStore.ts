import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import { randomUUID } from 'expo-crypto';
import type { WidgetPlacement, WidgetType } from '@/types/widget';
import { widgetRegistry } from '@/components/widgets/registry';
import {
  packPlacements,
  removeLeadingEmptyRows,
} from '@/components/widgets/grid/widgetGridModel';
import {
  DEFAULT_QUICK_ACTIONS,
  isQuickActionKey,
  type QuickActionKey,
} from '@/components/widgets/quick-actions/quickActionRegistry';

const storage = createMMKV({ id: 'homescreen-storage' });

const LAYOUT_KEY = 'widget_layout';
const QUICK_ACTIONS_KEY = 'quick_actions';
const HERO_SEEDED_KEY = 'hero_widgets_seeded';
const NOTIFICATIONS_SEEDED_KEY = 'notifications_widget_seeded';

// The two widgets that replaced the home screen's fixed chrome, top of the
// grid and in the order they used to appear on screen.
const HERO_WIDGETS: WidgetType[] = ['todaySession', 'quickActions'];

const DEFAULT_LAYOUT = packPlacements([
  { id: 'default-today', type: 'todaySession', colSpan: 3 },
  { id: 'default-quickActions', type: 'quickActions', colSpan: 3 },
  { id: 'default-notifications', type: 'notifications', colSpan: 3 },
  { id: 'default-tonnage', type: 'tonnageCompact', colSpan: 1 },
  { id: 'default-e1rm', type: 'e1rmCompact', colSpan: 1 },
  { id: 'default-bodyweight', type: 'bodyweightCompact', colSpan: 1 },
  { id: 'default-adherence', type: 'adherenceFull', colSpan: 3 },
  { id: 'default-muscleVolume', type: 'muscleVolumeFull', colSpan: 3 },
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
    recovery: 'adherenceFull',
    nextWorkout: 'tonnageWide',
    streak: 'adherenceWide',
    schedule: 'adherenceFull',
    time: 'tonnageCompact',
    weeklyVolume: colSpan === 1 ? 'tonnageCompact' : 'tonnageWide',
    chart: colSpan === 2 ? 'e1rmWide' : 'muscleVolumeFull',
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

/**
 * Puts the session and quick-action widgets on top of a layout that predates
 * them — exactly once.
 *
 * They replaced fixed chrome above the grid, so an existing home would
 * otherwise come back with no way to start a workout at all. The flag is what
 * keeps these from being undeletable: remove one and it stays removed, because
 * the seed has already run.
 */
function seedHeroWidgets(layout: WidgetPlacement[]): WidgetPlacement[] {
  if (storage.getBoolean(HERO_SEEDED_KEY)) return layout;
  storage.set(HERO_SEEDED_KEY, true);
  const missing = HERO_WIDGETS.filter(
    type => !layout.some(widget => widget.type === type),
  );
  if (missing.length === 0) return layout;
  // Shifted rather than re-packed: the existing arrangement is the user's, and
  // repacking it would silently close every gap they left in it.
  return [
    ...missing.map((type, index) => ({
      id: `seeded-${type}`,
      type,
      colSpan: 3,
      row: index,
      column: 0,
    })),
    ...layout.map(widget => ({ ...widget, row: widget.row + missing.length })),
  ];
}

/**
 * Puts the notifications widget below the hero widgets — exactly once.
 *
 * Seeded rather than left to the picker because a card nobody has added can
 * never tell anybody anything: the whole point is that it speaks up unasked.
 * Below the hero widgets, not above — it comments on the day, but it must not
 * push the button that starts the workout off the first screen.
 *
 * Same one-shot flag discipline as the hero seed: remove the widget and it
 * stays removed.
 */
function seedNotifications(layout: WidgetPlacement[]): WidgetPlacement[] {
  if (storage.getBoolean(NOTIFICATIONS_SEEDED_KEY)) return layout;
  storage.set(NOTIFICATIONS_SEEDED_KEY, true);
  if (layout.some(widget => widget.type === 'notifications')) return layout;

  const belowHeroes = layout
    .filter(widget => HERO_WIDGETS.includes(widget.type))
    .reduce((max, widget) => Math.max(max, widget.row + 1), 0);

  // Shifted, not re-packed — the arrangement below is the user's.
  return [
    {
      id: 'seeded-notifications',
      type: 'notifications' as WidgetType,
      colSpan: 3,
      row: belowHeroes,
      column: 0,
    },
    ...layout.map(widget =>
      widget.row >= belowHeroes ? { ...widget, row: widget.row + 1 } : widget,
    ),
  ];
}

function persist(layout: WidgetPlacement[]) {
  storage.set(LAYOUT_KEY, JSON.stringify(layout));
}

function persistQuickActions(keys: QuickActionKey[]) {
  storage.set(QUICK_ACTIONS_KEY, JSON.stringify(keys));
}

/**
 * Stored keys are filtered against the live catalog and de-duplicated, so a
 * retired action just disappears instead of crashing the row. An empty result
 * is a legitimate user choice (hide the row entirely) and is preserved — only
 * a missing/corrupt entry falls back to the defaults.
 */
function readQuickActions(): QuickActionKey[] {
  const stored = storage.getString(QUICK_ACTIONS_KEY);
  if (!stored) return DEFAULT_QUICK_ACTIONS;
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return DEFAULT_QUICK_ACTIONS;
    return [
      ...new Set(
        parsed.filter((k): k is QuickActionKey => isQuickActionKey(k)),
      ),
    ];
  } catch {
    return DEFAULT_QUICK_ACTIONS;
  }
}

type HomescreenState = {
  layout: WidgetPlacement[];
  quickActions: QuickActionKey[];
  initialize: () => void;
  setLayout: (layout: WidgetPlacement[]) => void;
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  addQuickAction: (key: QuickActionKey) => void;
  removeQuickAction: (key: QuickActionKey) => void;
  resetToDefault: () => void;
};

export const useHomescreenStore = create<HomescreenState>((set, get) => ({
  layout: DEFAULT_LAYOUT,
  quickActions: DEFAULT_QUICK_ACTIONS,

  initialize: () => {
    set({ quickActions: readQuickActions() });
    // Every path that lands on DEFAULT_LAYOUT already contains both hero
    // widgets, so the seed is spent there too — otherwise it would fire on the
    // next launch and duplicate them.
    const applyDefaults = () => {
      storage.set(HERO_SEEDED_KEY, true);
      storage.set(NOTIFICATIONS_SEEDED_KEY, true);
      set({ layout: DEFAULT_LAYOUT });
    };
    const stored = storage.getString(LAYOUT_KEY);
    if (!stored) {
      applyDefaults();
      return;
    }
    try {
      const parsed = JSON.parse(stored) as StoredWidgetPlacement[];
      const normalized = normalizeLayout(parsed);
      // A layout whose widgets all belonged to a removed catalog collapses to
      // nothing — fall back to the defaults instead of an empty home.
      if (normalized.length === 0) {
        persist(DEFAULT_LAYOUT);
        applyDefaults();
        return;
      }
      const layout = seedNotifications(seedHeroWidgets(normalized));
      persist(layout);
      set({ layout });
    } catch {
      persist(DEFAULT_LAYOUT);
      applyDefaults();
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

  addQuickAction: (key: QuickActionKey) => {
    if (get().quickActions.includes(key)) return;
    const quickActions = [...get().quickActions, key];
    persistQuickActions(quickActions);
    set({ quickActions });
  },

  removeQuickAction: (key: QuickActionKey) => {
    const quickActions = get().quickActions.filter(k => k !== key);
    persistQuickActions(quickActions);
    set({ quickActions });
  },

  resetToDefault: () => {
    storage.set(HERO_SEEDED_KEY, true);
    storage.set(NOTIFICATIONS_SEEDED_KEY, true);
    persist(DEFAULT_LAYOUT);
    persistQuickActions(DEFAULT_QUICK_ACTIONS);
    set({ layout: DEFAULT_LAYOUT, quickActions: DEFAULT_QUICK_ACTIONS });
  },
}));
