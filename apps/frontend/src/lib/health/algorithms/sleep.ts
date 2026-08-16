import { civilDateFromEpoch, type CivilDate } from '../civilDate';

/**
 * Schlafphasen in der Reihenfolge, in der der Handoff sie auflistet. „Core" ist
 * die Bezeichnung des Handoffs; Google nennt dieselbe Phase `LIGHT`.
 *
 * Die Reihenfolge entscheidet zugleich den Gleichstand im Hypnogramm.
 */
export const SLEEP_STAGES = ['deep', 'rem', 'core', 'awake'] as const;

export type SleepStage = (typeof SLEEP_STAGES)[number];

/**
 * Eine Nacht in der **quellenneutralen** Form, die ein Adapter liefern muss.
 *
 * Feldnamen und Typen der Quelle enden am Adapter: Google gibt die Minuten als
 * Strings und die Phasen als `LIGHT`/`DEEP`/`REM`/`AWAKE` heraus, HealthKit
 * täte etwas anderes. Was hier ankommt, ist bereits übersetzt — Zahlen sind
 * Zahlen, Phasen tragen die Namen oben, und was die Quelle nicht kennt, ist
 * `null` statt geraten.
 */
export type SleepSessionInput = {
  readonly startTs: number;
  readonly endTs: number;
  readonly tzOffsetSeconds: number;
  readonly minutesAsleep: number;
  readonly minutesInSleepPeriod: number | null;
  readonly minutesAwake: number | null;
  readonly minutesToFallAsleep: number | null;
  readonly isMain: boolean | null;
  readonly stages: readonly SleepStageInterval[];
};

export type SleepStageInterval = {
  readonly kind: SleepStage;
  readonly startTs: number;
  readonly endTs: number;
};

export type SleepNight = SleepSessionInput & {
  /** Zivildatum des **Morgens**, in der Zeitzone der Messung. */
  readonly date: CivilDate;
  readonly hoursAsleep: number;
  /** `null`, wenn die Quelle die Zeit im Bett nicht kennt. */
  readonly efficiency: number | null;
  /**
   * Ob die Quelle für diese Nacht differenzierte Schlafphasen geliefert hat.
   *
   * Googles CLASSIC-Nächte tragen nur `ASLEEP` und `AWAKE`; nach der Abbildung
   * bleibt kein Tief-, REM- oder Kernschlaf übrig. Solche Nächte fallen aus der
   * Phasenstatistik, statt sie mit Nullen nach unten zu ziehen.
   */
  readonly hasStageDetail: boolean;
};

/**
 * Kürzere Sessions gelten nicht als Nacht.
 *
 * `mainSleep` allein reicht dafür nicht: Google markiert auch Nickerchen von
 * einer Stunde als Hauptschlaf, und an Tagen ohne echte Nacht werden sie sonst
 * zur Schlafdauer des Tages. Im Testkonto verdoppelt das die Streuung der
 * Schlaf-Baseline und macht das Normalband unbrauchbar. Die Grenze liegt in
 * einer echten Lücke der Daten — Sessions verteilen sich auf 1,1–2,3 h
 * einerseits und 4,1 h aufwärts andererseits.
 */
export const MAIN_SLEEP_MIN_HOURS = 3;

export function toSleepNight(session: SleepSessionInput): SleepNight {
  const hoursAsleep = session.minutesAsleep / 60;
  return {
    ...session,
    date: civilDateFromEpoch(session.endTs, session.tzOffsetSeconds),
    hoursAsleep,
    efficiency:
      session.minutesInSleepPeriod !== null && session.minutesInSleepPeriod > 0
        ? session.minutesAsleep / session.minutesInSleepPeriod
        : null,
    hasStageDetail: session.stages.some(stage => stage.kind !== 'awake'),
  };
}

/**
 * Eine Nacht pro Zivildatum.
 *
 * Rangfolge bei Kollision: `isMain` vor `!isMain`, dann die längere, dann die
 * später begonnene. `startTs` ist Teil des Primärschlüssels der Rohschicht und
 * schließt damit jeden Gleichstand.
 */
export function mainNightsByDate(
  nights: readonly SleepNight[],
): Map<CivilDate, SleepNight> {
  const byDate = new Map<CivilDate, SleepNight>();

  for (const night of nights) {
    if (night.hoursAsleep < MAIN_SLEEP_MIN_HOURS) continue;
    const existing = byDate.get(night.date);
    if (!existing || outranks(night, existing)) byDate.set(night.date, night);
  }

  return byDate;
}

function outranks(candidate: SleepNight, incumbent: SleepNight): boolean {
  // Ein fehlendes `mainSleep` gilt als Hauptschlaf — so liest es die Quelle,
  // wenn sie zwischen Nacht und Nickerchen gar nicht unterscheidet.
  const candidateMain = candidate.isMain ?? true;
  const incumbentMain = incumbent.isMain ?? true;
  if (candidateMain !== incumbentMain) return candidateMain;
  if (candidate.minutesAsleep !== incumbent.minutesAsleep) {
    return candidate.minutesAsleep > incumbent.minutesAsleep;
  }
  return candidate.startTs > incumbent.startTs;
}

/** Minuten in einer Phase. Abschnitte ohne positive Dauer tragen nichts bei. */
export function stageMinutes(night: SleepNight, stage: SleepStage): number {
  return night.stages
    .filter(entry => entry.kind === stage && entry.endTs > entry.startTs)
    .reduce((sum, entry) => sum + (entry.endTs - entry.startTs) / 60, 0);
}

/**
 * Die Nacht in `columns` gleich breite Säulen zerlegt.
 *
 * Je Säule gewinnt die Phase mit dem größten Zeitanteil, nicht die in der
 * Mitte — sonst verschwinden kurze Wachphasen, und genau die trägt die Quelle
 * eigens mit. Aggregiert wird **pro Phase**: Zwei getrennte Tiefschlafblöcke in
 * derselben Säule addieren sich.
 */
export function hypnogram(
  night: SleepNight,
  columns: number,
): (SleepStage | null)[] {
  const total = night.endTs - night.startTs;
  if (total <= 0 || night.stages.length === 0) {
    return Array.from({ length: columns }, () => null);
  }
  const width = total / columns;

  return Array.from({ length: columns }, (_, index) => {
    const from = night.startTs + index * width;
    const to = from + width;

    const overlap = new Map<SleepStage, number>();
    for (const stage of night.stages) {
      const shared = Math.min(to, stage.endTs) - Math.max(from, stage.startTs);
      if (shared > 0) {
        overlap.set(stage.kind, (overlap.get(stage.kind) ?? 0) + shared);
      }
    }

    // Gleichstand deterministisch: die Reihenfolge aus SLEEP_STAGES gewinnt.
    let winner: SleepStage | null = null;
    let best = 0;
    for (const stage of SLEEP_STAGES) {
      const seconds = overlap.get(stage) ?? 0;
      if (seconds > best) {
        best = seconds;
        winner = stage;
      }
    }
    return winner;
  });
}
