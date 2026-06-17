import { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Portal } from 'heroui-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '@/components/clay/Button';
import { Card } from '@/components/clay/Card';
import { StepDots } from '@/components/clay/StepDots';
import { motion } from '@/theme/tokens';
import { useTourStore } from '@/stores/tourStore';
import { TOUR_STEPS } from './tourSteps';

const PORTAL_NAME = 'introduction-tour';

// Drives the visible tab so each step is shown on its real screen. Kept as a
// minimal prop so MainTabs only has to forward whatever navigation it already
// has — see ConnectedTourOverlay.
type TourOverlayProps = {
  onFocusTab: (tabName: string) => void;
};

export function TourOverlay({ onFocusTab }: TourOverlayProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const active = useTourStore(s => s.active);
  const step = useTourStore(s => s.step);
  const nextStep = useTourStore(s => s.nextStep);
  const completeTour = useTourStore(s => s.completeTour);
  const skipTour = useTourStore(s => s.skipTour);

  const totalSteps = TOUR_STEPS.length;
  const isLastStep = step >= totalSteps - 1;
  const currentStep = TOUR_STEPS[Math.min(step, totalSteps - 1)];

  const cardTranslate = useSharedValue(16);

  // Switch the visible tab whenever the step changes.
  useEffect(() => {
    if (!active || !currentStep) {
      return;
    }
    onFocusTab(currentStep.tab);
  }, [active, currentStep, onFocusTab]);

  // Re-play a small slide-up each time the step (and thus the copy) changes.
  useEffect(() => {
    if (!active) {
      return;
    }
    cardTranslate.value = 16;
    cardTranslate.value = withTiming(0, {
      duration: motion.base,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, step, cardTranslate]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslate.value }],
  }));

  if (!active || !currentStep) {
    return null;
  }

  return (
    <Portal name={PORTAL_NAME}>
      <Animated.View
        entering={FadeIn.duration(motion.base)}
        exiting={FadeOut.duration(motion.fast)}
        pointerEvents="auto"
        className="absolute inset-0 justify-end bg-[rgba(20,22,16,0.55)]"
        style={{ paddingBottom: insets.bottom + 92, paddingHorizontal: 18 }}
      >
        <Animated.View style={cardStyle}>
          <Card variant="float" radius="2xl" pad={24}>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted text-[11px] font-bold tracking-[1.1px] uppercase">
                {`${step + 1} / ${totalSteps}`}
              </Text>
              <StepDots current={step} total={totalSteps} />
            </View>

            <Text className="mt-4 text-foreground text-[22px] font-bold tracking-[-0.4px]">
              {t(currentStep.titleKey)}
            </Text>
            <Text className="mt-2.5 text-muted text-[15px] leading-[22px]">
              {t(currentStep.descriptionKey)}
            </Text>

            <View className="mt-6 flex-row items-center gap-3">
              {!isLastStep && (
                <Button
                  variant="ghost"
                  size="md"
                  className="flex-1"
                  onPress={skipTour}
                >
                  {t('tour.skip')}
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onPress={isLastStep ? completeTour : nextStep}
              >
                {isLastStep ? t('tour.gotIt') : t('tour.next')}
              </Button>
            </View>
          </Card>
        </Animated.View>
      </Animated.View>
    </Portal>
  );
}

// Connects the overlay to React Navigation so stepping switches tabs. The
// overlay is mounted in MainTabs as a sibling of <Tab.Navigator>, so its
// navigation context is the parent stack (route "Main"), not the tab navigator.
// Switching a tab therefore needs the nested form — navigate to "Main" with the
// target tab as the nested `screen` — rather than navigating the tab by name.
export function ConnectedTourOverlay() {
  const navigation = useNavigation();

  // Stable identity: TourOverlay's focus effect depends on this callback, so an
  // inline arrow would re-fire the effect every render → dispatch → re-render,
  // an infinite update loop. useNavigation()'s object is itself stable.
  const onFocusTab = useCallback(
    (tabName: string) => {
      navigation.dispatch(CommonActions.navigate('Main', { screen: tabName }));
    },
    [navigation],
  );

  return <TourOverlay onFocusTab={onFocusTab} />;
}
