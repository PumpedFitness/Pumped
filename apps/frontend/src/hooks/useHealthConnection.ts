import { useCallback, useEffect, useMemo, useState } from 'react';

import { healthSources } from '@/data/local/health/source';
import { syncHealthData } from '@/data/local/health/syncService';
import { AuthError } from '@/lib/health/sources/errors';
import type { SourceId, SourceState } from '@/lib/health/sources/types';
import { useHealthSettingsStore } from '@/stores/healthSettingsStore';

/** Eine Quelle, so weit die Oberfläche sie kennen muss. */
export type HealthSourceEntry = {
  readonly id: SourceId;
  readonly name: string;
  readonly detail: string;
  /** `null`, solange der Zustand noch geladen wird. */
  readonly state: SourceState | null;
  readonly isActive: boolean;
  /**
   * Ob die vorhandene Historie dieser Quelle gehört.
   *
   * `false` heißt: Ein Wechsel hierher räumt die Rohschicht. Die Warnung gehört
   * vor die Anmeldung, nicht danach.
   */
  readonly ownsHistory: boolean;
};

export type HealthConnection = {
  readonly state: SourceState | null;
  readonly isConnected: boolean;
  readonly isBusy: boolean;
  /** Was gerade geladen wird, für die Statuszeile. */
  readonly progressLabel: string | null;
  /** Klartext für die UI. `null`, solange nichts schiefging. */
  readonly error: string | null;
  /** Anmeldung abgelaufen — hier hilft nur ein erneutes Verbinden. */
  readonly needsReauth: boolean;
  readonly sourceName: string;
  /** Alle Quellen der App, in Anzeigereihenfolge. */
  readonly sources: readonly HealthSourceEntry[];
  /** Epoch-Millisekunden des letzten erfolgreichen Ladens, `null` wenn nie. */
  readonly lastSyncedAt: number | null;
  readonly connect: () => Promise<boolean>;
  /** Wie `connect`, aber für eine andere als die aktive Quelle. */
  readonly connectSource: (id: SourceId) => Promise<boolean>;
  readonly disconnect: () => Promise<void>;
  readonly sync: () => Promise<boolean>;
};

/**
 * Verbindung zur aktiven Gesundheitsquelle.
 *
 * `connect` meldet an **und** holt gleich die Historie: Ein Consent, nach dem
 * der Screen leer bleibt, sieht aus wie ein Fehlschlag. `disconnect` trennt nur
 * die Verbindung — die Rohdaten bleiben, damit ein versehentliches Trennen nicht
 * die Historie kostet. Geräumt wird erst beim Wechsel auf eine andere Quelle,
 * und das besorgt die Registry beim `activate`.
 */
/**
 * Der Zustand **aller** Quellen auf einmal.
 *
 * Die Einstellungen zeigen jede Quelle mit ihrer eigenen Zeile, und eine, die es
 * auf diesem Gerät nicht gibt, soll ihren Grund nennen können statt bloß
 * ausgegraut dazustehen. Eine Quelle, deren Abfrage scheitert, gilt als getrennt
 * — sie darf die anderen nicht mitreißen.
 */
function readAllStates(): Promise<ReadonlyMap<SourceId, SourceState>> {
  return Promise.all(
    healthSources.all.map(entry =>
      entry
        .getState()
        .catch((): SourceState => ({ kind: 'disconnected' }))
        .then(next => [entry.descriptor.id, next] as const),
    ),
  ).then(entries => new Map(entries));
}

function describeSources(
  states: ReadonlyMap<SourceId, SourceState>,
  activeId: SourceId,
): HealthSourceEntry[] {
  return healthSources.all.map(entry => ({
    id: entry.descriptor.id,
    name: entry.descriptor.name,
    detail: entry.descriptor.detail,
    state: states.get(entry.descriptor.id) ?? null,
    isActive: entry.descriptor.id === activeId,
    ownsHistory: healthSources.owns(entry),
  }));
}

