import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from 'heroui-native';
import { AppBottomSheet } from '@pumped/ui/forms/AppBottomSheet';
import { Button } from '@pumped/ui/clay/Button';
import { deleteAnnotation } from '@/data/local/health/annotationStore';
import {
  annotationSpan,
  type Annotation,
} from '@/lib/health/algorithms/annotations';
import {
  ILLNESS_REVIEW_GROUPS,
  MINIMUM_SAMPLES,
  summariseIllness,
  type IllnessMetricRow,
} from '@/lib/health/algorithms/illness';
import type { CivilDate } from '@/lib/health/civilDate';
import type { Metric, MetricSeries } from '@/lib/health/metrics';
import { useNoticesStore } from '@/stores/noticesStore';
import type { IllnessPeriod } from '../illnessHistoryModel';
import { formatChartDate, formatMetric, METRIC_UNIT } from '../formatMetric';

type IllnessDetailSheetProps = {
  period: IllnessPeriod | null;
  series: MetricSeries;
  annotations: readonly Annotation[];
  referenceDate: CivilDate;
  locale: string;
  onClose: () => void;
  onEdit: (annotation: Annotation) => void;
};

/**
 * Ab hier gilt eine Größe als auffällig — dieselbe Schwelle wie in der
 * Erkennung, damit derselbe Zeitraum nicht an zwei Stellen anders beurteilt
 * wird.
 */
const NOTABLE_Z = -1.5;

function withUnit(metric: Metric, value: number): string {
  const unit = METRIC_UNIT[metric];
  return `${formatMetric(metric, value)}${unit === '' ? '' : ` ${unit}`}`;
}

/**
 * Eine Größe im Rückblick.
 *
 * Zwei Zeilen statt drei Spalten: Messwert und Referenz gehören
 * untereinander — „48 ms, sonst 79 ms" ist ein Satz, und in getrennte Spalten
 * gelegt liest ihn niemand als einen.
 *
 * Fehlt etwas, steht **warum** dort und nicht ein Strich. „Nicht
 * aufgezeichnet" und „noch zu wenig Historie" sind verschiedene Mängel mit
 * verschiedenen Abhilfen, und ein Gedankenstrich für beide zwingt den Nutzer
 * zum Raten.
 */
