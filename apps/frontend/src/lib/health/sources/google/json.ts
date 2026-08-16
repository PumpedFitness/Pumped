import type { CivilDate } from '../../civilDate';

/**
 * Lesehilfen für Googles JSON.
 *
 * Die Health API mischt Typen auf eine Art, die feste Strukturen schlecht
 * abbilden: Ganzzahlen kommen als **String** (protobuf-int64-Konvention),
 * Fließkommazahlen als Zahl, und nicht kalibrierte Messwerte als der String
 * `"NaN"`. Alles davon endet hier — oberhalb des Adapters ist eine Zahl eine
 * Zahl.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export function at(node: Json | undefined, keyPath: string): Json | undefined {
  return keyPath.split('.').reduce<Json | undefined>((current, key) => {
    if (
      current === null ||
      typeof current !== 'object' ||
      Array.isArray(current)
    ) {
      return undefined;
    }
    return current[key];
  }, node);
}

export function asString(node: Json | undefined): string | null {
  return typeof node === 'string' ? node : null;
}

export function asArray(node: Json | undefined): Json[] {
  return Array.isArray(node) ? node : [];
}

export function asBool(node: Json | undefined): boolean | null {
  return typeof node === 'boolean' ? node : null;
}

/**
 * Zahl aus einer Zahl **oder** aus einem numerischen String.
 *
 * Nicht-endliche Werte ergeben `null`. Das ist keine Formalie: Die API liefert
 * für noch nicht kalibrierte Messwerte den String `"NaN"`, und `Number("NaN")`
 * gibt `NaN` zurück statt `null`. Ohne diese Prüfung wanderte ein `NaN` in die
 * Datenbank und vergiftete jede Statistik, die es anfasst.
 *
 * Und der andere Weg herum: Ohne die String-Konvertierung stünde `"482"` in der
 * Rohschicht. Rechnen ginge in JavaScript durch Koersion noch gut, aber jeder
 * Vergleich kippt — `"482" > "89"` ist `false`.
 */
export function asNumber(node: Json | undefined): number | null {
  let candidate: number;
  if (typeof node === 'number') {
    candidate = node;
  } else if (typeof node === 'string' && node.trim() !== '') {
    candidate = Number(node);
  } else {
    return null;
  }
  return Number.isFinite(candidate) ? candidate : null;
}

// MARK: - Zeit

/** `"2026-08-09T16:52:13Z"`, teils mit Sekundenbruchteilen. → Unix-Sekunden. */
export function epochSeconds(node: Json | undefined): number | null {
  const text = asString(node);
  if (text === null) return null;
  const milliseconds = Date.parse(text);
  return Number.isNaN(milliseconds) ? null : Math.floor(milliseconds / 1000);
}

/** `"7200s"` → `7200`. */
export function offsetSeconds(node: Json | undefined): number {
  const text = asString(node);
  if (text === null || !text.endsWith('s')) return 0;
  const parsed = Number(text.slice(0, -1));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** `{ year, month, day }` → `20260809`. */
export function civilDate(node: Json | undefined): CivilDate | null {
  const year = asNumber(at(node, 'year'));
  const month = asNumber(at(node, 'month'));
  const day = asNumber(at(node, 'day'));
  if (year === null || month === null || day === null) return null;
  return year * 10000 + month * 100 + day;
}

/** `Date` → `"2026-08-09"` in UTC, für den Filterausdruck täglicher Typen. */
export function civilDateString(date: Date): string {
  const year = String(date.getUTCFullYear()).padStart(4, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** `Date` → `"2026-08-09T16:52:13Z"`, ohne Sekundenbruchteile. */
export function rfc3339(date: Date): string {
  return `${date.toISOString().slice(0, 19)}Z`;
}
