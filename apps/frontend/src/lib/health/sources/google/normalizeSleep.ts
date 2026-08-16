import type {
  SleepSessionInput,
  SleepStage,
  SleepStageInterval,
} from '../../algorithms/sleep';
import {
  asArray,
  asBool,
  asNumber,
  asString,
  at,
  epochSeconds,
  offsetSeconds,
  type Json,
} from './json';

/**
 * Googles Phasenvokabular auf das der App.
 *
 * `ASLEEP` fehlt mit Absicht. Es kommt nur in `CLASSIC`-Nächten vor und
 * bezeichnet undifferenzierten Schlaf — als `core` durchzureichen hieße
 * Leichtschlaf zu behaupten, den niemand gemessen hat. Solche Nächte tragen
 * ihre **Dauer** bei (die kommt aus dem `summary`, nicht aus den Phasen), aber
 * keine Phasenverteilung: `hasStageDetail` wird für sie falsch, und die
 * Phasenmediane übergehen sie, statt von ihren Nullen nach unten gezogen zu
 * werden.
 */
const STAGE_BY_GOOGLE_TYPE: Readonly<Record<string, SleepStage>> = {
  DEEP: 'deep',
  REM: 'rem',
  LIGHT: 'core',
  AWAKE: 'awake',
};

function toStageInterval(node: Json): SleepStageInterval | null {
  const kind = STAGE_BY_GOOGLE_TYPE[asString(at(node, 'type')) ?? ''];
  if (kind === undefined) return null;

  const startTs = epochSeconds(at(node, 'startTime'));
  const endTs = epochSeconds(at(node, 'endTime'));
  if (startTs === null || endTs === null) return null;

  return { kind, startTs, endTs };
}

/**
 * Eine Google-Schlafsession in die quellenneutrale Form.
 *
 * Hier endet Googles Format. Insbesondere:
 *
 * - **Zahlen kommen als Strings.** `"minutesAsleep": "482"` ist der Normalfall,
 *   nicht die Ausnahme; der Seed der Original-App schreibt `Int` und verdeckt
 *   das. `asNumber` macht daraus eine Zahl, bevor irgendetwas damit vergleicht.
 * - **Fehlende Zeit im Bett wird nicht ersetzt.** Das Original fällt auf
 *   `minutesAsleep` zurück, was eine Effizienz von exakt 100 % erfindet. Hier
 *   bleibt das Feld `null` und die Effizienz unbekannt.
 * - **`mainSleep` bleibt `null`, wenn es fehlt.** Die Vorgabe („gilt als
 *   Hauptschlaf") ist eine Auswertungsregel und steht in `mainNightsByDate`,
 *   nicht hier.
 *
 * `null` heißt: keine brauchbare Nacht. Eine Session ohne Schlafdauer oder ohne
 * lesbares Intervall wird übersprungen, statt den ganzen Batch zu verwerfen.
 */
export function normalizeSleepSession(payload: Json): SleepSessionInput | null {
  const startTs = epochSeconds(at(payload, 'interval.startTime'));
  const endTs = epochSeconds(at(payload, 'interval.endTime'));
  if (startTs === null || endTs === null) return null;

  const minutesAsleep = asNumber(at(payload, 'summary.minutesAsleep'));
  if (minutesAsleep === null) return null;

  return {
    startTs,
    endTs,
    tzOffsetSeconds: offsetSeconds(at(payload, 'interval.startUtcOffset')),
    minutesAsleep,
    minutesInSleepPeriod: asNumber(at(payload, 'summary.minutesInSleepPeriod')),
    minutesAwake: asNumber(at(payload, 'summary.minutesAwake')),
    minutesToFallAsleep: asNumber(at(payload, 'summary.minutesToFallAsleep')),
    isMain: asBool(at(payload, 'metadata.mainSleep')),
    stages: asArray(at(payload, 'stages'))
      .map(toStageInterval)
      .filter((stage): stage is SleepStageInterval => stage !== null),
  };
}