export function useHealthConnection(): HealthConnection {
  const setSourceConnected = useHealthSettingsStore(
    store => store.setSourceConnected,
  );
  const lastSyncedAt = useHealthSettingsStore(store => store.lastSyncedAt);
  const setLastSyncedAt = useHealthSettingsStore(
    store => store.setLastSyncedAt,
  );

  const [activeId, setActiveId] = useState<SourceId>(
    healthSources.active.descriptor.id,
  );
  const [states, setStates] = useState<ReadonlyMap<SourceId, SourceState>>(
    new Map(),
  );
  const [isBusy, setBusy] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);

  const source =
    healthSources.all.find(entry => entry.descriptor.id === activeId) ??
    healthSources.active;
  const state = states.get(activeId) ?? null;

  useEffect(() => {
    let active = true;

    void readAllStates().then(next => {
      if (!active) return;
      setStates(next);
      setSourceConnected(next.get(activeId)?.kind === 'connected');
    });

    return () => {
      active = false;
    };
  }, [activeId, setSourceConnected]);

  const runSync = useCallback(async (): Promise<boolean> => {
    const result = await syncHealthData({
      source,
      onProgress: progress => setProgressLabel(progress.label),
    });
    setProgressLabel(null);

    if (result.needsReauth) {
      setNeedsReauth(true);
      setError(result.abortedBy);
      setStates(current =>
        new Map(current).set(source.descriptor.id, { kind: 'disconnected' }),
      );
      setSourceConnected(false);
      return false;
    }

    const failed = result.outcomes.filter(
      outcome => outcome.status === 'failed',
    );
    // Ein Teilausfall ist kein Fehlschlag: Die übrigen Metriken sind da, und
    // der Score rechnet mit weniger Termen weiter. Sichtbar bleibt es trotzdem.
    setError(failed.length === 0 ? null : failed[0].error);
    // Auch nach einem Teilausfall: Es **wurde** nachgesehen, und genau das sagt
    // die Zeile im Kopf aus. Nur der Abbruch mangels Anmeldung zählt nicht.
    setLastSyncedAt(Date.now());
    return true;
  }, [setLastSyncedAt, setSourceConnected, source]);

  const connectSource = useCallback(
    async (id: SourceId): Promise<boolean> => {
      const target = healthSources.all.find(
        entry => entry.descriptor.id === id,
      );
      if (target === undefined) return false;

      setBusy(true);
      setError(null);
      setNeedsReauth(false);
      try {
        await target.connect();
        // Erst **nach** der Anmeldung: `activate` räumt die Rohschicht, wenn sie
        // einer anderen Quelle gehört. Wer vorher räumt und dann am Consent
        // scheitert, steht ohne Daten und ohne Verbindung da.
        await healthSources.activate(target);
        setActiveId(id);
        setStates(current => new Map(current).set(id, { kind: 'connected' }));
        setSourceConnected(true);
        await syncHealthData({
          source: target,
          onProgress: progress => setProgressLabel(progress.label),
        });
        setLastSyncedAt(Date.now());
        return true;
      } catch (caught) {
        // Ein Abbruch ist keine Störung — der Nutzer hat sich entschieden.
        if (caught instanceof AuthError && caught.kind === 'cancelled') {
          return false;
        }
        setError(caught instanceof Error ? caught.message : String(caught));
        return false;
      } finally {
        setBusy(false);
        setProgressLabel(null);
      }
    },
    [setLastSyncedAt, setSourceConnected],
  );

  const connect = useCallback(
    () => connectSource(activeId),
    [connectSource, activeId],
  );

  const disconnect = useCallback(async () => {
    setBusy(true);
    try {
      await source.disconnect();
      setStates(current =>
        new Map(current).set(source.descriptor.id, { kind: 'disconnected' }),
      );
      setSourceConnected(false);
      setError(null);
      setNeedsReauth(false);
    } finally {
      setBusy(false);
    }
  }, [setSourceConnected, source]);

  const sync = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    try {
      return await runSync();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      return false;
    } finally {
      setBusy(false);
      setProgressLabel(null);
    }
  }, [runSync]);

  const sources = useMemo(
    () => describeSources(states, activeId),
    [activeId, states],
  );

  return {
    state,
    isConnected: state?.kind === 'connected',
    isBusy,
    progressLabel,
    error,
    needsReauth,
    sourceName: source.descriptor.name,
    sources,
    lastSyncedAt,
    connect,
    connectSource,
    disconnect,
    sync,
  };
}
