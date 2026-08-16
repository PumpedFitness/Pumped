import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { TrackIllnessSheet } from '@/components/health/TrackIllnessSheet';
import { endAnnotation } from '@/data/local/health/annotationStore';
import {
  openAnnotation,
  type Annotation,
} from '@/lib/health/algorithms/annotations';
import {
  civilDateFromLocal,
  civilDateToUTCDate,
  type CivilDate,
} from '@/lib/health/civilDate';
import type { MetricSeries } from '@/lib/health/metrics';
import {
  illnessPeriods,
  illnessYear,
  illnessYears,
  type IllnessPeriod,
} from '../illnessHistoryModel';
import { formatChartDate } from '../formatMetric';
import { IllnessDetailSheet } from './IllnessDetailSheet';

type IllnessPanelProps = {
  annotations: readonly Annotation[];
  series: MetricSeries;
  referenceDate: CivilDate;
  locale: string;
};

/** Ab so vielen Tagen im Monat ist der Block voll eingefärbt. */
const MONTH_SATURATION_DAYS = 5;

type YearStripProps = {
  months: readonly { month: number; days: number }[];
  locale: string;
};

/**
 * Zwölf Blöcke, einer je Monat.
 *
 * Die Deckkraft steigt mit den Krankheitstagen und sättigt bei fünf: Ein Monat
 * mit zwölf kranken Tagen ist nicht doppelt so dunkel wie einer mit sechs,
 * sondern beide sind „viel". Die genaue Zahl steht ohnehin in der Liste
 * darunter; hier geht es um die Verteilung übers Jahr.
 */
