import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { StepDots } from '@/components/clay/StepDots';
import { CTAButton } from '@/components/clay/CTAButton';
import { WelcomeContent } from './components/WelcomeContent';
import { PreferencesContent } from './components/PreferencesContent';
import { ProfileContent } from './components/ProfileContent';
import { useOnboardingDraft } from './useOnboardingDraft';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 3;
const STEP_LABEL_KEYS = [
  'onboarding.steps.getStarted',
  'onboarding.steps.continue',
  'onboarding.steps.letsGo',
] as const;

export function OnboardingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { weightUnit, setWeightUnit, profileFields, setField, finish } =
    useOnboardingDraft();

  const scrollToStep = useCallback((target: number) => {
    scrollRef.current?.scrollTo({ x: target * SCREEN_WIDTH, animated: true });
  }, []);

  const goNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      scrollToStep(step + 1);
    } else {
      finish();
    }
  }, [step, finish, scrollToStep]);

  const goBack = useCallback(() => {
    if (step > 0) scrollToStep(step - 1);
  }, [step, scrollToStep]);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, page));
      setStep(clamped);
    },
    [],
  );

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Top bar: back + skip */}
      <View className="flex-row items-center justify-between px-4 h-[52px]">
        {step > 0 ? (
          <Pressable
            onPress={goBack}
            className="w-10 h-10 rounded-full items-center justify-center active:opacity-60"
          >
            <ClayIcon name="back" size={22} color={colors.ink} />
          </Pressable>
        ) : (
          <View className="w-10" />
        )}

        <Pressable onPress={finish} className="py-2 px-3 active:opacity-50">
          <Text className="text-[15px] font-medium text-muted">
            {t('onboarding.skip')}
          </Text>
        </Pressable>
      </View>

      {/* Paging content */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        className="flex-1"
      >
        <View style={{ width: SCREEN_WIDTH }}>
          <WelcomeContent />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <PreferencesContent
            weightUnit={weightUnit}
            setWeightUnit={setWeightUnit}
          />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <ProfileContent fields={profileFields} setField={setField} />
        </View>
      </ScrollView>

      {/* Bottom: CTA + dots */}
      <View
        className="px-6 gap-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <CTAButton label={t(STEP_LABEL_KEYS[step])} onPress={goNext} />
        <StepDots current={step} total={TOTAL_STEPS} />
      </View>
    </View>
  );
}
