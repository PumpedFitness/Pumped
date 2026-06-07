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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { randomUUID } from 'expo-crypto';
import { useAuthStore } from '../../stores/authStore';
import { useUserProfile } from '../../hooks/useUserProfile';
import type { Gender, WeightUnit } from '../../data/local/schema/userProfile';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '../../data/local/schema/bodyMetrics';
import { useRepository } from '../../data/local/useRepository';
import { toKg } from '../../utils/units';
import { colors, radii } from '../../theme/tokens';
import { ClayIcon } from '../../components/icons/ClayIcon';
import { StepDots } from '../../components/clay/StepDots';
import { CTAButton } from '../../components/clay/CTAButton';
import { WelcomeContent } from '../../components/onboarding/WelcomeContent';
import { PreferencesContent } from '../../components/onboarding/PreferencesContent';
import {
  ProfileContent,
  type ProfileFields,
} from '../../components/onboarding/ProfileContent';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_STEPS = 3;
const STEP_LABELS = ['Get started', 'Continue', "Let's go"];

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);
  const { set: setProfile } = useUserProfile();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const weightRepo = useRepository(bodyWeightEntries);
  const bodyFatRepo = useRepository(bodyFatEntries);

  const [weightUnit, setWeightUnit] = useState('kg');
  const [profileFields, setProfileFields] = useState<ProfileFields>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bodyFat: '',
  });

  const setField = useCallback(
    <K extends keyof ProfileFields>(key: K, value: string) => {
      setProfileFields(prev => ({ ...prev, [key]: value }));
    },
    [],
  );

  const finish = useCallback(() => {
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

    if (profileFields.weight) {
      const w = parseFloat(profileFields.weight);
      if (!isNaN(w) && w > 0) {
        const valueKg = toKg(w, weightUnit as WeightUnit);
        weightRepo.create({
          id: randomUUID(),
          value: valueKg,
          recordedAt: Date.now(),
        });
      }
    }
    if (profileFields.bodyFat) {
      const bf = parseFloat(profileFields.bodyFat);
      if (!isNaN(bf) && bf > 0 && bf <= 100) {
        bodyFatRepo.create({
          id: randomUUID(),
          value: bf,
          recordedAt: Date.now(),
        });
      }
    }

    completeOnboarding();
    navigation.replace('Main');
  }, [
    completeOnboarding,
    navigation,
    setProfile,
    profileFields,
    weightUnit,
    weightRepo,
    bodyFatRepo,
  ]);

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
    <View
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}
    >
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
          <Text
            style={{ fontSize: 15, fontWeight: '500', color: colors.muted }}
          >
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