function MetricRow({ row }: { row: IllnessMetricRow }) {
  const { t } = useTranslation();
  const notable = row.z !== null && row.z <= NOTABLE_Z;

  return (
    <View className="flex-row items-start gap-3 py-2.5">
      <View className="flex-1">
        <Text className="text-[13.5px] font-[600] text-foreground">
          {t(`health.metric.${row.metric}`)}
        </Text>
        <Text className="mt-0.5 text-[11.5px] text-muted">
          {row.baseline === null
            ? t('health.illness.needHistory', {
                have: row.sampleCount,
                need: MINIMUM_SAMPLES,
              })
            : t('health.illness.usually', {
                value: withUnit(row.metric, row.baseline),
              })}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className={
            'text-[14px] font-[700] ' +
            (row.average === null ? 'text-muted' : 'text-foreground')
          }
        >
          {row.average === null
            ? t('health.illness.notRecorded')
            : withUnit(row.metric, row.average)}
        </Text>
        {row.z !== null ? (
          <Text
            className={
              'mt-0.5 text-[11.5px] font-[700] ' +
              (notable ? 'text-accent' : 'text-muted')
            }
          >
            {t(
              notable
                ? 'health.illness.deviation'
                : 'health.illness.deviationNormal',
              { sigma: Math.abs(row.z).toFixed(1) },
            )}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Ein einzelner Krankheitszeitraum im Rückblick.
 *
 * Zeigt Kreislauf **und** Schlaf, jeweils vollständig — auch die unauffälligen
 * Größen. Dass die Atmung normal blieb, während HRV und Puls ausschlugen, ist
 * Teil des Bildes; und wie der Schlaf in diesen Tagen aussah, ist meistens das,
 * woran man sich erinnert.
 *
 * Die Abweichung steht als Betrag da — die Richtung liegt schon in der Aussage
 * „daneben", und ein Minus vor dem gestiegenen Ruhepuls läse sich verkehrt.
 */
export function IllnessDetailSheet({
  period,
  series,
  annotations,
  referenceDate,
  locale,
  onClose,
  onEdit,
}: IllnessDetailSheetProps) {
  const { t } = useTranslation();
  const restore = useNoticesStore(state => state.restore);

  const rows =
    period === null
      ? []
      : summariseIllness({
          series,
          from: period.from,
          to: period.to,
          annotations,
          referenceDate,
        });

  const byMetric = new Map(rows.map(row => [row.metric, row]));
  const recorded = rows.some(row => row.average !== null);

  const remove = () => {
    if (period === null) return;
    deleteAnnotation(period.annotation.id);
    restore(`illness:${annotationSpan(period.annotation).from}`);
    onClose();
  };

  return (
    <AppBottomSheet open={period !== null} onClose={onClose}>
      <BottomSheet.Overlay />
      <AppBottomSheet.Content backgroundClassName="bg-background">
        <View className="items-center">
          <BottomSheet.Title className="text-[21px] font-bold text-foreground">
            {period === null
              ? ''
              : period.from === period.to
              ? formatChartDate(period.from, locale)
              : `${formatChartDate(period.from, locale)} – ${formatChartDate(
                  period.to,
                  locale,
                )}`}
          </BottomSheet.Title>
          <BottomSheet.Description className="mt-1 text-center text-[13px] text-muted">
            {period === null
              ? ''
              : t(
                  period.isOpen
                    ? 'health.illness.durationOpen'
                    : 'health.illness.duration',
                  { count: period.dayCount },
                )}
          </BottomSheet.Description>
        </View>

        <ScrollView
          className="mt-4 max-h-[380px]"
          showsVerticalScrollIndicator={false}
        >
          {!recorded ? (
            // Der häufigste Fall bei einem nachgetragenen Zeitraum: Die Quelle
            // hat für diese Tage nichts geliefert. Das gehört gesagt, bevor
            // sieben Zeilen „nicht aufgezeichnet" den Eindruck erwecken, die
            // App sei kaputt.
            <View className="mb-3 rounded-[16px] bg-surface-sunk px-4 py-3">
              <Text className="text-[12.5px] leading-[17px] text-muted">
                {t('health.illness.nothingSynced')}
              </Text>
            </View>
          ) : null}

          {ILLNESS_REVIEW_GROUPS.map(group => (
            <View key={group.key} className="mb-3">
              <Text className="mb-1.5 px-1 text-[11px] font-[700] uppercase tracking-[1px] text-muted">
                {t(`health.illness.group.${group.key}`)}
              </Text>
              <View className="rounded-[18px] border border-border-hairline bg-surface-card px-4 divide-y divide-border-hairline">
                {group.metrics.map(metric => {
                  const row = byMetric.get(metric);
                  return row === undefined ? null : (
                    <MetricRow key={metric} row={row} />
                  );
                })}
              </View>
            </View>
          ))}

          <Text className="px-1 text-[12px] leading-[16px] text-muted">
            {t('health.illness.excluded')}
          </Text>
        </ScrollView>

        <View className="mt-4 flex-row gap-2">
          <Button
            size="md"
            variant="ghost"
            className="flex-1"
            onPress={remove}
            testID="illness-detail-delete"
          >
            {t('health.sick.remove')}
          </Button>
          <Button
            size="md"
            className="flex-1"
            elevated={false}
            onPress={() => {
              if (period !== null) onEdit(period.annotation);
            }}
            testID="illness-detail-edit"
          >
            {t('common.edit')}
          </Button>
        </View>
      </AppBottomSheet.Content>
    </AppBottomSheet>
  );
}
