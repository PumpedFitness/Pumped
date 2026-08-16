import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import type { SleepAnalysis } from '@/lib/health/algorithms/sleepAnalysis';
import { NightChart } from './NightChart';
import { NightMetricRow } from './NightMetricRow';
import { nightRows } from './nightRows';
import { SleepScoreHero } from './SleepScoreHero';
import type { SleepScoreResult } from '@/lib/health/algorithms/sleepScore';
import type { UsualRange } from '@/lib/health/algorithms/params';
import type { SleepStage } from '@/lib/health/algorithms/sleep';

type SleepPanelProps = {
  analysis: SleepAnalysis;
  score: SleepScoreResult;
  formatHours: (hours: number) => string;
  formatHour: (epochSeconds: number) => string;
  /** Ruhepuls der Nacht, falls die Quelle ihn geliefert hat. */
  restingHeartRate: number | null;
  respiratoryRate: number | null;
  /** Verdichtete Herzfrequenz derselben Nacht. Leer heißt: nicht geholt. */
  heartRateCurve: readonly { ts: number; value: number }[];
  /** Atemfrequenz je Phase. Fehlende Phasen bleiben ohne Angabe. */
  breathingByStage: Partial<Record<SleepStage, number>>;
  /** Normalband des Ruhepulses, als Referenz hinter der Nachtkurve. */
  restingBand: UsualRange | null;
};

/**
 * Die letzte Nacht: Note, Verlauf und die Größen dahinter.
 *
 * Das Wochendefizit stand hier ebenfalls und ist vorerst heraus — die Karte
 * zeigte sieben Balken gegen eine Bedarfslinie und beantwortete damit weniger,
 * als sie an Platz kostete. Gerechnet wird es weiter: `sleepDebtHours` geht in
 * den Readiness-Score ein, `SLEEP_NEED_HOURS` ist das Ziel des Dauer-Terms.
 */
export function SleepPanel({
  analysis,
  score,
  formatHours,
  formatHour,
  restingHeartRate,
  respiratoryRate,
  heartRateCurve,
  breathingByStage,
  restingBand,
}: SleepPanelProps) {
  const { t } = useTranslation();
  // Phasen und benotete Terme in einer Liste. Tief- und REM-Schlaf standen
  // vorher in beiden und trugen dieselbe Minutenzahl mit zwei Referenzen.
  const rows =
    analysis.lastNight === null
      ? []
      : nightRows({
          score,
          stageRows: analysis.stageRows,
          breathingByStage,
        });

  // Die Dauer wandert über das Diagramm, der Rest darunter.
  const duration = rows.find(row => row.key === 'duration');
  const detail = rows.filter(row => row.key !== 'duration');

  // Was in derselben Nacht sonst gemessen wurde. Beides ist ein Tageswert, kein
  // Verlauf — die Quelle liefert Puls und Atmung als eine Zahl je Nacht.
  const vitalsLine =
    restingHeartRate === null && respiratoryRate === null
      ? null
      : [
          restingHeartRate === null
            ? null
            : t('health.metrics.nightHeartRate', {
                value: Math.round(restingHeartRate),
              }),
          respiratoryRate === null
            ? null
            : t('health.metrics.nightBreathing', {
                value: respiratoryRate.toFixed(1),
              }),
        ]
          .filter(Boolean)
          .join(' · ');

  return (
    <Animated.View entering={FadeInDown.duration(320).delay(200)}>
      <SleepScoreHero
        result={score}
        hoursAsleep={analysis.lastNight?.hoursAsleep ?? null}
        formatHours={formatHours}
      />

      {analysis.lastNight !== null ? (
        <View className="rounded-[22px] border border-border-hairline bg-surface-card px-4 pt-4 mb-2.5">
          {/* Ohne die Stundenzahl daneben: Sie steht eine Zeile tiefer noch
              einmal, dort mit ihrem Zielbereich, und im Hero ein drittes Mal.
              Zweimal reicht — einmal als Überblick, einmal mit Referenz. */}
          <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-muted">
            {t('health.metrics.lastNight')}
          </Text>

          {/* Die Dauer steht **vor** dem Diagramm: Sie ist die Klammer um die
              Nacht, die das Diagramm dann aufteilt. */}
          {duration === undefined ? null : (
            <NightMetricRow row={duration} formatHours={formatHours} />
          )}

          {analysis.lastNight.hasStageDetail ? (
            <>
              <View className="h-px bg-border-hairline" />
              <View className="pt-3.5 gap-3.5">
                <NightChart
                  night={analysis.lastNight}
                  curve={heartRateCurve}
                  restingBand={restingBand}
                  formatHour={formatHour}
                />
                {vitalsLine === null ? null : (
                  <Text className="text-[12.5px] text-muted">{vitalsLine}</Text>
                )}
              </View>

              <View className="divide-y divide-border-hairline border-t border-border-hairline mt-3.5">
                {detail.map(row => (
                  <NightMetricRow
                    key={row.key}
                    row={row}
                    formatHours={formatHours}
                  />
                ))}
              </View>
            </>
          ) : (
            // Eine CLASSIC-Nacht trägt nur „schlafend" und „wach" — Phasen zu
            // zeichnen hieße, eine Messung zu behaupten, die es nicht gibt.
            <Text className="text-[12.5px] text-muted leading-[18px] pb-4">
              {t('health.metrics.noStageDetail')}
            </Text>
          )}
        </View>
      ) : null}
    </Animated.View>
  );
}
