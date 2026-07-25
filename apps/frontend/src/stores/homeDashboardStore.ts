import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import {
  DEFAULT_MODULES,
  type ModuleKind,
  type ModulePlacement,
} from '@/screens/home/dashboardModules';

// Persists the v2 dashboard canvas: which modules are shown, their order and
// per-module column span. Mirrors `homescreenStore`'s zustand + MMKV pattern;
// the computed-field *definitions* live in `computedFieldsStore` — here we only
// track their placement on the canvas.
const storage = createMMKV({ id: 'home-dashboard-storage' });
const LAYOUT_KEY = 'module_layout';

function load(): ModulePlacement[] {
  const raw = storage.getString(LAYOUT_KEY);
  if (!raw) return DEFAULT_MODULES;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.length > 0
      ? (parsed as ModulePlacement[])
      : DEFAULT_MODULES;
  } catch {
    return DEFAULT_MODULES;
  }
}

function persist(modules: ModulePlacement[]) {
  storage.set(LAYOUT_KEY, JSON.stringify(modules));
}

type HomeDashboardState = {
  modules: ModulePlacement[];
  setModules: (modules: ModulePlacement[]) => void;
  addModule: (kind: ModuleKind, id: string, span: 1 | 2) => void;
  removeModule: (id: string) => void;
  toggleSpan: (id: string) => void;
  reorderByIds: (orderedIds: string[]) => void;
};

export const useHomeDashboardStore = create<HomeDashboardState>((set, get) => ({
  modules: load(),

  setModules: (modules: ModulePlacement[]) => {
    persist(modules);
    set({ modules });
  },

  addModule: (kind: ModuleKind, id: string, span: 1 | 2) => {
    if (get().modules.some(module => module.id === id)) return;
    const modules = [...get().modules, { id, kind, span }];
    persist(modules);
    set({ modules });
  },

  removeModule: (id: string) => {
    const modules = get().modules.filter(module => module.id !== id);
    persist(modules);
    set({ modules });
  },

  toggleSpan: (id: string) => {
    const modules = get().modules.map(module =>
      module.id === id
        ? { ...module, span: (module.span === 1 ? 2 : 1) as 1 | 2 }
        : module,
    );
    persist(modules);
    set({ modules });
  },

  reorderByIds: (orderedIds: string[]) => {
    const current = get().modules;
    const byId = new Map(current.map(module => [module.id, module]));
    const modules = orderedIds
      .map(id => byId.get(id))
      .filter((module): module is ModulePlacement => module !== undefined);
    // Safety net: keep any module not present in the ordered list.
    for (const module of current) {
      if (!orderedIds.includes(module.id)) modules.push(module);
    }
    persist(modules);
    set({ modules });
  },
}));
