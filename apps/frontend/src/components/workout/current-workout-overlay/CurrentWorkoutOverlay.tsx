import { useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Portal } from 'heroui-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { colors, shadows } from '@/theme/tokens';
import { RingGauge } from '@/components/clay/RingGauge';
import { ClayIcon } from '@/components/icons/ClayIcon';
import {
  formatWorkoutElapsedTime,
  getWorkoutOverlayProgress,
} from './currentWorkoutOverlayModel';
import {
  CARD_HEIGHT,
  MAX_CARD_WIDTH,
  useDraggableOverlay,
} from './useDraggableOverlay';

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
  side: number;
  currentExerciseName?: string;
  onOpenWorkout?: () => void;
};

function WorkoutDetails({
  workoutName,
  completedSets,
  totalSets,
  elapsedTime,
  side,
  currentExerciseName,
  onOpenWorkout,
}: WorkoutDetailsProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('currentWorkout.overlay.openA11y')}
      onPress={onOpenWorkout}
      className={`flex-1 h-full justify-center active:opacity-[0.72] ${
        side === 1 ? 'pr-[6px]' : 'pl-[6px]'
      }`}
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
  side: number;
  onCollapse: () => void;
};

function CollapseButton({ side, onCollapse }: CollapseButtonProps) {
  const { t } = useTranslation();

  return (
    <View
      className={`w-12 h-full items-center justify-center ${
        side === 1
          ? 'border-r border-r-border-on-moss'
          : 'border-l border-l-border-on-moss'
      }`}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('currentWorkout.overlay.collapseA11y')}
        onPress={onCollapse}
        className="w-[34px] h-12 items-center justify-center rounded-[17px] bg-[rgba(243,238,226,0.07)] active:bg-[rgba(243,238,226,0.13)]"
      >
        {/* Chevron points toward the edge the card collapses into. */}
        <View style={{ transform: [{ scaleX: side === 1 ? -1 : 1 }] }}>
          <ClayIcon
            name="chevron"
            size={17}
            stroke={2}
            color={colors.creamDim}
          />
        </View>
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

  const progress = getWorkoutOverlayProgress(completedSets, totalSets);
  const elapsedTime = formatWorkoutElapsedTime(t, elapsedMinutes);

  const { gesture, animatedStyle, side } = useDraggableOverlay({
    visible,
    collapsed,
    cardWidth,
  });

  if (!visible) {
    return null;
  }

  const progressButton = (
    <WorkoutProgressButton
      collapsed={collapsed}
      percentage={progress.percentage}
      onExpand={() => setCollapsed(false)}
      onOpenWorkout={onOpenWorkout}
    />
  );
  const details = (
    <WorkoutDetails
      workoutName={workoutName}
      completedSets={progress.completedSets}
      totalSets={progress.totalSets}
      elapsedTime={elapsedTime}
      side={side}
      currentExerciseName={currentExerciseName}
      onOpenWorkout={onOpenWorkout}
    />
  );
  const collapseButton = (
    <CollapseButton side={side} onCollapse={() => setCollapsed(true)} />
  );

  return (
    <Portal name={PORTAL_NAME}>
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0"
        style={{
          top: insets.top + 68,
          alignItems: side === 1 ? 'flex-start' : 'flex-end',
        }}
      >
        <GestureDetector gesture={gesture}>
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
                borderTopLeftRadius: side === 1 ? 0 : 30,
                borderBottomLeftRadius: side === 1 ? 0 : 30,
                borderTopRightRadius: side === 1 ? 30 : 0,
                borderBottomRightRadius: side === 1 ? 30 : 0,
              },
              shadows.raised,
              animatedStyle,
            ]}
          >
            <View
              style={{
                borderColor: colors.lineOnMoss,
                borderWidth: 1,
                borderLeftWidth: side === 1 ? 0 : 1,
                borderRightWidth: side === 1 ? 1 : 0,
                borderTopLeftRadius: side === 1 ? 0 : 30,
                borderBottomLeftRadius: side === 1 ? 0 : 30,
                borderTopRightRadius: side === 1 ? 30 : 0,
                borderBottomRightRadius: side === 1 ? 30 : 0,
              }}
              className="flex-1 flex-row items-center overflow-hidden bg-moss"
            >
              {side === 1 ? (
                <>
                  {collapseButton}
                  {details}
                  {progressButton}
                </>
              ) : (
                <>
                  {progressButton}
                  {details}
                  {collapseButton}
                </>
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Portal>
  );
}
