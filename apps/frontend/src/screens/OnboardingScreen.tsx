import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  ZoomIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const genderOptions = ['male', 'female', 'other'] as const;

type GenderOption = (typeof genderOptions)[number];

type StepDotsProps = {
  current: number;
  total: number;
};

type CTAButtonProps = {
  label: string;
  onPress: () => void;
  delay?: number;
  variant?: 'primary' | 'ghost';
};

type ProfileFieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  delay?: number;
};

type GenderPickerProps = {
  value: GenderOption | '';
  onChange: (v: GenderOption) => void;
  delay?: number;
};

type WelcomeStepProps = {
  onNext: () => void;
};

type PrivacyStepProps = {
  onNext: () => void;
};

type ProfileStepProps = {
  onNext: () => void;
  onSkip: () => void;
};

// ─── Step indicator ──────────────────────────────────────
function StepDots({ current, total }: StepDotsProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', marginTop: 16 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 24 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === current ? colors.accent : colors.borderStrong,
          }}
        />
      ))}
    </View>
  );
}

// ─── Animated CTA button ─────────────────────────────────
function CTAButton({
  label,
  onPress,
  delay = 0,
  variant = 'primary',
}: CTAButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(500).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: isPrimary
            ? pressed
              ? '#C4955E'
              : colors.accent
            : 'transparent',
          borderWidth: isPrimary ? 0 : 1,
          borderColor: isPrimary ? undefined : colors.borderStrong,
          paddingVertical: 18,
          borderRadius: 14,
          alignItems: 'center',
          transform: [{ scale: pressed ? 0.97 : 1 }],
        })}
      >
        <Text
          style={{
            fontSize: 17,
            fontWeight: '700',
            color: isPrimary ? colors.accentForeground : colors.textSecondary,
            letterSpacing: -0.2,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Profile input field ─────────────────────────────────
function ProfileField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  delay = 0,
}: ProfileFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify()}
      style={{ gap: 6 }}
    >
      <Text style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: '600', letterSpacing: 0.66, textTransform: 'uppercase', color: colors.textMuted }}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: 52,
          paddingHorizontal: 16,
          backgroundColor: colors.surfaceInput,
          color: colors.textPrimary,
          fontSize: 17,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: focused ? colors.accent : colors.border,
        }}
      />
    </Animated.View>
  );
}

