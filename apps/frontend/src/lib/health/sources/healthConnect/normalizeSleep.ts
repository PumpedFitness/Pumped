import type { RecordResult } from 'react-native-health-connect';

import type {
  SleepSessionInput,
  SleepStage,
  SleepStageInterval,
} from '../../algorithms/sleep';

export type SleepSessionResult = RecordResult<'SleepSession'>;

/**
 * Health Connects Phasenkennungen auf das Vokabular der App.
 *
 * Die Zahlen sind `SleepStageType` aus der Plattform. Zwei fehlen mit Absicht:
 *
 * - **`SLEEPING` (2)** ist undifferenzierter Schlaf, genau wie Googles `ASLEEP`.
 *   Ihn als `core` durchzureichen hieße Leichtschlaf zu behaupten, den niemand
 *   gemessen hat. Solche Nächte tragen ihre **Dauer** bei, aber keine
 *   Phasenverteilung: `hasStageDetail` wird falsch, und die Phasenmediane
 *   übergehen sie, statt von ihren Nullen nach unten gezogen zu werden.
 * - **`OUT_OF_BED` (3)** ist keine Schlafphase. Als `awake` gezählt verlängerte
 *   es die Wachzeit um Zeit, die der Nutzer gar nicht im Bett war, und
 *   verdürbe die Effizienz.
 *
 * `UNKNOWN` (0) fällt aus demselben Grund heraus wie `SLEEPING`.
 */
const STAGE_BY_HEALTH_CONNECT_TYPE: Readonly<Record<number, SleepStage>> = {
  1: 'awake',
  4: 'core',
  5: 'deep',
  6: 'rem',
};

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

function epochSeconds(iso: string): number | null {
  const millis = Date.parse(iso);
  return Number.isFinite(millis) ? Math.floor(millis / MS_PER_SECOND) : null;
}

function toStageInterval(stage: {
  startTime: string;
  endTime: string;
  stage: number;
}): SleepStageInterval | null {
  const kind = STAGE_BY_HEALTH_CONNECT_TYPE[stage.stage];
  if (kind === undefined) return null;

  const startTs = epochSeconds(stage.startTime);
  const endTs = epochSeconds(stage.endTime);
  if (startTs === null || endTs === null) return null;

  return { kind, startTs, endTs };
}

function minutesInStages(
  stages: readonly SleepStageInterval[],
  awake: boolean,
): number {
  return stages
    .filter(stage => (stage.kind === 'awake') === awake)
    .filter(stage => stage.endTs > stage.startTs)
    .reduce(
      (sum, stage) => sum + (stage.endTs - stage.startTs) / SECONDS_PER_MINUTE,
      0,
    );
}

/**
 * Eine Health-Connect-Schlafsession in die quellenneutrale Form.
 *
 * Hier endet Health Connects Format. Insbesondere:
 *
 * - **Die Schlafdauer steht nirgends.** `SleepSessionRecord` trägt Anfang, Ende
 *   und Phasen, aber keine Summe. Mit Phasendetail ist die Schlafdauer die Zeit
 *   in den Nicht-Wach-Phasen; ohne Phasen bleibt nur die Spanne, und die ist
 *   dann zugleich Zeit im Bett. Erfunden wird nichts: Ist die Spanne leer, ist
 *   die Nacht unbrauchbar.
 * - **`minutesToFallAsleep` bleibt `null`.** Die Plattform kennt es nicht, und
 *   `null` ist die ehrliche Antwort, nicht 0.
 * - **`isMain` bleibt `null`.** Health Connect markiert keine Nickerchen. Die
 *   Auswertung liest `null` als „gilt als Hauptschlaf" und hält Nickerchen über
 *   `MAIN_SLEEP_MIN_HOURS` heraus, was hier die richtige Behandlung ist.
 *
 * `tzOffsetSeconds` muss der Aufrufer beisteuern: `SleepSessionRecord` führt
 * **keinen** Zonenoffset, anders als die punktuellen Satztypen. Siehe
 * `ingest.ts`.
 *
 * `null` heißt: keine brauchbare Nacht. Ein einzelner kaputter Datensatz darf
 * den Batch nicht mitreißen.
 */
export function normalizeHealthConnectSleep(
  record: SleepSessionResult,
  tzOffsetSeconds: number,
): SleepSessionInput | null {
  const startTs = epochSeconds(record.startTime);
  const endTs = epochSeconds(record.endTime);
  if (startTs === null || endTs === null || endTs <= startTs) return null;

  const stages = (record.stages ?? [])
    .map(toStageInterval)
    .filter((stage): stage is SleepStageInterval => stage !== null);

  const minutesInSleepPeriod = (endTs - startTs) / SECONDS_PER_MINUTE;
  const asleepFromStages = minutesInStages(stages, false);
  const hasStageDetail = stages.some(stage => stage.kind !== 'awake');

  const minutesAsleep = hasStageDetail
    ? asleepFromStages
    : minutesInSleepPeriod;
  if (minutesAsleep <= 0) return null;

  return {
    startTs,
    endTs,
    tzOffsetSeconds,
    minutesAsleep,
    // Ohne Phasendetail wären Schlafdauer und Zeit im Bett dieselbe Zahl, und
    // die Effizienz käme als erfundene 100 % heraus (§8.3 in `DECISIONS.md`).
    // `null` heißt hier: unbekannt.
    minutesInSleepPeriod: hasStageDetail ? minutesInSleepPeriod : null,
    minutesAwake: hasStageDetail ? minutesInStages(stages, true) : null,
    minutesToFallAsleep: null,
    isMain: null,
    stages,
  };
}
