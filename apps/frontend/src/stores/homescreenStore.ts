import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import { randomUUID } from 'expo-crypto';
import type { WidgetPlacement, WidgetType } from '@/types/widget';
import { widgetRegistry } from '@/components/widgets/registry';

const storage = createMMKV({ id: 'homescreen-storage' });

const LAYOUT_KEY = 'widget_layout';

const DEFAULT_LAYOUT: WidgetPlacement[] = [
  { id: 'default-recovery', type: 'recovery', colSpan: 3 },
  { id: 'default-nextWorkout', type: 'nextWorkout', colSpan: 3 },
  { id: 'default-streak', type: 'streak', colSpan: 2 },
  { id: 'default-weeklyVolume', type: 'weeklyVolume', colSpan: 1 },
  { id: 'default-chart', type: 'chart', colSpan: 3 },
];

function normalizeLayout(layout: WidgetPlacement[]): WidgetPlacement[] {
  return layout
    .filter(item => item.type in widgetRegistry)
    .map(item => ({
      ...item,
      colSpan: widgetRegistry[item.type].meta.defaultSpan,
    }));
}

function persist(layout: WidgetPlacement[]) {
  storage.set(LAYOUT_KEY, JSON.stringify(layout));
}

type HomescreenState = {
  layout: WidgetPlacement[];
  initialize: () => void;
  setLayout: (layout: WidgetPlacement[]) => void;
  addWidget: (type: WidgetType, colSpan: number) => void;
  removeWidget: (id: string) => void;
  moveWidget: (fromIndex: number, toIndex: number) => void;
  reorderByIds: (orderedIds: string[]) => void;
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
      const parsed = JSON.parse(stored) as WidgetPlacement[];
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

  addWidget: (type: WidgetType, _colSpan: number) => {
    const fixedSpan = widgetRegistry[type].meta.defaultSpan;
    const layout = [
      ...get().layout,
      { id: randomUUID(), type, colSpan: fixedSpan },
    ];
    persist(layout);
    set({ layout });
  },

  removeWidget: (id: string) => {
    const layout = get().layout.filter(w => w.id !== id);
    persist(layout);
    set({ layout });
  },

  moveWidget: (fromIndex: number, toIndex: number) => {
    const layout = [...get().layout];
    const [moved] = layout.splice(fromIndex, 1);
    layout.splice(toIndex, 0, moved);
    persist(layout);
    set({ layout });
  },

  reorderByIds: (orderedIds: string[]) => {
    const current = get().layout;
    const byId = new Map(current.map(w => [w.id, w]));
    const layout = orderedIds
      .map(id => byId.get(id))
      .filter((w): w is WidgetPlacement => w !== undefined);
    // Append any items not in orderedIds (safety net)
    for (const w of current) {
      if (!orderedIds.includes(w.id)) layout.push(w);
    }
    persist(layout);
    set({ layout });
  },

  resetToDefault: () => {
    persist(DEFAULT_LAYOUT);
    set({ layout: DEFAULT_LAYOUT });
  },
}));
