import type { HealthSource, SourceId } from './types';

/**
 * Was die Registry vom Speicher braucht, um sich zu merken, welche Quelle gilt.
 * Als Port, damit sie ohne MMKV testbar bleibt.
 */
export type RegistryStorage = {
  getString(key: string): string | null;
  setString(key: string, value: string): void;
};

/** Was die Registry von der Rohschicht braucht. */
export type RawLayerStore = {
  countRows(): Promise<number>;
  clear(): Promise<void>;
};

const ACTIVE_KEY = 'health.active_source';
const OWNER_KEY = 'health.raw_layer_owner';

/**
 * Kennt die verfügbaren Quellen und hält fest, welche gerade gilt.
 *
 * **Genau eine Quelle ist aktiv.** Alle schreiben in dieselben Tabellen und
 * teilen sich den Primärschlüssel aus Metrik und Zeitstempel; zwei gleichzeitig
 * aktive Quellen überschrieben einander stillschweigend, und in der Rohschicht
 * stünde danach eine Historie, die es so nie gab. Ein Wechsel räumt die
 * Rohschicht deshalb, statt sie zu mischen.
 */
export class SourceRegistry {
  /** In Anzeigereihenfolge. Das erste Element ist der Vorgabewert. */
  readonly all: readonly HealthSource[];

  private readonly storage: RegistryStorage;
  private readonly rawLayer: RawLayerStore;
  private current: HealthSource;

  constructor(options: {
    sources: readonly HealthSource[];
    storage: RegistryStorage;
    rawLayer: RawLayerStore;
  }) {
    if (options.sources.length === 0) {
      throw new Error('Ohne Quelle gibt es nichts zu lesen.');
    }
    this.all = options.sources;
    this.storage = options.storage;
    this.rawLayer = options.rawLayer;

    const stored = options.storage.getString(ACTIVE_KEY);
    this.current =
      options.sources.find(source => source.descriptor.id === stored) ??
      options.sources[0];

    // Bestandsdaten stammen aus der Zeit vor der Quellen-Trennung. Sie gehören
    // der damals einzigen Quelle — ohne diese Zuweisung gälten sie beim ersten
    // Wechsel als herrenlos und blieben stehen.
    if (this.owner === null) this.owner = this.current.descriptor.id;
  }

  get active(): HealthSource {
    return this.current;
  }

  /** Die Quelle, der die Rohschicht gehört. */
  private get owner(): SourceId | null {
    return (this.storage.getString(OWNER_KEY) as SourceId | null) ?? null;
  }

  private set owner(value: SourceId | null) {
    this.storage.setString(OWNER_KEY, value ?? '');
  }

  /** Ob die Rohschicht dieser Quelle gehört — ein Wechsel zu ihr kostet nichts. */
  owns(source: HealthSource): boolean {
    return this.owner === source.descriptor.id;
  }

  /** Wie viele Rohzeilen ein Wechsel kosten würde. */
  async storedRowCount(): Promise<number> {
    return this.rawLayer.countRows();
  }

  /**
   * Macht `source` zur aktiven Quelle und räumt die Rohschicht, wenn sie einer
   * anderen gehört.
   *
   * Erst **nach** erfolgreicher Anmeldung aufrufen. Wer vorher räumt und dann am
   * Consent scheitert, steht ohne Daten und ohne Verbindung da.
   */
  async activate(source: HealthSource): Promise<void> {
    if (this.owner !== source.descriptor.id) {
      await this.rawLayer.clear();
      this.owner = source.descriptor.id;
    }
    this.storage.setString(ACTIVE_KEY, source.descriptor.id);
    this.current = source;
  }

  validateConfiguration(): void {
    for (const source of this.all) source.validateConfiguration?.();
  }
}
