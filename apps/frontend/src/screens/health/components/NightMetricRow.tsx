import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { alpha } from '@pumped/ui/theme/palette';
import { STAGE_COLOR } from './NightChart';
import type { NightRow } from './nightRows';

type NightMetricRowProps = {
  row: NightRow;
  formatHours: (hours: number) => string;
};

const TRACK_HEIGHT = 10;
const THUMB = 14;

/**
 * Der Normalbereich auf der Spur.
 *
 * `accentSoft` sind 10 % Akzent — als Chip-Hintergrund richtig, als Abschnitt
 * einer ohnehin hellen Spur aber nicht vom Rest zu unterscheiden. Kräftig
 * genug, dass die Grenzen sichtbar sind, und blass genug, dass der Punkt darauf
 * noch der hellste Gegenstand bleibt.
 */
const RANGE_FILL = alpha(colors.accent, 0.3);

function formatValue(
  unit: NightRow['unit'],
  value: number,
  formatHours: (hours: number) => string,
): string {
  switch (unit) {
    case 'hours':
      return formatHours(value);
    case 'minutes':
      return `${Math.round(value)} m`;
    case 'percent':
      return `${Math.round(value * 100)}%`;
  }
}

function StatusChip({ status }: { status: NonNullable<NightRow['status']> }) {
  const { t } = useTranslation();
  const inRange = status === 'in';

  return (
    <View
      className="rounded-full px-2.5 py-1"
      style={{
        backgroundColor: inRange ? colors.accentSoft : 'rgba(27,26,24,0.06)',
      }}
    >
      <Text
        className="text-[11.5px] font-semibold"
        style={{ color: inRange ? colors.accentInk : colors.muted }}
      >
        {t(`health.sleepScore.status.${status}`)}
      </Text>
    </View>
  );
}

/**
 * Die Spur mit Normalbereich und dem Wert der letzten Nacht.
 *
 * Sie zeigt **nicht** die Punktzahl, sondern die Lage auf der Skala: der
 * gefärbte Abschnitt ist der Bereich, in dem der Wert liegen sollte, der Punkt
 * die Nacht. Ein reiner Fortschrittsbalken beantwortete nur „wie viel Prozent"
 * und verschwiege die Frage, die zählt — ob das normal ist.
 */
function RangeTrack({
  range,
  value,
}: {
  range: NonNullable<NightRow['range']>;
  value: number | null;
}) {
  const span = range.scaleMax - range.scaleMin;
  const fraction = (at: number) =>
    span <= 0 ? 0 : Math.min(1, Math.max(0, (at - range.scaleMin) / span));

  return (
    <View className="mt-2.5 justify-center" style={{ height: THUMB }}>
      <View
        className="w-full rounded-full overflow-hidden"
        style={{ height: TRACK_HEIGHT, backgroundColor: colors.barIdle }}
      >
        <View
          className="absolute h-full"
          style={{
            left: `${fraction(range.low) * 100}%`,
            right: `${
              range.high === null ? 0 : (1 - fraction(range.high)) * 100
            }%`,
            backgroundColor: RANGE_FILL,
          }}
        />
      </View>

      {value === null ? null : (
        <View
          className="absolute rounded-full border-2"
          style={{
            width: THUMB,
            height: THUMB,
            // Die Hälfte des Punktes abziehen, sonst läge sein linker Rand auf
            // dem Wert statt seiner Mitte.
            left: `${fraction(value) * 100}%`,
            marginLeft: -THUMB / 2,
            backgroundColor: colors.accent,
            borderColor: colors.card,
          }}
        />
      )}
    </View>
  );
}

/** Die Referenz der Zeile: Bereich, Ziel oder Abstand zum eigenen Median. */
function ReferenceText({
  row,
  formatHours,
}: {
  row: NightRow;
  formatHours: (hours: number) => string;
}) {
  const { t } = useTranslation();
  const show = (value: number) => formatValue(row.unit, value, formatHours);

  if (row.range !== null) {
    return (
      <Text className="text-[11.5px] text-muted">
        {row.range.high === null
          ? t('health.sleepScore.target', { value: show(row.range.low) })
          : t('health.sleepScore.usual', {
              low: show(row.range.low),
              high: show(row.range.high),
            })}
      </Text>
    );
  }

  if (row.deltaMinutes !== null) {
    return (
      <Text className="text-[11.5px] text-muted">
        {t('health.sleepScore.vsUsual', {
          delta: `${row.deltaMinutes >= 0 ? '+' : '−'}${Math.abs(
            Math.round(row.deltaMinutes),
          )} m`,
        })}
      </Text>
    );
  }

  return null;
}

/**
 * Eine Größe der letzten Nacht.
 *
 * Zeilen mit Bereich gehen in die Note ein und tragen Spur, Etikett und
 * Gewicht. Zeilen ohne Bereich sind gemessen, aber nicht benotet — sie bleiben
 * bewusst schmal, damit der Unterschied ohne Erklärung sichtbar ist.
 */
export function NightMetricRow({ row, formatHours }: NightMetricRowProps) {
  const { t } = useTranslation();

  return (
    <View className="py-3">
      <View className="flex-row items-center">
        {row.stage === null ? null : (
          <View
            className="w-2.5 h-2.5 rounded-[3px] mr-2"
            style={{ backgroundColor: STAGE_COLOR[row.stage] }}
          />
        )}
        <Text className="flex-1 text-[14px] font-semibold text-foreground">
          {/* Zwei Namensräume, und der Schlüssel allein entscheidet nicht
              zwischen ihnen: `deep` ist Phase **und** Term. Ausgeschrieben
              statt zusammengesetzt, damit die Keys geprüft bleiben — ein
              `health.sleepScore.term.core` gibt es nämlich nicht. */}
          {row.stage !== null
            ? t(`health.stage.${row.stage}`)
            : row.key === 'duration'
            ? t('health.sleepScore.term.duration')
            : t('health.sleepScore.term.efficiency')}
          {row.value === null ? null : (
            <Text className="text-[14px] text-muted">
              {' · '}
              {formatValue(row.unit, row.value, formatHours)}
            </Text>
          )}
        </Text>
        {row.status === null ? null : <StatusChip status={row.status} />}
      </View>

      {row.range === null ? null : (
        <RangeTrack range={row.range} value={row.value} />
      )}

      <View className="flex-row items-baseline mt-1.5 gap-2">
        <View className="flex-1 flex-row items-baseline gap-1.5">
          <ReferenceText row={row} formatHours={formatHours} />
          {row.breathing === undefined ? null : (
            <Text className="text-[11.5px] text-muted">
              {'· '}
              {t('health.metrics.nightBreathing', {
                value: row.breathing.toFixed(1),
              })}
            </Text>
          )}
        </View>
        {row.weight > 0 ? (
          <Text className="text-[11.5px] text-muted">
            {t('health.metrics.weightShare', {
              percent: Math.round(row.weight * 100),
            })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
