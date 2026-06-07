import { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { randomUUID } from 'expo-crypto';
import { useAuthStore } from '../stores/authStore';
import { useUserProfile } from '../hooks/useUserProfile';
import type { Gender, WeightUnit } from '../data/local/schema/userProfile';
import { db } from '../data/local/database';
import { bodyWeightEntries, bodyFatEntries } from '../data/local/schema/bodyMetrics';
import { toKg } from '../utils/units';
import { colors, radii } from '../theme/tokens';
import { ClayIcon } from '../components/icons/ClayIcon';
import { SegmentedControl } from '../components/clay/SegmentedControl';
import { ProfileField } from '../components/forms/ProfileField';

const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);
const TOTAL_STEPS = 3;

// ─── Step indicator ──────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        alignSelf: 'center',
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? 24 : 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: i === current ? colors.accent : colors.line,
          }}
        />
      ))}
    </View>
  );
}

// ─── CTA button ──────────────────────────────────────────
function CTAButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? '#B06A42' : colors.accent,
        paddingVertical: 18,
        borderRadius: radii.pill,
        alignItems: 'center' as const,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: '600',
          color: colors.accentInk,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Welcome card data ───────────────────────────────────
const WELCOME_CARDS: { icon: 'target' | 'bolt' | 'settings'; title: string; body: string }[] = [
  {
    icon: 'target',
    title: 'Offline first',
    body: 'We hate it when you can\'t use an app without internet, so you can use this app anytime.',
  },
  {
    icon: 'bolt',
    title: 'Always free',
    body: 'All offline features stay free forever.',
  },
  {
    icon: 'settings',
    title: 'Lots of options',
    body: 'We like to minmax our workouts to make more gains, so we added a bunch of stuff to achieve this.',
  },
];

// ─── Step 1: Welcome ─────────────────────────────────────
function WelcomeContent() {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(200, withTiming(1, { duration: 500, easing: EASE }));
    translateY.value = withDelay(200, withTiming(0, { duration: 500, easing: EASE }));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
      <Animated.View style={contentStyle}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '700',
            color: colors.ink,
            letterSpacing: -0.6,
            marginBottom: 6,
          }}
        >
          PUMPED
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: colors.muted,
            lineHeight: 22,
            marginBottom: 28,
          }}
        >
          Your lifting companion.{'\n'}Track every rep, own every gain.
        </Text>

        <View style={{ gap: 10 }}>
          {WELCOME_CARDS.map((card, i) => (
            <View
              key={i}
              style={{
                backgroundColor: colors.card,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.line,
                padding: 16,
                flexDirection: 'row',
                gap: 14,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radii.sm,
                  backgroundColor: colors.accentSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ClayIcon name={card.icon} size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.ink,
                    marginBottom: 3,
                  }}
                >
                  {card.title}
                </Text>
                <Text
                  style={{
                    fontSize: 13.5,
                    color: colors.muted,
                    lineHeight: 19,
                  }}
                >
                  {card.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Step 2: Preferences ─────────────────────────────────
function PreferencesContent({
  weightUnit,
  setWeightUnit,
}: {
  weightUnit: string;
  setWeightUnit: (v: string) => void;
}) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
      <Text
        style={{
          fontSize: 30,
          fontWeight: '700',
          color: colors.ink,
          letterSpacing: -0.6,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Configure your{'\n'}experience
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: colors.muted,
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        You can change this later in settings.
      </Text>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.muted }}>
          Weight unit
        </Text>
        <SegmentedControl
          options={[
            { value: 'kg', label: 'Kilograms' },
            { value: 'lbs', label: 'Pounds' },
          ]}
          value={weightUnit}
          onChange={setWeightUnit}
        />
      </View>
    </View>
  );
}

// ─── Step 3: Profile ─────────────────────────────────────
type ProfileFields = {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  bodyFat: string;
};

function ProfileContent({
  fields,
  setField,
}: {
  fields: ProfileFields;
  setField: <K extends keyof ProfileFields>(key: K, value: string) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: '700',
          color: colors.ink,
          letterSpacing: -0.6,
          marginBottom: 4,
        }}
      >
        About you
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: colors.muted,
          marginBottom: 28,
        }}
      >
        Optional — you can always set this later.
      </Text>

      <View style={{ gap: 18 }}>
        <ProfileField
          label="Name"
          value={fields.name}
          onChangeText={v => setField('name', v)}
          placeholder="What should we call you?"
        />
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.muted }}>
            Gender
          </Text>
          <SegmentedControl
            options={['Male', 'Female', 'Other']}
            value={fields.gender}
            onChange={v => setField('gender', v)}
          />
        </View>
        <ProfileField
          label="Age"
          value={fields.age}
          onChangeText={v => setField('age', v)}
          placeholder="e.g. 25"
          keyboardType="numeric"
        />
        <ProfileField
          label="Height"
          value={fields.height}
          onChangeText={v => setField('height', v)}
          placeholder="e.g. 180 cm"
          keyboardType="decimal-pad"
        />
        <ProfileField
          label="Weight"
          value={fields.weight}
          onChangeText={v => setField('weight', v)}
          placeholder="e.g. 80 kg"
          keyboardType="decimal-pad"
        />
        <ProfileField
          label="Estimated body fat %"
          value={fields.bodyFat}
          onChangeText={v => setField('bodyFat', v)}
          placeholder="e.g. 15"
          keyboardType="decimal-pad"
        />
      </View>
    </ScrollView>
  );
}