function YearStrip({ months, locale }: YearStripProps) {
  const { t } = useTranslation();
  return (
    <View className="mt-3 flex-row gap-[3px]">
      {months.map(entry => {
        const initial = civilDateToUTCDate(20260101 + entry.month * 100)
          .toLocaleDateString(locale, { month: 'narrow', timeZone: 'UTC' })
          .slice(0, 1);
        return (
          <View key={entry.month} className="flex-1 items-center gap-1">
            <View
              accessibilityLabel={t('health.illness.monthDays', {
                count: entry.days,
              })}
              className="h-6 w-full rounded-[5px]"
              style={{
                backgroundColor:
                  entry.days === 0 ? colors.track : colors.accent,
                opacity:
                  entry.days === 0
                    ? 1
                    : 0.25 +
                      0.75 * Math.min(1, entry.days / MONTH_SATURATION_DAYS),
              }}
            />
            <Text className="text-[9.5px] font-[600] text-muted">
              {initial}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

type PeriodRowProps = {
  period: IllnessPeriod;
  locale: string;
  onPress: () => void;
};

function PeriodRow({ period, locale, onPress }: PeriodRowProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center gap-3 py-3 active:opacity-70"
      testID={`illness-period-${period.from}`}
    >
      <View className="flex-1">
        <Text className="text-[14px] font-[700] text-foreground">
          {period.from === period.to
            ? formatChartDate(period.from, locale)
            : `${formatChartDate(period.from, locale)} – ${formatChartDate(
                period.to,
                locale,
              )}`}
        </Text>
        <Text className="mt-0.5 text-[12px] text-muted">
          {t(
            period.isOpen
              ? 'health.illness.durationOpen'
              : 'health.illness.duration',
            { count: period.dayCount },
          )}
        </Text>
      </View>
      {period.isOpen ? (
        <View className="rounded-full bg-accent-soft px-2.5 py-1">
          <Text className="text-[10.5px] font-[700] uppercase tracking-[0.4px] text-accent">
            {t('health.sick.ongoingValue')}
          </Text>
        </View>
      ) : null}
      <ClayIcon name="chevron" size={15} color={colors.muted} />
    </Pressable>
  );
}

/**
 * Der Krankheits-Abschnitt: was gerade ist, was das Jahr über war, und jeder
 * Zeitraum einzeln.
 *
 * Eigener Abschnitt und nicht mehr eine Karte unter den Beiträgen, weil das
 * Eintragen nur die halbe Aufgabe ist. Die andere ist der Rückblick — wie oft,
 * wie lange, und was der Körper dabei gemacht hat. Dafür war unter der
 * Beitragsliste kein Platz.
 */
export function IllnessPanel({
  annotations,
  series,
  referenceDate,
  locale,
}: IllnessPanelProps) {
  const { t } = useTranslation();
  const [tracking, setTracking] = useState<{ target?: Annotation | null }>();
  const [detail, setDetail] = useState<IllnessPeriod | null>(null);

  const today = civilDateFromLocal(new Date());
  const open = openAnnotation(annotations, 'sick', today);
  const periods = illnessPeriods(annotations, today);
  const years = illnessYears(periods, today);
  const [year, setYear] = useState(years[0]);
  const summary = illnessYear(periods, years.includes(year) ? year : years[0]);

  return (
    <View className="gap-3">
      {open !== null ? (
        <View className="rounded-[22px] border border-accent-soft bg-accent-soft p-4">
          <Text className="text-[15px] font-[800] text-accent">
            {t('health.sick.since', {
              date: formatChartDate(
                periods.find(p => p.annotation.id === open.id)?.from ?? today,
                locale,
              ),
            })}
          </Text>
          <Text className="mt-1 text-[12.5px] leading-[17px] text-foreground">
            {t('health.illness.openBody')}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => endAnnotation(open.id, today)}
            className="mt-2.5 self-start rounded-full bg-accent px-3.5 py-2 active:opacity-80"
            testID="sick-recovered"
          >
            <Text className="text-[12.5px] font-[700] text-accent-foreground">
              {t('health.sick.recovered')}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => setTracking({ target: null })}
        className="flex-row items-center gap-3 rounded-[22px] border border-border-hairline bg-surface-card p-4 active:opacity-70"
        testID="track-illness"
      >
        <ClayIcon name="pulse" size={17} color={colors.accent} />
        <View className="flex-1">
          <Text className="text-[14.5px] font-[700] text-foreground">
            {t('health.sick.track')}
          </Text>
          <Text className="mt-0.5 text-[12.5px] leading-[17px] text-muted">
            {t('health.sick.trackHint')}
          </Text>
        </View>
        <ClayIcon name="chevron" size={15} color={colors.muted} />
      </Pressable>

      <View className="rounded-[22px] border border-border-hairline bg-surface-card p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] font-semibold text-foreground">
            {summary.year}
          </Text>
          <Text className="text-[12.5px] text-muted">
            {t('health.illness.yearSummary', {
              count: summary.count,
              days: summary.totalDays,
            })}
          </Text>
        </View>

        <YearStrip months={summary.months} locale={locale} />

        {years.length > 1 ? (
          <View className="mt-3 flex-row gap-1.5">
            {years.slice(0, 4).map(entry => (
              <Pressable
                key={entry}
                accessibilityRole="button"
                onPress={() => setYear(entry)}
                className={
                  'rounded-full px-3 py-1.5 active:opacity-70 ' +
                  (entry === summary.year ? 'bg-ink' : 'bg-surface-sunk')
                }
              >
                <Text
                  className={
                    'text-[11.5px] font-[700] ' +
                    (entry === summary.year ? 'text-cream' : 'text-muted')
                  }
                >
                  {entry}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      {periods.length === 0 ? (
        <View className="items-center rounded-[22px] border border-border-hairline bg-surface-card px-6 py-8">
          <ClayIcon name="check" size={22} color={colors.muted} />
          <Text className="mt-3 text-center text-[14px] font-semibold text-foreground">
            {t('health.illness.emptyTitle')}
          </Text>
          <Text className="mt-1 text-center text-[12.5px] leading-[17px] text-muted">
            {t('health.illness.emptyBody')}
          </Text>
        </View>
      ) : (
        <View className="rounded-[22px] border border-border-hairline bg-surface-card px-4 divide-y divide-border-hairline">
          {periods.map(period => (
            <PeriodRow
              key={period.annotation.id}
              period={period}
              locale={locale}
              onPress={() => setDetail(period)}
            />
          ))}
        </View>
      )}

      <IllnessDetailSheet
        period={detail}
        series={series}
        annotations={annotations}
        referenceDate={referenceDate}
        locale={locale}
        onClose={() => setDetail(null)}
        onEdit={annotation => {
          setDetail(null);
          setTracking({ target: annotation });
        }}
      />

      {/* Montiert bleiben und nur `visible` schalten: Ein erst beim Öffnen
          eingehängtes Blatt präsentiert heroui nicht zuverlässig. */}
      <TrackIllnessSheet
        visible={tracking !== undefined}
        target={tracking?.target}
        onClose={() => setTracking(undefined)}
      />
    </View>
  );
}
