import { useCallback } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '@pumped/ui/clay/Button';
import { Card } from '@pumped/ui/clay/Card';
import { RingGauge } from '@pumped/ui/clay/RingGauge';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import {
  WeekBlocks,
  weekBlockProgress,
} from '@/components/schedule/WeekBlocks';
import { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import { useHealthSnapshot } from '@/hooks/useHealthSnapshot';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';
import { useScheduleWeek } from '@/hooks/useScheduleWeek';
import { useTodayWorkout } from '@/hooks/useTodayWorkout';
import { useHealthSettingsStore } from '@/stores/healthSettingsStore';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { openCurrentWorkout } from '@/navigation/openCurrentWorkout';
import {
  buildRecoveryReadout,
  buildTodayCard,
  type RecoveryReadout,
  type TodayActionKind,
  type TodayBadge,
} from './todaySessionModel';

type WidgetProps = { colSpan: number; width: number };

const CREAM = (a: number) => `rgba(244, 242, 239, ${a})`;

const HAIRLINE = {
  height: 1,
  backgroundColor: CREAM(0.14),
} as const;

type StatusBadgeProps = { badge: Exclude<TodayBadge, null> };

function StatusBadge({ badge }: StatusBadgeProps) {
  const { t } = useTranslation();
  const done = badge === 'done';
  return (
    <View
      className="flex-row items-center gap-1 rounded-full px-2.5 py-1.5"
      style={{ backgroundColor: done ? CREAM(0.16) : CREAM(0.08) }}
    >
      <ClayIcon
        name={done ? 'check' : 'skip'}
        size={11}
        color={done ? colors.cream : CREAM(0.55)}
      />
      <Text
        className="text-[10.5px] font-[700] uppercase tracking-[0.4px]"
        style={{ color: done ? colors.cream : CREAM(0.55) }}
      >
        {t(`widgets.today.badge.${badge}`)}
      </Text>
    </View>
  );
}

type RecoveryRowProps = {
  readout: RecoveryReadout;
  onPress: (() => void) | null;
};

/**
 * The readiness score, sized to be read before the button is pressed.
 *
 * The ring keeps the app's single accent rather than turning red when the
 * score is low: the sentence next to it already carries the verdict, and a
 * traffic light would make an estimate look like a diagnosis.
 */
function RecoveryRow({ readout, onPress }: RecoveryRowProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={onPress === null}
      onPress={onPress ?? undefined}
      className="flex-row items-center gap-3.5 active:opacity-80"
    >
      <RingGauge
        value={readout.percent}
        size={56}
        thickness={6}
        trackColor={CREAM(0.14)}
        fillColor={colors.accentHover}
        centerColor={colors.moss}
      >
        <Text
          className="text-[19px] font-[800] tracking-[-0.5px]"
          style={{ color: colors.cream }}
        >
          {readout.score}
        </Text>
      </RingGauge>
      <View className="flex-1">
        <Text
          className="text-[17px] font-[700] leading-[22px]"
          style={{ color: colors.cream }}
          numberOfLines={2}
        >
          {readout.headline}
        </Text>
        <Text
          className="mt-0.5 text-[12.5px] font-[600]"
          style={{ color: CREAM(0.55) }}
        >
          {t('widgets.today.recoveryCaption', { label: readout.label })}
        </Text>
      </View>
      {onPress ? (
        <ClayIcon name="chevron" size={16} color={CREAM(0.4)} />
      ) : null}
    </Pressable>
  );
}

/**
 * The home screen's main widget: what today asks for, one button to begin it,
 * and the week it sits in.
 *
 * It is a real grid widget rather than fixed chrome — it can be moved, removed
 * and re-added like every other tile. It is seeded into the default layout at
 * the top because "start today's workout" is the reason the screen exists, not
 * because the grid treats it specially.
 */
