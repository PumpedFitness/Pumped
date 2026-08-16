/**
 * Ein Kalendertag als `YYYYMMDD`-Integer — sortierbar, vergleichbar, und ohne
 * die Zeitzonenfallen, die ein `Date` an einer Tagesgrenze mitbringt.
 *
 * Alle Arithmetik läuft über echte Kalendertage, nicht über den Integer:
 * zwischen `20250131` und `20250201` liegt **ein** Tag, nicht 70. Gerechnet
 * wird in UTC, weil ein Zivildatum keine Uhrzeit hat und UTC als einziger
 * Rahmen keine Sommerzeit kennt — eine Differenz in Tagen bleibt damit exakt.
 */
export type CivilDate = number;

/** Der Tag, für den gerechnet wird, samt Angabe wie alt er ist. */
export type ReferenceDate = {
  readonly date: CivilDate;
  /** Kalendertage zwischen Stichtag und heute. 0 heißt aktuell. */
  readonly daysStale: number;
};

const MS_PER_DAY = 86_400_000;

function toEpochDays(value: CivilDate): number {
  const year = Math.trunc(value / 10000);
  const month = Math.trunc(value / 100) % 100;
  const day = value % 100;
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function fromEpochDays(days: number): CivilDate {
  const date = new Date(days * MS_PER_DAY);
  return (
    date.getUTCFullYear() * 10000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate()
  );
}

/** Zivildatum eines Zeitpunkts in der Zeitzone der Messung. */
export function civilDateFromEpoch(
  epochSeconds: number,
  utcOffsetSeconds: number,
): CivilDate {
  return fromEpochDays(Math.floor((epochSeconds + utcOffsetSeconds) / 86_400));
}

/**
 * Zivildatum eines `Date` in der Zeitzone des Geräts.
 *
 * Tagesgrenzen richten sich nach der lokalen Zeit, nie nach UTC — sonst
 * wechselt der Tag für einen Nutzer westlich von Greenwich mitten am Abend.
 */
export function civilDateFromLocal(date: Date): CivilDate {
  return (
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
  );
}

/** Mitternacht des Tages in UTC — nur für Anzeige und Formatierung. */
export function civilDateToUTCDate(value: CivilDate): Date {
  return new Date(toEpochDays(value) * MS_PER_DAY);
}

/**
 * Ein Zeitpunkt **innerhalb** dieses Tages, als Unix-Sekunden — die Umkehrung
 * von `civilDateFromEpoch` für alles, was ein Datum speichern muss.
 *
 * Mittag, nicht Mitternacht. Der Zeitstempel wird später mit einem
 * gespeicherten Zonenoffset zurückgerechnet, und der muss nicht derselbe sein:
 * Wer eine Markierung über eine Zeitumstellung hinweg anlegt, verschöbe eine
 * Mitternacht um eine Stunde auf den Vor- oder Folgetag. Zwölf Stunden Abstand
 * zu beiden Tagesgrenzen überstehen jeden realen Offsetunterschied.
 */
export function civilDateToLocalEpochSeconds(value: CivilDate): number {
  const year = Math.trunc(value / 10000);
  const month = Math.trunc(value / 100) % 100;
  const day = value % 100;
  return Math.floor(new Date(year, month - 1, day, 12).getTime() / 1000);
}

/** Der UTC-Offset des Geräts in Sekunden, positiv östlich von Greenwich. */
export function localOffsetSeconds(at: Date = new Date()): number {
  return -at.getTimezoneOffset() * 60;
}

/**
 * Kalendertage addieren.
 *
 * Kann nicht fehlschlagen. Im Swift-Original ist der Rückgabewert optional,
 * weil `Calendar.date(byAdding:)` es ist — die Fallback-Zweige dort sind toter
 * Code und wurden nicht mitportiert.
 */
export function addDays(value: CivilDate, days: number): CivilDate {
  return fromEpochDays(toEpochDays(value) + days);
}

/** Kalendertage zwischen zwei Zivildaten, `to − from`. */
export function daysBetween(from: CivilDate, to: CivilDate): number {
  return toEpochDays(to) - toEpochDays(from);
}