// ─── Gender picker ───────────────────────────────────────
function GenderPicker({
  value,
  onChange,
  delay = 0,
}: GenderPickerProps) {
  const { t } = useTranslation();

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify()}
      style={{ gap: 6 }}
    >
      <Text style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: '600', letterSpacing: 0.66, textTransform: 'uppercase', color: colors.textMuted }}>
        {t('onboarding.profile.genderLabel')}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {genderOptions.map(option => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={{
                flex: 1,
                height: 52,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: selected ? colors.accent : colors.border,
                backgroundColor: selected
                  ? colors.accentSoft
                  : colors.surfaceInput,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: selected ? '600' : '500',
                  color: selected ? colors.accent : colors.textSecondary,
                }}
              >
                {t(`onboarding.gender.${option}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

// ─── Step 1: Welcome ─────────────────────────────────────
function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { t } = useTranslation();
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(-15);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withDelay(
      200,
      withSpring(1, { damping: 8, stiffness: 120 }),
    );
    logoRotate.value = withDelay(
      200,
      withSpring(0, { damping: 12, stiffness: 100 }),
    );
    titleOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }),
    );
    titleTranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 14, stiffness: 90 }),
    );
    subtitleOpacity.value = withDelay(
      900,
      withTiming(1, { duration: 500 }),
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
      <View className="mb-8">
        <LanguageSwitcher />
      </View>
      <Animated.View
        style={[
          logoStyle,
          {
            width: 100,
            height: 100,
            borderRadius: 24,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 40,
            elevation: 20,
            marginBottom: 32,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 40,
            fontWeight: '900',
            color: colors.accentForeground,
            letterSpacing: -1,
          }}
        >
          P
        </Text>
      </Animated.View>

      <Animated.Text
        style={[
          titleStyle,
          {
            fontSize: 48,
            fontWeight: '800',
            color: colors.textPrimary,
            letterSpacing: -2,
            textAlign: 'center',
            marginBottom: 12,
          },
        ]}
      >
        PUMPED
      </Animated.Text>

      <Animated.Text
        style={[
          subtitleStyle,
          {
            fontSize: 17,
            color: colors.textMuted,
            textAlign: 'center',
            lineHeight: 24,
            maxWidth: 260,
            marginBottom: 48,
          },
        ]}
      >
        {t('onboarding.welcome.subtitle')}
      </Animated.Text>

      <CTAButton label={t('onboarding.welcome.cta')} onPress={onNext} delay={1100} />
      <View style={{ width: SCREEN_WIDTH - 64 }}>
        <StepDots current={0} total={3} />
      </View>
    </View>
  );
}

// ─── Step 2: Privacy ─────────────────────────────────────
function PrivacyStep({ onNext }: PrivacyStepProps) {
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
      <Animated.View
        entering={ZoomIn.duration(500).springify()}
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          backgroundColor: colors.surfaceRaised,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginBottom: 32,
        }}
      >
        <Text style={{ fontSize: 36 }}>🔒</Text>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(200).duration(500).springify()}
        style={{
          fontSize: 32,
          fontWeight: '700',
          color: colors.textPrimary,
          letterSpacing: -0.8,
          textAlign: 'center',
          lineHeight: 38,
          marginBottom: 16,
        }}
      >
        {t('onboarding.privacy.title')}
        {'\n'}
        <Text style={{ color: colors.accent }}>
          {t('onboarding.privacy.accentTitle')}
        </Text>
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(400).duration(500).springify()}
        style={{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 24,
          maxWidth: 300,
          alignSelf: 'center',
          marginBottom: 48,
        }}
      >
        {t('onboarding.privacy.body')}
      </Animated.Text>

      <CTAButton label={t('onboarding.privacy.cta')} onPress={onNext} delay={600} />
      <StepDots current={1} total={3} />
    </View>
  );
}

// ─── Step 3: Profile ─────────────────────────────────────
function ProfileStep({
  onNext,
  onSkip,
}: ProfileStepProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<GenderOption | ''>('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.Text
          entering={FadeInDown.duration(400).springify()}
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: colors.textPrimary,
            letterSpacing: -0.8,
            marginBottom: 4,
          }}
        >
          {t('onboarding.profile.title')}
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(100).duration(400).springify()}
          style={{
            fontSize: 15,
            color: colors.textMuted,
            marginBottom: 28,
          }}
        >
          {t('onboarding.profile.subtitle')}
        </Animated.Text>

        <View style={{ gap: 18 }}>
          <ProfileField
            label={t('onboarding.profile.nameLabel')}
            value={name}
            onChangeText={setName}
            placeholder={t('onboarding.profile.namePlaceholder')}
            delay={150}
          />
          <GenderPicker value={gender} onChange={setGender} delay={200} />
          <ProfileField
            label={t('onboarding.profile.ageLabel')}
            value={age}
            onChangeText={setAge}
            placeholder={t('onboarding.profile.agePlaceholder')}
            keyboardType="numeric"
            delay={250}
          />
          <ProfileField
            label={t('onboarding.profile.heightLabel')}
            value={height}
            onChangeText={setHeight}
            placeholder={t('onboarding.profile.heightPlaceholder')}
            keyboardType="decimal-pad"
            delay={300}
          />
          <ProfileField
            label={t('onboarding.profile.weightLabel')}
            value={weight}
            onChangeText={setWeight}
            placeholder={t('onboarding.profile.weightPlaceholder')}
            keyboardType="decimal-pad"
            delay={350}
          />
          <ProfileField
            label={t('onboarding.profile.bodyFatLabel')}
            value={bodyFat}
            onChangeText={setBodyFat}
            placeholder={t('onboarding.profile.bodyFatPlaceholder')}
            keyboardType="decimal-pad"
            delay={400}
          />
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
        <CTAButton label={t('onboarding.profile.nextCta')} onPress={onNext} delay={0} />
        <CTAButton label={t('onboarding.profile.skipCta')} onPress={onSkip} delay={0} variant="ghost" />
        <StepDots current={2} total={3} />
      </View>
    </View>
  );
}

// ─── Main Onboarding Screen ──────────────────────────────
export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const goNext = useCallback(() => {
    if (step < 2) {
      setHasTransitioned(true);
      setStep(s => s + 1);
    }
  }, [step]);

  const finish = useCallback(() => {
    completeOnboarding();
    navigation.replace('Main');
  }, [completeOnboarding, navigation]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {hasTransitioned ? (
        <Animated.View
          key={step}
          entering={SlideInRight.duration(400).springify().damping(18)}
          exiting={SlideOutLeft.duration(300)}
          style={{ flex: 1 }}
        >
          {step === 1 && <PrivacyStep onNext={goNext} />}
          {step === 2 && <ProfileStep onNext={finish} onSkip={finish} />}
        </Animated.View>
      ) : (
        <View style={{ flex: 1 }}>
          <WelcomeStep onNext={goNext} />
        </View>
      )}
    </View>
  );
}
