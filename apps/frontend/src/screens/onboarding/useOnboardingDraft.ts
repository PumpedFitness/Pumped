import { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { randomUUID } from 'expo-crypto';
import { useAuthStore } from '@/stores/authStore';
import { useTourStore } from '@/stores/tourStore';
import { useUserProfile } from '@/hooks/useUserProfile';
import type { Gender, WeightUnit } from '@/data/local/schema/userProfile';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '@/data/local/schema/bodyMetrics';
import { useRepository } from '@/data/local/useRepository';
import { toKg } from '@/utils/units';

export type OnboardingFields = {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  bodyFat: string;
};

function buildProfileData(
  fields: OnboardingFields,
  weightUnit: string,
): Record<string, unknown> {
  const profileData: Record<string, unknown> = {
    weightUnit: weightUnit as WeightUnit,
  };
  if (fields.name) profileData.name = fields.name.trim();
  if (fields.gender) profileData.gender = fields.gender as Gender;
  if (fields.age) {
    const age = parseInt(fields.age, 10);
    if (!isNaN(age) && age > 0) {
      const birthYear = new Date().getFullYear() - age;
      profileData.birthdate = `${birthYear}-01-01`;
    }
  }
  if (fields.height) {
    const h = parseFloat(fields.height);
    if (!isNaN(h) && h > 0) profileData.heightCm = h;
  }
  return profileData;
}

export function useOnboardingDraft() {
  const completeOnboarding = useAuthStore(s => s.completeOnboarding);
  const startTour = useTourStore(s => s.startTour);
  const { set: setProfile } = useUserProfile();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const weightRepo = useRepository(bodyWeightEntries);
  const bodyFatRepo = useRepository(bodyFatEntries);

  const [weightUnit, setWeightUnit] = useState('kg');
  const [fields, setFields] = useState<OnboardingFields>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bodyFat: '',
  });
  const setField = useCallback(
    <K extends keyof OnboardingFields>(key: K, value: string) => {
      setFields(prev => ({ ...prev, [key]: value }));
    },
    [],
  );

  const saveBodyMetrics = useCallback(() => {
    if (fields.weight) {
      const w = parseFloat(fields.weight);
      if (!isNaN(w) && w > 0) {
        weightRepo.create({
          id: randomUUID(),
          value: toKg(w, weightUnit as WeightUnit),
          recordedAt: Date.now(),
        });
      }
    }
    if (fields.bodyFat) {
      const bf = parseFloat(fields.bodyFat);
      if (!isNaN(bf) && bf > 0 && bf <= 100) {
        bodyFatRepo.create({
          id: randomUUID(),
          value: bf,
          recordedAt: Date.now(),
        });
      }
    }
  }, [fields.weight, fields.bodyFat, weightUnit, weightRepo, bodyFatRepo]);

  const finish = useCallback(() => {
    setProfile(buildProfileData(fields, weightUnit));
    saveBodyMetrics();
    completeOnboarding();
    navigation.replace('Main');
    // Kick off the one-time guided tour now that Main is mounting. startTour
    // is a no-op once the tour has been seen, so it never retriggers.
    startTour();
  }, [
    setProfile,
    fields,
    weightUnit,
    saveBodyMetrics,
    completeOnboarding,
    navigation,
    startTour,
  ]);

  return {
    weightUnit,
    setWeightUnit,
    fields,
    setField,
    finish,
  };
}
