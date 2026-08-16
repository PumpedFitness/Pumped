import type { FieldId, MetricId } from '../../ids';
import {
  SourceIds,
  type HealthSource,
  type RawBatch,
  type SourceDevice,
  type SourceFact,
  type LoadRange,
  type SourceState,
} from '../types';
import { GOOGLE_METRICS, specFor } from './catalog';
import { validateRedirectScheme, type GoogleHealthConfig } from './config';
import { GoogleHealthApiClient } from './client';
import { ingestPoints } from './ingest';
import { asNumber, asString, at, epochSeconds } from './json';
import { GoogleOAuthClient, type ConsentPresenter } from './oauth';
import { TokenStore, type SecureStorage } from './tokenStore';

export type GoogleHealthSourceOptions = {
  readonly config: GoogleHealthConfig;
  readonly storage?: SecureStorage;
  readonly presentConsent?: ConsentPresenter;
  /** In `app.json` registrierte URL-Schemata, für die Startprüfung. */
  readonly registeredSchemes?: readonly string[];
  readonly onConfigurationProblem?: (message: string) => void;
};

/**
 * Der Google-Health-Adapter.
 *
 * Alles, was nur für Google gilt, endet hier: OAuth, Endpunkte, Feldnamen,
 * Paginierung, `"7200s"`-Offsets, Zahlen als Strings, das Phasenvokabular.
 * Nach `load` gibt es nur noch `RawBatch`.
 */
export function createGoogleHealthSource(
  options: GoogleHealthSourceOptions,
): HealthSource {
  const store = new TokenStore(options.storage);
  const auth = new GoogleOAuthClient({
    config: options.config,
    store,
    presentConsent: options.presentConsent,
  });
  const api = new GoogleHealthApiClient({
    config: options.config,
    auth,
    store,
  });

  return {
    descriptor: {
      id: SourceIds.googleHealth,
      name: 'Google Health',
      detail: 'Heart rate variability, resting heart rate, sleep, breathing',
    },

    metrics: GOOGLE_METRICS,

    async getState(): Promise<SourceState> {
      const refresh = await store.refreshToken();
      return refresh === null
        ? { kind: 'disconnected' }
        : { kind: 'connected' };
    },

    async connect(): Promise<void> {
      await auth.authorize();
    },

    async disconnect(): Promise<void> {
      await auth.signOut();
    },

    async load(
      metric: MetricId,
      range: LoadRange,
      sink: (batch: RawBatch) => Promise<void>,
    ): Promise<void> {
      const spec = specFor(metric);
      // Eine Metrik, die diese Quelle nicht kennt, ist kein Fehlerfall.
      if (spec === undefined) return;

      await api.forEachPage(spec, range, async points => {
        await sink(ingestPoints(spec, points));
      });
    },

    async devices(): Promise<SourceDevice[]> {
      const raw = await api.pairedDevices();
      return raw.map((device, index) => ({
        id: asString(at(device, 'name')) ?? `device-${index}`,
        name:
          asString(at(device, 'displayName')) ??
          asString(at(device, 'model')) ??
          'Unknown device',
        battery: asNumber(at(device, 'batteryPercentage')),
        lastSync: toDate(epochSeconds(at(device, 'lastSyncTime'))),
      }));
    },

    facts(metric: MetricId, fields: readonly FieldId[]): SourceFact[] {
      const spec = specFor(metric);
      if (spec === undefined) return [];

      const keys = spec.fields
        .filter(([field]) => fields.includes(field))
        .map(([, key]) => key);

      return [
        { label: 'Endpoint', value: spec.endpoint },
        { label: 'Record shape', value: spec.shape },
        ...(keys.length > 0
          ? [{ label: 'JSON keys', value: keys.join('\n'), stacked: true }]
          : []),
      ];
    },

    validateConfiguration(): void {
      const problem = validateRedirectScheme(
        options.config,
        options.registeredSchemes ?? [],
      );
      if (problem !== null) options.onConfigurationProblem?.(problem);
    },
  };
}

function toDate(epochSecondsValue: number | null): Date | null {
  return epochSecondsValue === null ? null : new Date(epochSecondsValue * 1000);
}
