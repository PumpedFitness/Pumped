import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import { randomUUID } from 'expo-crypto';

// A user-authored computed field: a named formula over the fixed training-metric
// vocabulary (see `screens/home/computedFieldEvaluator`). Persisted per user so
// the dashboard can render the module across launches. Production supports many.
export type ComputedField = {
  id: string;
  name: string;
  /** Flat token list, e.g. ['Σ', 'sets', '×', 'reps', '×', 'load']. */
  tokens: string[];
  /** Display unit, e.g. 't' · 'kg' · '%'. May be empty. */
  unit: string;
};

const storage = createMMKV({ id: 'computed-fields-storage' });
const FIELDS_KEY = 'computed_fields';

function load(): ComputedField[] {
  const raw = storage.getString(FIELDS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ComputedField[]) : [];
  } catch {
    return [];
  }
}

function persist(fields: ComputedField[]) {
  storage.set(FIELDS_KEY, JSON.stringify(fields));
}

type ComputedFieldsState = {
  fields: ComputedField[];
  addField: (input: Omit<ComputedField, 'id'>) => ComputedField;
  removeField: (id: string) => void;
};

export const useComputedFieldsStore = create<ComputedFieldsState>((set, get) => ({
  fields: load(),

  addField: (input: Omit<ComputedField, 'id'>) => {
    const field: ComputedField = { id: randomUUID(), ...input };
    const fields = [...get().fields, field];
    persist(fields);
    set({ fields });
    return field;
  },

  removeField: (id: string) => {
    const fields = get().fields.filter(field => field.id !== id);
    persist(fields);
    set({ fields });
  },
}));
