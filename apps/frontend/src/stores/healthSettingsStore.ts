import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';

import { MODEL_IDS, type ModelId } from '@/lib/health/algorithms/models';
import {
  DEFAULT_SCALE,
  DEFAULT_THRESHOLDS,
  normalizeScale,
  normalizeThresholds,
  setThreshold as applyThreshold,
  type ScoreThresholds,
  type ThresholdLabel,
} from '@/lib/health/algorithms/scoreScale';

const storage = createMMKV({ id: 'health-settings-storage' });

const MODEL_KEY = 'estimator_model';
const CONNECTED_KEY = 'source_connected';
const LAST_SYNC_KEY = 'last_synced_at';
const SCALE_KEY = 'score_scale';
const THRESHOLDS_KEY = 'score_thresholds';

function isModelId(value: string): value is ModelId {
  return (MODEL_IDS as readonly string[]).includes(value);
}

function readThresholds(): ScoreThresholds {
  const stored = storage.getString(THRESHOLDS_KEY);
  if (stored === undefined) return DEFAULT_THRESHOLDS;
  try {
    return normalizeThresholds(JSON.parse(stored));
  } catch {
    return DEFAULT_THRESHOLDS;
  }
}

type HealthSettingsState = {
  /**
   * Ob eine Quelle verbunden ist.
   *
   * Persistiert und synchron, weil die Tab-Leiste davon abhängt: Ein
   * asynchroner Zustand ließe den Erholungs-Tab bei jedem Start kurz
   * auftauchen oder verschwinden.
   */
  sourceConnected: boolean;
  setSourceConnected: (connected: boolean) => void;
  /**
   * Das gewählte Schätzmodell. Vorgabe ist `rec` — HRV-geführt, wie im
   * Handoff.
   */
  modelId: ModelId;
  setModelId: (modelId: ModelId) => void;
  /**
   * Wann zuletzt erfolgreich geladen wurde, als Epoch-Millisekunden.
   *
   * Persistiert, weil die Frage „sind das noch die Daten von gestern?" einen
   * Neustart überlebt. Bewusst getrennt vom Stichtag der Auswertung: Der sagt,
   * wie alt die **Messung** ist, dieser Wert, wann zuletzt **nachgesehen**
   * wurde. Eine Nacht ohne getragene Uhr macht beides zu verschiedenen Zahlen.
   */
  lastSyncedAt: number | null;
  setLastSyncedAt: (at: number) => void;
  /**
   * Punkte je σ Abweichung und die Wortgrenzen darüber.
   *
   * Beides ist Anzeige, nicht Messung: Der Score bleibt derselbe Vergleich mit
   * der eigenen Baseline, nur seine Auflösung und seine Beschriftung sind
   * Geschmackssache. Deshalb hier und nicht in den Estimator-Parametern, die
   * das Verfahren selbst betreffen.
   */
  scale: number;
  setScale: (scale: number) => void;
  thresholds: ScoreThresholds;
  setThreshold: (label: ThresholdLabel, value: number) => void;
  resetScoreScale: () => void;
};

export const useHealthSettingsStore = create<HealthSettingsState>(
  (set, get) => {
    const stored = storage.getString(MODEL_KEY);

    const writeThresholds = (thresholds: ScoreThresholds) => {
      storage.set(THRESHOLDS_KEY, JSON.stringify(thresholds));
      set({ thresholds });
    };

    return {
      modelId: stored !== undefined && isModelId(stored) ? stored : 'rec',
      sourceConnected: storage.getBoolean(CONNECTED_KEY) ?? false,
      lastSyncedAt: storage.getNumber(LAST_SYNC_KEY) ?? null,
      scale: normalizeScale(storage.getNumber(SCALE_KEY)),
      thresholds: readThresholds(),
      setScale: scale => {
        const next = normalizeScale(scale);
        storage.set(SCALE_KEY, next);
        set({ scale: next });
      },
      setThreshold: (label, value) => {
        writeThresholds(applyThreshold(get().thresholds, label, value));
      },
      resetScoreScale: () => {
        storage.set(SCALE_KEY, DEFAULT_SCALE);
        set({ scale: DEFAULT_SCALE });
        writeThresholds(DEFAULT_THRESHOLDS);
      },
      setLastSyncedAt: lastSyncedAt => {
        storage.set(LAST_SYNC_KEY, lastSyncedAt);
        set({ lastSyncedAt });
      },
      setSourceConnected: sourceConnected => {
        storage.set(CONNECTED_KEY, sourceConnected);
        set({ sourceConnected });
      },
      setModelId: modelId => {
        storage.set(MODEL_KEY, modelId);
        set({ modelId });
      },
    };
  },
);
