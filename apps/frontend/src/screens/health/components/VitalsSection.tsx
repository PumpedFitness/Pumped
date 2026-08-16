import { useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '@pumped/ui/clay/SegmentedControl';
import { colors } from '@pumped/ui/theme/tokens';
import type { HealthSnapshot } from '@/hooks/useHealthSnapshot';
import { isAnnotatedAway } from '@/lib/health/algorithms/annotations';
import { formatChartDate } from '../formatMetric';
import { VitalCard } from './VitalCard';

const RANGES = [7, 30, 90] as const;

type Range = (typeof RANGES)[number];

const SCREEN_PADDING = 20;

type VitalsSectionProps = {
  snapshot: HealthSnapshot;
};

/**
 * Alle Größen im Verlauf, eine Karte je Größe.
 *
 * Beobachtungen ohne Gewicht (Tiefschlaf, Hauttemperatur) stehen
 * gleichberechtigt dazwischen: Für die Frage „wie war meine Woche" ist es
 * unerheblich, ob eine Größe in einem Modell ein Term ist.
 */
export function VitalsSection({ snapshot }: VitalsSectionProps) {
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const [range, setRange] = useState<Range>(30);

  const entries = [...snapshot.result.contributions, ...snapshot.observations];
  const longestSpan = Math.max(
    1,
    ...entries.map(entry => snapshot.spanFor(entry.metric)),
  );
  // Ein Fenster anzubieten, das die Historie nicht deckt, wäre eine stille
  // Lüge über die Datenlage.
  const available = RANGES.filter(
    (days, index) => index === 0 || days <= longestSpan,
  );
  const active = available.includes(range) ? range : available[0];

  // Die Legende nur zeigen, wenn im gewählten Fenster überhaupt etwas getönt
  // ist — eine Erklärung für ein Muster, das gerade nirgends vorkommt, ist
  // Rauschen.
  const hasAnnotatedDays = entries.some(entry =>
    snapshot
      .pointsFor(entry.metric, active)
      .some(point => isAnnotatedAway(snapshot.annotations, point.date)),
  );

  return (
    <View className="gap-3">
      <SegmentedControl
        value={String(active)}
        options={available.map(days => ({
          value: String(days),
          label: t('health.metrics.rangeDays', { days }),
        }))}
        onChange={value => setRange(Number(value) as Range)}
      />

      {hasAnnotatedDays ? (
        <View className="flex-row items-center gap-2">
          <View
            className="h-3 w-5 rounded-[3px]"
            style={{ backgroundColor: colors.accent, opacity: 0.1 }}
          />
          <Text className="flex-1 text-[11.5px] text-muted">
            {t('health.metrics.annotatedLegend')}
          </Text>
        </View>
      ) : null}

      {entries.map(entry => (
        <VitalCard
          key={entry.metric}
          contribution={entry}
          points={snapshot.pointsFor(entry.metric, active)}
          width={width - SCREEN_PADDING * 2}
          formatDate={date => formatChartDate(date, i18n.language)}
          annotations={snapshot.annotations}
        />
      ))}
    </View>
  );
}