// ─── Button labels per step ──────────────────────────────
const STEP_LABELS = ['Get started', 'Continue', "Let's go"];

// ─── Main Onboarding Screen ──────────────────────────────
export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);
  const { set: setProfile } = useUserProfile();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Lifted state from child steps
  const [weightUnit, setWeightUnit] = useState('kg');
  const [profileFields, setProfileFields] = useState<ProfileFields>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bodyFat: '',
  });

  const setField = useCallback(<K extends keyof ProfileFields>(key: K, value: string) => {
    setProfileFields(prev => ({ ...prev, [key]: value }));
  }, []);

  const finish = useCallback(() => {
    // Build profile fields to persist
    const genderMap: Record<string, Gender> = {
      Male: 'MALE',
      Female: 'FEMALE',
      Other: 'OTHER',
    };

    const profileData: Record<string, unknown> = {
      weightUnit: weightUnit as WeightUnit,
    };
    if (profileFields.name) profileData.name = profileFields.name;
    if (profileFields.gender) {
      const g = genderMap[profileFields.gender];
      if (g) profileData.gender = g;
    }
    if (profileFields.age) {
      const age = parseInt(profileFields.age, 10);
      if (!isNaN(age) && age > 0) {
        const birthYear = new Date().getFullYear() - age;
        profileData.birthdate = `${birthYear}-01-01`;
      }
    }
    if (profileFields.height) {
      const h = parseFloat(profileFields.height);
      if (!isNaN(h) && h > 0) profileData.heightCm = h;
    }

    setProfile(profileData);

    // Create initial body metric entries
    if (profileFields.weight) {
      const w = parseFloat(profileFields.weight);
      if (!isNaN(w) && w > 0) {
        const valueKg = toKg(w, weightUnit as WeightUnit);
        db.insert(bodyWeightEntries)
          .values({ id: randomUUID(), value: valueKg, recordedAt: Date.now() })
          .run();
      }
    }
    if (profileFields.bodyFat) {
      const bf = parseFloat(profileFields.bodyFat);
      if (!isNaN(bf) && bf > 0 && bf <= 100) {
        db.insert(bodyFatEntries)
          .values({ id: randomUUID(), value: bf, recordedAt: Date.now() })
          .run();
      }
    }

    completeOnboarding();
    navigation.replace('Main');
  }, [completeOnboarding, navigation, setProfile, profileFields, weightUnit]);

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
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {/* Top bar: back + skip */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          height: 52,
        }}
      >
        {step > 0 ? (
          <Pressable
            onPress={goBack}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: radii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <ClayIcon name="back" size={22} color={colors.ink} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}

        <Pressable
          onPress={finish}
          style={({ pressed }) => ({
            paddingVertical: 8,
            paddingHorizontal: 12,
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Text style={{ fontSize: 15, fontWeight: '500', color: colors.muted }}>
            Skip
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
        style={{ flex: 1 }}
      >
        <View style={{ width: SCREEN_WIDTH }}><WelcomeContent /></View>
        <View style={{ width: SCREEN_WIDTH }}>
          <PreferencesContent weightUnit={weightUnit} setWeightUnit={setWeightUnit} />
        </View>
        <View style={{ width: SCREEN_WIDTH }}>
          <ProfileContent fields={profileFields} setField={setField} />
        </View>
      </ScrollView>

      {/* Bottom: CTA + dots */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 12,
          gap: 16,
        }}
      >
        <CTAButton label={STEP_LABELS[step]} onPress={goNext} />
        <StepDots current={step} total={TOTAL_STEPS} />
      </View>
    </View>
  );
}
