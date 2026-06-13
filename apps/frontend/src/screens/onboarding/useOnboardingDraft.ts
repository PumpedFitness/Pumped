import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { randomUUID } from 'expo-crypto';
import { useAuthStore } from '@/stores/authStore';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { Gender, WeightUnit } from '@/data/local/schema/userProfile';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '@/data/local/schema/bodyMetrics';
import { useRepository } from '@/data/local/useRepository';
import { toKg } from '@/utils/units';
import type { ProfileFields } from './components/ProfileContent';

function buildProfileData(
  profileFields: ProfileFields,
  weightUnit: string,
): Record<string, unknown> {
  const profileData: Record<string, unknown> = {
    weightUnit: weightUnit as WeightUnit,
  };
  if (profileFields.name) profileData.name = profileFields.name;
  if (profileFields.gender) {
    profileData.gender = profileFields.gender as Gender;
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
  return profileData;
}

export function useOnboardingDraft() {
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
    setProfile(buildProfileData(profileFields, weightUnit));

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

  return { weightUnit, setWeightUnit, profileFields, setField, finish };
}
