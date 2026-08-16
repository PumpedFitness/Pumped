import { useCallback, useEffect, useState } from 'react';

import { healthSources } from '@/data/local/health/source';
import { syncHealthData } from '@/data/local/health/syncService';
import { AuthError } from '@/lib/health/sources/google/oauth';
import type { SourceState } from '@/lib/health/sources/types';
import { useHealthSettingsStore } from '@/stores/healthSettingsStore';

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
  /** Epoch-Millisekunden des letzten erfolgreichen Ladens, `null` wenn nie. */
  readonly lastSyncedAt: number | null;
  readonly connect: () => Promise<boolean>;
  readonly disconnect: () => Promise<void>;
  readonly sync: () => Promise<boolean>;
};

/**
 * Verbindung zur aktiven Gesundheitsquelle.
 *
 * `connect` meldet an **und** holt gleich die Historie: Ein Consent, nach dem
 * der Screen leer bleibt, sieht aus wie ein Fehlschlag. `disconnect` löscht nur
 * die Token — die Rohdaten bleiben, damit ein versehentliches Trennen nicht
 * die Historie kostet. Geräumt wird erst beim Wechsel auf eine andere Quelle.
 */
export function useHealthConnection(): HealthConnection {
  const source = healthSources.active;
  const setSourceConnected = useHealthSettingsStore(
    store => store.setSourceConnected,
  );
  const lastSyncedAt = useHealthSettingsStore(store => store.lastSyncedAt);
  const setLastSyncedAt = useHealthSettingsStore(
    store => store.setLastSyncedAt,
  );
  const [state, setState] = useState<SourceState | null>(null);
  const [isBusy, setBusy] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);

  useEffect(() => {
    let active = true;
    source
      .getState()
      .then(next => {
        if (active) {
          setState(next);
          setSourceConnected(next.kind === 'connected');
        }
      })
      .catch(() => {
        if (active) setState({ kind: 'disconnected' });
      });
    return () => {
      active = false;
    };
  }, [setSourceConnected, source]);

  const runSync = useCallback(async (): Promise<boolean> => {
    const result = await syncHealthData({
      source,
      onProgress: progress => setProgressLabel(progress.label),
    });
    setProgressLabel(null);

    if (result.needsReauth) {
      setNeedsReauth(true);
      setError(result.abortedBy);
      setState({ kind: 'disconnected' });
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

  const connect = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    setError(null);
    setNeedsReauth(false);
    try {
      await source.connect();
      await healthSources.activate(source);
      setState({ kind: 'connected' });
      setSourceConnected(true);
      await runSync();
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
  }, [runSync, setSourceConnected, source]);

  const disconnect = useCallback(async () => {
    setBusy(true);
    try {
      await source.disconnect();
      setState({ kind: 'disconnected' });
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

  return {
    state,
    isConnected: state?.kind === 'connected',
    isBusy,
    progressLabel,
    error,
    needsReauth,
    sourceName: source.descriptor.name,
    lastSyncedAt,
    connect,
    disconnect,
    sync,
  };
}
