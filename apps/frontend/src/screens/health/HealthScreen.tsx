import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { SegmentedControl } from '@pumped/ui/clay/SegmentedControl';
import { colors, motion } from '@pumped/ui/theme/tokens';
import { ProfileAvatarButton } from '@/components/layout/ProfileAvatarButton';
import { useHealthConnection } from '@/hooks/useHealthConnection';
import { useHealthSnapshot } from '@/hooks/useHealthSnapshot';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  formatChartDate,
  formatMetric,
  greetingKey,
  syncedAtKey,
} from './formatMetric';
import { DeviationRow } from './components/DeviationRow';
import { ReadinessHero } from './components/ReadinessHero';
import { IllnessPanel } from './components/IllnessPanel';
import { ScaleLegend } from './components/ScaleLegend';
import { SleepPanel } from './components/SleepPanel';
import { VitalsSection } from './components/VitalsSection';

const SEGMENTS = ['recovery', 'sleep', 'vitals', 'illness'] as const;

/**
 * Wie oft „vor 3 Minuten" nachgerechnet wird.
 *
 * Ohne das bliebe die Zeile auf dem Stand des letzten Renders stehen und
 * behauptete nach einer Stunde noch „gerade eben" — genau die Aussage, die der
 * Nutzer hier prüfen will.
 */
const CLOCK_TICK_MS = 60_000;

function useMinuteTick(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);
  return now;
}

function GreetingHeader({
  greeting,
  name,
  line,
}: {
  greeting: string;
  name: string;
  line: string;
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="mb-4 flex-row items-start gap-3"
    >
      <View className="flex-1">
        <Text className="text-[30px] font-[800] text-foreground tracking-[-0.9px]">
          {name === '' ? greeting : `${greeting}, ${name}`}
        </Text>
        <Text className="text-[13px] text-muted mt-0.5">{line}</Text>
      </View>
      <View className="pt-0.5">
        <ProfileAvatarButton />
      </View>
    </Animated.View>
  );
}

type HealthSegment = (typeof SEGMENTS)[number];

/**
 * Der Erholungs-Screen.
 *
 * Drei Abschnitte, wie die Fragen morgens aufeinander folgen: **Recovery** ist
 * das Urteil und woraus es entsteht, **Sleep** die Nacht dahinter, **Vitals**
 * die Verläufe. Vorher lag alles in einer langen Bahn und die Vitals hinter
 * einem Verweis auf einen eigenen Screen — der Umschalter stellt die drei auf
 * dieselbe Ebene, wie Library und Plan es auch tun.
 *
 * Jede Zahl kommt mit ihrer Referenz; wo die Historie zu dünn ist, steht der
 * Stand der Historie statt einer erfundenen Spanne.
 */
