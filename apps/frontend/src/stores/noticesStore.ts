import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'notices-storage' });

const DISMISSED_KEY = 'dismissed_notices';

/**
 * So viele weggewischte Hinweise werden behalten.
 *
 * Der Schlüssel eines Verdachts trägt sein Startdatum und kann deshalb nie
 * wieder auftreten, sobald er aus dem Erkennungsfenster gelaufen ist. Ohne
 * Deckel wüchse die Liste trotzdem für immer weiter; mit ihm bleibt sie um
 * Größenordnungen länger als das Fenster und damit folgenlos.
 */
const MAX_REMEMBERED = 100;

function read(): string[] {
  const stored = storage.getString(DISMISSED_KEY);
  if (stored === undefined) return [];
  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

/** Schreibt und gibt zurück, was gespeichert wurde — die Reihenfolge zählt. */
function persist(ids: readonly string[]): Set<string> {
  const kept = ids.slice(-MAX_REMEMBERED);
  storage.set(DISMISSED_KEY, JSON.stringify(kept));
  return new Set(kept);
}

type NoticesState = {
  /** Die Schlüssel der weggewischten Hinweise. */
  dismissed: ReadonlySet<string>;
  dismiss: (id: string) => void;
  /**
   * Nimmt ein Wegwischen zurück.
   *
   * Gebraucht, sobald ein Hinweis beantwortet statt weggewischt wird: Wer eine
   * Krankheit markiert und die Markierung später löscht, soll den Verdacht
   * wiedersehen — sonst hätte er sich die Meldung durch einen Fehlgriff
   * dauerhaft abgeschaltet.
   */
  restore: (id: string) => void;
};

export const useNoticesStore = create<NoticesState>((set, get) => ({
  dismissed: new Set(read()),
  dismiss: id => {
    if (get().dismissed.has(id)) return;
    set({ dismissed: persist([...get().dismissed, id]) });
  },
  restore: id => {
    if (!get().dismissed.has(id)) return;
    set({
      dismissed: persist([...get().dismissed].filter(entry => entry !== id)),
    });
  },
}));
