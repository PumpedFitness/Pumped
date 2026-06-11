import { useEffect, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { Portal } from 'heroui-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, motion, shadows } from '../../../theme/tokens';
import { RingGauge } from '../../clay/RingGauge';
import { ClayIcon } from '../../icons/ClayIcon';
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        collapsed ? 'Expand workout overlay' : 'Open current workout'
      }
      onPress={collapsed ? onExpand : onOpenWorkout}
      style={({ pressed }) => ({
        width: COLLAPSED_WIDTH,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? 'rgba(243, 238, 226, 0.08)' : 'transparent',
      })}
    >
      <RingGauge
        value={percentage}
        size={58}
        thickness={6}
        trackColor="rgba(243, 238, 226, 0.18)"
        fillColor={colors.accent}
        centerColor={colors.mossDeep}
      >
        <Text
          style={{
            color: colors.cream,
            fontSize: 14,
            fontWeight: '700',
            letterSpacing: -0.3,
          }}
        >
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open current workout"
      onPress={onOpenWorkout}
      style={({ pressed }) => ({
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 6,
        opacity: pressed ? 0.72 : 1,
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            backgroundColor: colors.accent,
          }}
        />
        <Text
          style={{
            color: colors.creamDim,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 1.05,
            textTransform: 'uppercase',
          }}
        >
          Workout in progress
        </Text>
      </View>
      <Text
        numberOfLines={1}
        style={{
          marginTop: 7,
          color: colors.cream,
          fontSize: 18,
          fontWeight: '700',
          letterSpacing: -0.25,
        }}
      >
        {workoutName}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          marginTop: 5,
          color: colors.creamDim,
          fontSize: 12.5,
          fontWeight: '500',
        }}
      >
        {completedSets} of {totalSets} sets
        {'  ·  '}
        {elapsedTime}
      </Text>
      {currentExerciseName ? (
        <Text
          numberOfLines={1}
          style={{
            marginTop: 3,
            color: colors.cream,
            fontSize: 12.5,
            fontWeight: '600',
          }}
        >
          Up next: {currentExerciseName}
        </Text>
      ) : null}
    </Pressable>
  );
}

type CollapseButtonProps = {
  onCollapse: () => void;
};

function CollapseButton({ onCollapse }: CollapseButtonProps) {
  return (
    <View
      style={{
        width: 48,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderLeftColor: colors.lineOnMoss,
        borderLeftWidth: 1,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Collapse workout overlay"
        onPress={onCollapse}
        style={({ pressed }) => ({
          width: 34,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 17,
          backgroundColor: pressed
            ? 'rgba(243, 238, 226, 0.13)'
            : 'rgba(243, 238, 226, 0.07)',
        })}
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
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(MAX_CARD_WIDTH, windowWidth - 20);
  const [collapsed, setCollapsed] = useState(false);
  const translateX = useSharedValue(cardWidth);
  const progress = getWorkoutOverlayProgress(completedSets, totalSets);
  const elapsedTime = formatWorkoutElapsedTime(elapsedMinutes);

  useEffect(() => {
    const target = visible
      ? collapsed
        ? cardWidth - COLLAPSED_WIDTH
        : 0
      : cardWidth;

    translateX.value = withTiming(target, {
      duration: visible ? motion.slow : motion.base,
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
        style={{
          position: 'absolute',
          top: insets.top + 68,
          left: 0,
          right: 0,
          alignItems: 'flex-end',
        }}
      >
        <Animated.View
          accessibilityLabel={`${workoutName}, ${progress.completedSets} of ${progress.totalSets} sets completed`}
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
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              overflow: 'hidden',
              borderTopLeftRadius: 30,
              borderBottomLeftRadius: 30,
              backgroundColor: colors.moss,
              borderColor: colors.lineOnMoss,
              borderWidth: 1,
              borderRightWidth: 0,
            }}
          >
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