export function HealthScreen() {
  const { t, i18n } = useTranslation();
  const [segment, setSegment] = useState<HealthSegment>('recovery');
  const snapshot = useHealthSnapshot();
  const connection = useHealthConnection();
  const profile = useUserProfile();
  const { result } = snapshot;

  const name = profile.profile.name.trim();
  const greeting = t(greetingKey(new Date().getHours()));
  const now = useMinuteTick();

  const synced = syncedAtKey(connection.lastSyncedAt, now);
  const refresh = (
    <RefreshControl
      refreshing={connection.isBusy}
      onRefresh={() => {
        // Ohne Verbindung gäbe es nichts zu holen; der Zug liefe ins Leere und
        // endete in einer Fehlermeldung, die nichts erklärt.
        if (connection.isConnected) void connection.sync();
      }}
      tintColor={colors.muted}
    />
  );

  if (!snapshot.hasData) {
    // Auch hier scrollbar, sonst ließe sich ausgerechnet im leeren Zustand
    // nicht nachladen — dort, wo man es am ehesten versucht.
    return (
      <ScrollView
        contentContainerClassName="flex-1 items-center justify-center px-10"
        refreshControl={refresh}
      >
        <ClayIcon name="pulse" size={34} color={colors.muted} />
        <Text className="text-[17px] font-semibold text-foreground mt-4 text-center">
          {t('health.metrics.emptyTitle')}
        </Text>
        <Text className="text-[13.5px] text-muted mt-2 text-center leading-[20px]">
          {t('health.metrics.emptyBody')}
        </Text>
      </ScrollView>
    );
  }

  // Rangfolge: was gerade passiert, dann wie alt die **Messung** ist, sonst
  // wann zuletzt nachgesehen wurde. Die mittlere Stufe hat Vorrang, weil nur
  // sie zum Handeln auffordert — ein frischer Sync über alten Daten sähe sonst
  // nach Aktualität aus.
  const statusLine = connection.isBusy
    ? connection.progressLabel ?? t('health.settings.syncing')
    : snapshot.referenceDate.daysStale > 0
    ? t('health.metrics.stale', { count: snapshot.referenceDate.daysStale })
    : t(synced.key, { count: synced.count });

  return (
    <ScrollView
      contentContainerClassName="px-5 pt-1 pb-8"
      showsVerticalScrollIndicator={false}
      refreshControl={refresh}
    >
      <GreetingHeader
        greeting={greeting}
        name={name}
        line={t('health.metrics.syncedLine', {
          date: formatChartDate(snapshot.referenceDate.date, i18n.language),
          status: statusLine,
        })}
      />

      <SegmentedControl
        className="mb-4"
        value={segment}
        options={SEGMENTS.map(value => ({
          value,
          label: t(`health.segments.${value}`),
        }))}
        onChange={value => setSegment(value as HealthSegment)}
      />

      <Animated.View
        key={segment}
        entering={FadeIn.duration(motion.fast)}
        exiting={FadeOut.duration(motion.fast)}
      >
        {segment === 'recovery' ? (
          <>
            <ReadinessHero
              result={result}
              observations={snapshot.observations}
            />

            <View className="mt-8">
              <View className="flex-row items-baseline justify-between mb-1">
                <Text className="text-[19px] font-[800] text-foreground tracking-[-0.3px]">
                  {t('health.metrics.contributions')}
                </Text>
                <Text className="text-[12px] text-muted">
                  {t('health.metrics.vsWindow', { days: result.params.window })}
                </Text>
              </View>
              <ScaleLegend />
              <View className="rounded-[22px] border border-border-hairline bg-surface-card px-4 divide-y divide-border-hairline">
                {result.contributions.map(entry => (
                  <DeviationRow key={entry.metric} contribution={entry} />
                ))}
              </View>
            </View>
          </>
        ) : null}

        {segment === 'sleep' ? (
          <SleepPanel
            analysis={snapshot.sleep}
            score={snapshot.sleepScore}
            heartRateCurve={snapshot.heartRateCurve}
            breathingByStage={snapshot.nightBreathing}
            restingBand={
              result.contributions.find(entry => entry.metric === 'rhr')
                ?.usualRange ?? null
            }
            restingHeartRate={
              snapshot.series.get('rhr')?.get(snapshot.referenceDate.date) ??
              null
            }
            respiratoryRate={
              snapshot.series.get('resp')?.get(snapshot.referenceDate.date) ??
              null
            }
            formatHours={value => formatMetric('sleep', value)}
            formatHour={epochSeconds =>
              // Feste 24-Stunden-Zählung statt der Gebietsschema-Vorgabe: Auf
              // einer Achse, die über Mitternacht läuft, ist „12 AM" die
              // unklarste aller Zeitangaben.
              new Date(epochSeconds * 1000).toLocaleTimeString(i18n.language, {
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23',
              })
            }
          />
        ) : null}

        {segment === 'vitals' ? <VitalsSection snapshot={snapshot} /> : null}

        {segment === 'illness' ? (
          <IllnessPanel
            annotations={snapshot.annotations}
            series={snapshot.series}
            referenceDate={snapshot.referenceDate.date}
            locale={i18n.language}
          />
        ) : null}
      </Animated.View>
    </ScrollView>
  );
}
