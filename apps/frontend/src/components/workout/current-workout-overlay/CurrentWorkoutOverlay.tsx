import { useEffect, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Portal } from 'heroui-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, motion, shadows } from '@/theme/tokens';
import { RingGauge } from '@/components/clay/RingGauge';
import { ClayIcon } from '@/components/icons/ClayIcon';
import {
  formatWorkoutElapsedTime,
  getWorkoutOverlayProgress,
} from './currentWorkoutOverlayModel';

const COLLAPSED_WIDTH = 76;
const MAX_CARD_WIDTH = 354;
const CARD_HEIGHT = 126;
const PORTAL_NAME = 'current-workout-overlay';

export type CurrentWorkoutOverlayProps = {
  visible: boolean;
  workoutName: string;
  completedSets: number;
  totalSets: number;
  elapsedMinutes?: number;
  currentExerciseName?: string;
  onOpenWorkout?: () => void;
};

type WorkoutProgressButtonProps = {
  collapsed: boolean;
  percentage: number;
  onExpand: () => void;
  onOpenWorkout?: () => void;
};

function WorkoutProgressButton({
  collapsed,
  percentage,
  onExpand,
  onOpenWorkout,
}: WorkoutProgressButtonProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        collapsed
          ? t('currentWorkout.overlay.expandA11y')
          : t('currentWorkout.overlay.openA11y')
      }
      onPress={collapsed ? onExpand : onOpenWorkout}
      className="w-[76px] h-full items-center justify-center active:bg-[rgba(243,238,226,0.08)]"
    >
      <RingGauge
        value={percentage}
        size={58}
        thickness={6}
        trackColor="rgba(243, 238, 226, 0.18)"
        fillColor={colors.accent}
        centerColor={colors.mossDeep}
      >
        <Text className="text-cream text-sm font-bold tracking-[-0.3px]">
          {percentage}%
        </Text>
      </RingGauge>
    </Pressable>
  );
}

type WorkoutDetailsProps = {
  workoutName: string;
  completedSets: number;
  totalSets: number;
  elapsedTime: string;
  currentExerciseName?: string;
  onOpenWorkout?: () => void;
};

function WorkoutDetails({
  workoutName,
  completedSets,
  totalSets,
  elapsedTime,
  currentExerciseName,
  onOpenWorkout,
}: WorkoutDetailsProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('currentWorkout.overlay.openA11y')}
      onPress={onOpenWorkout}
      className="flex-1 h-full justify-center pl-[6px] active:opacity-[0.72]"
    >
      <View className="flex-row items-center gap-[7px]">
        <View className="w-[7px] h-[7px] rounded-full bg-accent" />
        <Text className="text-cream-dim text-[10px] font-bold tracking-[1.05px] uppercase">
          {t('currentWorkout.inProgress')}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        className="mt-[7px] text-cream text-lg font-bold tracking-[-0.25px]"
      >
        {workoutName}
      </Text>
      <Text
        numberOfLines={1}
        className="mt-[5px] text-cream-dim text-[12.5px] font-medium"
      >
        {t('currentWorkout.overlay.setsOf', {
          completed: completedSets,
          total: totalSets,
        })}
        {'  ·  '}
        {elapsedTime}
      </Text>
      {currentExerciseName ? (
        <Text
          numberOfLines={1}
          className="mt-[3px] text-cream text-[12.5px] font-semibold"
        >
          {t('currentWorkout.overlay.upNext', {
            exercise: currentExerciseName,
          })}
        </Text>
      ) : null}
    </Pressable>
  );
}

type CollapseButtonProps = {
  onCollapse: () => void;
};

function CollapseButton({ onCollapse }: CollapseButtonProps) {
  const { t } = useTranslation();

  return (
    <View className="w-12 h-full items-center justify-center border-l border-l-border-on-moss">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('currentWorkout.overlay.collapseA11y')}
        onPress={onCollapse}
        className="w-[34px] h-12 items-center justify-center rounded-[17px] bg-[rgba(243,238,226,0.07)] active:bg-[rgba(243,238,226,0.13)]"
      >
        <ClayIcon name="chevron" size={17} stroke={2} color={colors.creamDim} />
      </Pressable>
    </View>
  );
}

export function CurrentWorkoutOverlay({
  visible,
  workoutName,
  completedSets,
  totalSets,
  elapsedMinutes = 0,
  currentExerciseName,
  onOpenWorkout,
}: CurrentWorkoutOverlayProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(MAX_CARD_WIDTH, windowWidth - 20);
  const [collapsed, setCollapsed] = useState(false);
  const translateX = useSharedValue(cardWidth);
  const progress = getWorkoutOverlayProgress(completedSets, totalSets);
  const elapsedTime = formatWorkoutElapsedTime(t, elapsedMinutes);

  useEffect(() => {
    if (!visible) {
      // Nothing renders while hidden (the component returns null below), so
      // an exit animation can never play — just park the card off-screen so
      // the next show slides in from the edge.
      translateX.value = cardWidth;
      return;
    }

    translateX.value = withTiming(collapsed ? cardWidth - COLLAPSED_WIDTH : 0, {
      duration: motion.slow,
      easing: Easing.out(Easing.cubic),
    });
  }, [cardWidth, collapsed, translateX, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <Portal name={PORTAL_NAME}>
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 items-end"
        style={{ top: insets.top + 68 }}
      >
        <Animated.View
          accessibilityLabel={t('currentWorkout.overlay.progressA11y', {
            name: workoutName,
            completed: progress.completedSets,
            total: progress.totalSets,
          })}
          style={[
            {
              width: cardWidth,
              height: CARD_HEIGHT,
              borderTopLeftRadius: 30,
              borderBottomLeftRadius: 30,
            },
            shadows.raised,
            animatedStyle,
          ]}
        >
          <View className="flex-1 flex-row items-center overflow-hidden rounded-l-[30px] bg-moss border border-r-0 border-border-on-moss">
            <WorkoutProgressButton
              collapsed={collapsed}
              percentage={progress.percentage}
              onExpand={() => setCollapsed(false)}
              onOpenWorkout={onOpenWorkout}
            />
            <WorkoutDetails
              workoutName={workoutName}
              completedSets={progress.completedSets}
              totalSets={progress.totalSets}
              elapsedTime={elapsedTime}
              currentExerciseName={currentExerciseName}
              onOpenWorkout={onOpenWorkout}
            />
            <CollapseButton onCollapse={() => setCollapsed(true)} />
          </View>
        </Animated.View>
      </View>
    </Portal>
  );
}
