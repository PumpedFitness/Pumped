import type { Metric } from '@/lib/health/metrics';

/**
 * Wie eine Größe geschrieben wird.
 *
 * Reine Darstellung — die Zahlen selbst kommen unverändert aus der
 * Rechenschicht. Die Nachkommastellen folgen dem, was die Messung hergibt: Ein
 * Ruhepuls auf zwei Stellen genau wäre eine Behauptung.
 */
export function formatMetric(metric: Metric, value: number): string {
  switch (metric) {
    // Die Nachtnote steht hier, weil sie ganzzahlig ist wie Puls und HRV —
    // 1 bis 99, dieselbe Skala wie der Readiness-Score selbst.
    case 'hrv':
    case 'rhr':
    case 'sleepScore':
      return value.toFixed(0);
    case 'resp':
      return value.toFixed(1);
    case 'temp':
      return value.toFixed(2);
    case 'deep':
      return String(Math.round(value));
    case 'sleep': {
      const minutes = Math.round(value * 60);
      return `${Math.floor(minutes / 60)} h ${minutes % 60} m`;
    }
  }
}

export const METRIC_UNIT: Record<Metric, string> = {
  hrv: 'ms',
  rhr: 'bpm',
  sleepScore: '',
  sleep: '',
  deep: 'min',
  resp: 'br/min',
  temp: '°C',
};

/** Dezimalstunden für die kompakte Zeile — „6.9" statt „6 h 54 m". */
export function formatCompactHours(value: number): string {
  return value.toFixed(1);
}

/** „+14 m" / „−6 m" — mit typografischem Minus. */
export function formatSignedMinutes(value: number): string {
  const rounded = Math.round(value);
  return rounded < 0 ? `−${Math.abs(rounded)} m` : `+${rounded} m`;
}

/** „+1.35σ" — die Abweichung von der eigenen Mitte, kein Prozentwert. */
export function formatSigma(z: number | null): string {
  if (z === null) return '—';
  return `${z >= 0 ? '+' : '−'}${Math.abs(z).toFixed(2)}σ`;
}

/** „12 Jul" — kurz genug für beide Enden einer Achse. */
export function formatChartDate(date: number, locale: string): string {
  const year = Math.trunc(date / 10000);
  const month = (Math.trunc(date / 100) % 100) - 1;
  const day = date % 100;
  return new Date(Date.UTC(year, month, day)).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
}

/** Tageszeit-Anrede. Die Grenzen folgen dem Sprachgefühl, nicht der Astronomie. */
export function greetingKey(
  hour: number,
):
  | 'health.greeting.morning'
  | 'health.greeting.afternoon'
  | 'health.greeting.evening' {
  if (hour < 12) return 'health.greeting.morning';
  if (hour < 18) return 'health.greeting.afternoon';
  return 'health.greeting.evening';
}

/**
 * Der i18n-Schlüssel für „zuletzt geladen", samt Zähler.
 *
 * Nur der Schlüssel, nicht der fertige Text: Die Ressourcen sind typisiert und
 * kennen die Pluralformen, `t` gehört deshalb in die Komponente. Die Stufen
 * folgen dem, was man wissen will — unter einer Minute ist „gerade eben"
 * genauer als eine Zahl, und ab einem Tag zählt niemand mehr Stunden.
 */
export type SyncedKey =
  | 'health.metrics.neverSynced'
  | 'health.metrics.syncedNow'
  | 'health.metrics.syncedMinutes'
  | 'health.metrics.syncedHours'
  | 'health.metrics.syncedDays';

export function syncedAtKey(
  lastSyncedAt: number | null,
  now: number,
): { key: SyncedKey; count: number } {
  if (lastSyncedAt === null) {
    return { key: 'health.metrics.neverSynced', count: 0 };
  }

  const seconds = Math.max(0, (now - lastSyncedAt) / 1000);
  if (seconds < 60) return { key: 'health.metrics.syncedNow', count: 0 };

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return { key: 'health.metrics.syncedMinutes', count: minutes };
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return { key: 'health.metrics.syncedHours', count: hours };

  return { key: 'health.metrics.syncedDays', count: Math.floor(hours / 24) };
}
