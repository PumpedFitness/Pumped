import {
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core';

// Die Rohschicht der Gesundheitsdaten.
//
// Eine Zeile ist das, was eine Quelle geliefert hat — übersetzt in das
// Vokabular der App (`MetricId`/`FieldId`), aber nicht ausgewertet. Alles
// darüber (Baseline, Score, Schlafanalyse) rechnet ausschließlich hieraus und
// kennt die Quelle nicht mehr.
//
// **Genau eine Quelle besitzt diese Tabellen.** Sie teilen sich Primärschlüssel
// aus Metrik und Zeitstempel; zwei gleichzeitig aktive Quellen überschrieben
// einander stillschweigend. Ein Quellenwechsel räumt sie deshalb, statt zu
// mischen — siehe SourceRegistry.
//
// Die Migration legt alle vier `WITHOUT ROWID` an. Das ist hier kein
// Feintuning, sondern Semantik: Es gibt keinen `rowid`, auf den sich eine
// Tie-Break-Regel beziehen könnte, und der Primärschlüssel schließt Duplikate
// je Tag und Feld von vornherein aus.

/** Tageswerte — ein Wert je Metrik, Tag und Feld. */
export const healthRawDaily = sqliteTable(
  'health_raw_daily',
  {
    metric: integer('metric').notNull(),
    /** Zivildatum als `YYYYMMDD`. */
    date: integer('date').notNull(),
    field: integer('field').notNull(),
    value: real('value').notNull(),
  },
  table => [primaryKey({ columns: [table.metric, table.date, table.field] })],
);

/** Punkt- und Intervallmessungen. */
export const healthRawSample = sqliteTable(
  'health_raw_sample',
  {
    metric: integer('metric').notNull(),
    /** Unix-Sekunden. */
    ts: integer('ts').notNull(),
    field: integer('field').notNull(),
    tzOff: integer('tz_off').notNull(),
    value: real('value').notNull(),
  },
  table => [primaryKey({ columns: [table.metric, table.ts, table.field] })],
);

/**
 * Sessions — heute nur Schlaf.
 *
 * `sleep` trägt das **quellenneutrale** Schema als JSON: Der Adapter hat
 * Feldnamen, Zahlentypen und Phasenvokabular bereits übersetzt. Die Auswertung
 * liest ausschließlich diese Spalte.
 *
 * `source_payload` ist die unveränderte Antwort der Quelle. Sie steht daneben,
 * damit die Herkunftsanzeige sie zeigen kann — die Rechenschicht rührt sie
 * nicht an. Ohne diese Trennung kennte die Domäne Googles JSON-Struktur, und
 * eine zweite Quelle bräuchte dort einen eigenen Zweig.
 */
export const healthRawSession = sqliteTable(
  'health_raw_session',
  {
    metric: integer('metric').notNull(),
    startTs: integer('start_ts').notNull(),
    endTs: integer('end_ts').notNull(),
    tzOff: integer('tz_off').notNull(),
    sleep: text('sleep'),
    sourcePayload: text('source_payload'),
  },
  table => [primaryKey({ columns: [table.metric, table.startTs] })],
);

/**
 * Wie weit je Metrik synchronisiert wurde.
 *
 * Die Health API kennt keinen Change-Cursor — inkrementell geht nur über
 * Zeitfenster. `newest_ts` ist der jüngste gesehene Zeitpunkt, nicht der
 * Zeitpunkt des Laufs.
 */
export const healthSyncState = sqliteTable('health_sync_state', {
  metric: integer('metric').primaryKey(),
  newestTs: integer('newest_ts').notNull(),
  lastSuccess: integer('last_success'),
});

/**
 * Vom Nutzer markierte Zeiträume.
 *
 * `tz_off` ist der UTC-Offset beim Anlegen. Ohne ihn verschöbe sich die
 * Abdeckung rückwirkend, sobald der Nutzer die Zeitzone wechselt —
 * ausgerechnet beim Typ `travel`, für den die Markierung gedacht ist.
 */
export const healthAnnotations = sqliteTable('health_annotation', {
  id: text('id').primaryKey().notNull(),
  /** `sick` | `alcohol` | `travel` | `injury`. */
  type: text('type').notNull(),
  startTs: integer('start_ts').notNull(),
  /** `null` heißt offen — die Auswertung deckelt das auf 14 Tage. */
  endTs: integer('end_ts'),
  tzOff: integer('tz_off').notNull(),
  note: text('note'),
  createdAt: integer('created_at').notNull(),
});
