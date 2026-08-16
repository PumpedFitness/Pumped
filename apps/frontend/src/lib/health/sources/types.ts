import type { CivilDate } from '../civilDate';
import type { FieldId, MetricId } from '../ids';
import type { SleepSessionInput } from '../algorithms/sleep';

/**
 * Stabile Kennung einer Quelle.
 *
 * Entscheidet, wem die Rohschicht gehört — **Werte niemals ändern**, sonst gilt
 * eine bestehende Historie plötzlich als fremd und wird beim nächsten Start
 * geräumt.
 */
export type SourceId = string & { readonly __brand: 'SourceId' };

export const SourceIds = {
  googleHealth: 'google-health' as SourceId,
} as const;

/** Was die Oberfläche über eine Quelle sagen darf, ohne sie zu kennen. */
export type SourceDescriptor = {
  readonly id: SourceId;
  readonly name: string;
  /** Eine Zeile für die Einstellungen: was diese Quelle liefert. */
  readonly detail: string;
};

export type SourceState =
  | { readonly kind: 'disconnected' }
  | { readonly kind: 'connected' }
  /**
   * Auf diesem Gerät nicht zu haben — fehlende Berechtigung, fehlende Hardware,
   * falscher Build. Der Grund gehört in die Einstellungen, damit die Zeile
   * nicht bloß ausgegraut dasteht.
   */
  | { readonly kind: 'unavailable'; readonly reason: string };

/** Ein gekoppeltes Gerät, so weit die Quelle davon weiß. */
export type SourceDevice = {
  readonly id: string;
  readonly name: string;
  readonly battery: number | null;
  readonly lastSync: Date | null;
};

/**
 * Eine technische Angabe zur Herkunft eines Wertes, für die Detailebene.
 *
 * Bewusst Text und kein Schema: Was eine Quelle über sich preisgibt, ist bei
 * einer REST-API ein Endpunkt, bei HealthKit ein Typbezeichner und bei einem
 * Dateiimport ein Spaltenname. Gemeinsam ist nur, dass es sich anzeigen lässt.
 */
export type SourceFact = {
  readonly label: string;
  readonly value: string;
  /** Wert unter das Etikett setzen statt daneben — für lange Angaben. */
  readonly stacked?: boolean;
};

// MARK: - Zeilenformen der Rohschicht

export type RawSampleRow = {
  readonly metric: MetricId;
  readonly ts: number;
  readonly field: FieldId;
  readonly tzOffsetSeconds: number;
  readonly value: number;
};

export type RawDailyRow = {
  readonly metric: MetricId;
  readonly date: CivilDate;
  readonly field: FieldId;
  readonly value: number;
};

/**
 * Eine Session in der Rohschicht.
 *
 * `sleep` ist die **quellenneutrale** Nacht — der Adapter hat Feldnamen, Typen
 * und Phasenvokabular bereits übersetzt. Die Auswertung liest ausschließlich
 * dieses Feld. `sourcePayload` bleibt daneben stehen, damit die
 * Herkunftsanzeige die Rohantwort zeigen kann; die Rechenschicht rührt ihn
 * nicht an.
 */
export type RawSessionRow = {
  readonly metric: MetricId;
  readonly startTs: number;
  readonly endTs: number;
  readonly tzOffsetSeconds: number;
  readonly sleep: SleepSessionInput | null;
  readonly sourcePayload: string | null;
};

/** Zeitfenster für `HealthSource.load`. `null` heißt: Grenze offen. */
export type LoadRange = {
  readonly from: Date | null;
  readonly to: Date | null;
};

/**
 * Was eine Quelle in die Rohschicht schiebt.
 *
 * Bereits übersetzt in die Zeilenformen der Datenbank, aber noch nicht
 * geschrieben. Das ist die Währung an der Grenze: oberhalb kennt niemand mehr
 * das Format, in dem die Quelle geantwortet hat.
 */
export type RawBatch = {
  readonly samples: readonly RawSampleRow[];
  readonly daily: readonly RawDailyRow[];
  readonly sessions: readonly RawSessionRow[];
  /** Neuester in diesem Batch gesehener Zeitpunkt, für den Sync-Zustand. */
  readonly newest: Date | null;
};

export function emptyBatch(): RawBatch {
  return { samples: [], daily: [], sessions: [], newest: null };
}

export function newestOf(...dates: readonly (Date | null)[]): Date | null {
  return dates.reduce<Date | null>(
    (newest, date) =>
      date !== null && (newest === null || date > newest) ? date : newest,
    null,
  );
}

// MARK: - Die Grenze

/**
 * Adapter zwischen einer fremden Gesundheitsquelle und der Rohschicht.
 *
 * Alles, was nur für *eine* Quelle gilt — Anmeldung, Endpunkte, Feldnamen,
 * Paginierung, Zeitformate, ob Zahlen als String kommen — bleibt hinter dieser
 * Grenze. Oberhalb kennt die App nur noch `MetricId`, `FieldId` und `RawBatch`.
 *
 * Die Fensterlogik gehört bewusst **nicht** hierher: Wie weit ein Delta-Lauf
 * überlappend zurückgreift und welche Nächte eine Herzfrequenzkurve bekommen,
 * sind Eigenschaften des Speichers, nicht der Quelle. Die Quelle bekommt das
 * fertige Fenster gereicht.
 */
export type HealthSource = {
  readonly descriptor: SourceDescriptor;

  getState(): Promise<SourceState>;

  /**
   * Welche Metriken diese Quelle überhaupt liefern kann. Der Sync überspringt
   * alles andere, statt daran zu scheitern — eine Quelle ohne Atemfrequenz ist
   * kein Fehlerfall, sondern eine Quelle mit weniger Termen.
   */
  readonly metrics: ReadonlySet<MetricId>;

  connect(): Promise<void>;
  disconnect(): Promise<void>;

  /**
   * Liefert Rohzeilen im Fenster stückweise. `null` an einer Grenze heißt
   * „offen" — `{ from: null, to: null }` ist die volle Historie.
   *
   * Stückweise, weil ein Jahr Herzfrequenz im 3-Sekunden-Takt rund zehn
   * Millionen Zeilen sind; die dürfen nicht zusammen im Speicher liegen. Aus
   * demselben Grund ist die **obere** Grenze Teil der Schnittstelle: Nur so
   * lässt sich die Herzfrequenz auf ein einzelnes Schlaffenster einschränken,
   * statt sie ganztägig zu ziehen.
   */
  load(
    metric: MetricId,
    range: LoadRange,
    sink: (batch: RawBatch) => Promise<void>,
  ): Promise<void>;

  /** Gekoppelte Geräte, sofern die Quelle so etwas kennt. */
  devices?(): Promise<SourceDevice[]>;

  /** Woher ein Wert technisch stammt, wie die Detailebene es nennt. */
  facts?(metric: MetricId, fields: readonly FieldId[]): SourceFact[];

  /**
   * Beim Start aufgerufen. Platz für Selbstprüfungen, deren Fehler sonst erst
   * spät und als etwas anderes auffallen.
   */
  validateConfiguration?(): void;
};
