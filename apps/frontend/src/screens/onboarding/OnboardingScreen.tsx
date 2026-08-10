import { useState, useCallback } from 'react';
import { Alert, View, Text, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInLeft,
  FadeInRight,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { WelcomeContent } from './components/WelcomeContent';
import { ProfileStep } from './components/ProfileStep';
import { BodyStep } from './components/BodyStep';
import { ReadyStep } from './components/ReadyStep';
import { WizardCTA } from './components/WizardCTA';
import { useOnboardingDraft } from './useOnboardingDraft';

const STEPS = ['welcome', 'profile', 'body', 'ready'] as const;

type WizardStep = (typeof STEPS)[number];

function ctaLabelKey(
  step: WizardStep,
  isLast: boolean,
): 'onboarding.cta.getStarted' | 'onboarding.cta.startTraining' | 'onboarding.cta.continue' {
  if (step === 'welcome') return 'onboarding.cta.getStarted';
  if (isLast) return 'onboarding.cta.startTraining';
  return 'onboarding.cta.continue';
}

type StepTicksProps = { activeCount: number; total: number };

function StepTicks({ activeCount, total }: StepTicksProps) {
  return (
    <View className="flex-row gap-1.5 w-[130px]">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          className={
            'h-[3px] flex-1 rounded-full ' +
            (i < activeCount ? 'bg-accent' : 'bg-[rgba(27,26,24,0.12)]')
          }
        />
      ))}
    </View>
  );
}

type WizardTopBarProps = {
  stepIndex: number;
  isLast: boolean;
  onBack: () => void;
  onSkip: () => void;
};

function WizardTopBar({
  stepIndex,
  isLast,
  onBack,
  onSkip,
}: WizardTopBarProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center px-5 h-[52px]">
      {stepIndex > 0 ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.backA11y')}
          className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
        >
          <ClayIcon name="back" size={22} color={colors.ink} />
        </Pressable>
      ) : (
        <View className="w-10" />
      )}

      <View
        className={'flex-1 items-center ' + (stepIndex === 0 ? 'opacity-0' : '')}
      >
        <StepTicks activeCount={stepIndex} total={STEPS.length - 1} />
      </View>

      {isLast ? (
        <View className="w-10" />
      ) : (
        <Pressable onPress={onSkip} className="py-2 px-2 active:opacity-50">
          <Text className="text-[15px] font-medium text-muted">
            {t('onboarding.skip')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function OnboardingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const draft = useOnboardingDraft();

  const step: WizardStep = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const showGhostNumeral = stepIndex > 0 && !isLast;

  const goNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setDirection(1);
    setStepIndex(prev => Math.min(prev + 1, STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStepIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const finishSetup = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    draft.finish();
  }, [draft]);

  const skip = useCallback(() => {
    const hasProgress = draft.fields.name.trim() !== '';
    if (!hasProgress) {
      draft.finish();
      return;
    }
    // Selections exist — a stray tap on Skip must not silently discard them.
    Alert.alert(
      t('onboarding.skipConfirm.title'),
      t('onboarding.skipConfirm.body'),
      [
        { text: t('onboarding.skipConfirm.stay'), style: 'cancel' },
        {
          text: t('onboarding.skipConfirm.confirm'),
          style: 'destructive',
          onPress: () => draft.finish(),
        },
      ],
    );
  }, [draft, t]);

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeContent />;
      case 'profile':
        return <ProfileStep fields={draft.fields} setField={draft.setField} />;
      case 'body':
        return (
          <BodyStep
            fields={draft.fields}
            setField={draft.setField}
            weightUnit={draft.weightUnit}
            setWeightUnit={draft.setWeightUnit}
          />
        );
      case 'ready':
        return (
          <ReadyStep fields={draft.fields} weightUnit={draft.weightUnit} />
        );
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Editorial ghost numeral, bleeding off the right edge. */}
      {showGhostNumeral ? (
        <Animated.View
          key={`ghost-${stepIndex}`}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(150)}
          pointerEvents="none"
          className="absolute right-[-8px]"
          style={{ top: insets.top + 8 }}
        >
          <Text className="text-[150px] font-[800] tracking-[-3px] text-[rgba(27,26,24,0.05)]">
            {String(stepIndex).padStart(2, '0')}
          </Text>
        </Animated.View>
      ) : null}

      <WizardTopBar
        stepIndex={stepIndex}
        isLast={isLast}
        onBack={goBack}
        onSkip={skip}
      />

      {/* Step content */}
      <Animated.View
        key={step}
        className="flex-1"
        entering={(direction === 1 ? FadeInRight : FadeInLeft).duration(280)}
        exiting={FadeOut.duration(130)}
      >
        {renderStep()}
      </Animated.View>

      {/* Bottom CTA */}
      <View className="px-7" style={{ paddingBottom: insets.bottom + 12 }}>
        <WizardCTA
          label={t(ctaLabelKey(step, isLast))}
          onPress={isLast ? finishSetup : goNext}
          testID="onboarding_cta"
        />
      </View>
    </View>
  );
}