export function TodaySessionWidget(_props: WidgetProps) {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { today, unskip } = useTodayWorkout();
  const { days } = useScheduleWeek();
  const { nextSession } = useHomeWidgetData();
  const { currentWorkout, startTemplateWorkout } = useCurrentWorkout();
  const health = useHealthSnapshot();
  const sourceConnected = useHealthSettingsStore(
    state => state.sourceConnected,
  );

  const card = buildTodayCard(t, today, nextSession, currentWorkout !== null);
  const recovery = buildRecoveryReadout(t, health.result, health.hasData);
  const progress = weekBlockProgress(days);

  const startTemplate = useCallback(
    (templateId: string) => {
      try {
        startTemplateWorkout(templateId);
        openCurrentWorkout(navigation);
      } catch (error) {
        Alert.alert(
          t('plan.alerts.startFailedTitle'),
          error instanceof Error ? error.message : t('common.tryAgain'),
        );
      }
    },
    [navigation, startTemplateWorkout, t],
  );

  const goToTab = useCallback(
    (screen: string) => {
      navigation.dispatch(
        CommonActions.navigate({ name: 'Main', params: { screen } }),
      );
    },
    [navigation],
  );

  const runAction = useCallback(
    (kind: TodayActionKind) => {
      if (kind === 'resume') {
        openCurrentWorkout(navigation);
        return;
      }
      if (kind === 'browse') {
        goToTab('Schedule');
        return;
      }
      if (kind === 'free') {
        goToTab('Library');
        return;
      }
      if (kind === 'view') {
        if (today.kind === 'done') {
          navigation.navigate('CompletedWorkout', {
            workoutId: today.workout.id,
          });
        }
        return;
      }
      if (today.kind !== 'pending' && today.kind !== 'skipped') return;
      // Starting a day that was written off clears the skip first, so the
      // schedule stops reporting a day the user is standing in the middle of.
      if (kind === 'startAnyway') unskip();
      startTemplate(today.templateId);
    },
    [goToTab, navigation, startTemplate, today, unskip],
  );

  const openRecovery = sourceConnected ? () => goToTab('Recovery') : null;

  return (
    <Card variant="raised" radius="xl" pad={20}>
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <Text
            className="text-[11px] font-[700] uppercase tracking-[1.2px]"
            style={{ color: CREAM(0.5) }}
          >
            {card.eyebrow}
          </Text>
          <Text
            className="mt-1.5 text-[25px] font-[800] leading-[30px] tracking-[-0.6px]"
            style={{ color: colors.cream }}
            numberOfLines={2}
          >
            {card.title}
          </Text>
        </View>
        {card.badge ? <StatusBadge badge={card.badge} /> : null}
      </View>

      {card.meta ? (
        <Text
          className="mt-2 text-[13px] font-[500] leading-[18px]"
          style={{ color: CREAM(0.55) }}
        >
          {card.meta}
        </Text>
      ) : null}

      {recovery ? (
        <>
          <View className="my-[18px]" style={HAIRLINE} />
          <RecoveryRow readout={recovery} onPress={openRecovery} />
        </>
      ) : null}

      <Button
        block
        size="lg"
        elevated={false}
        className="mt-[18px]"
        icon={
          card.actionKind === 'view' ? null : (
            <ClayIcon name="play" size={15} color={colors.onInk} />
          )
        }
        onPress={() => runAction(card.actionKind)}
        testID="today-widget-action"
      >
        {card.actionLabel}
      </Button>

      {card.showWeek ? (
        <>
          <View className="mb-[14px] mt-[18px]" style={HAIRLINE} />
          <View className="mb-2.5 flex-row items-center justify-between">
            <Text
              className="text-[11px] font-[700] uppercase tracking-[1.2px]"
              style={{ color: CREAM(0.5) }}
            >
              {t('widgets.today.weekTitle')}
            </Text>
            <Text
              className="text-[12.5px] font-[700]"
              style={{ color: colors.cream }}
            >
              {t('widgets.today.weekCount', {
                done: progress.done,
                total: progress.planned,
              })}
            </Text>
          </View>
          <WeekBlocks days={days} tone="dark" />
        </>
      ) : null}
    </Card>
  );
}
