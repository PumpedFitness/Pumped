import { useCallback, useEffect, useMemo } from 'react';
import type { InferInsertModel } from 'drizzle-orm';
import {
  userProfile,
  type Gender,
  type WeightUnit,
} from '@/data/local/schema/userProfile';
import { useRepository } from '@/data/local/useRepository';
import {
  hasWeightUnitPreference,
  useAppSettingsStore,
} from '@/stores/appSettingsStore';

const PROFILE_ID = 'default';

type Profile = {
  name: string;
  gender: Gender | null;
  birthdate: string | null;
  heightCm: number | null;
  weightUnit: WeightUnit;
};

export function useUserProfile() {
  const repo = useRepository(userProfile);
  const weightUnit = useAppSettingsStore(state => state.weightUnit);
  const setWeightUnit = useAppSettingsStore(state => state.setWeightUnit);
  const row = repo.getById(PROFILE_ID);

  useEffect(() => {
    if (row && !hasWeightUnitPreference()) {
      setWeightUnit(row.weightUnit);
    }
  }, [row, setWeightUnit]);

  const profile: Profile = useMemo(() => {
    return row
      ? {
          name: row.name,
          gender: row.gender ?? null,
          birthdate: row.birthdate ?? null,
          heightCm: row.heightCm ?? null,
          weightUnit,
        }
      : {
          name: '',
          gender: null,
          birthdate: null,
          heightCm: null,
          weightUnit,
        };
  }, [row, weightUnit]);

  const set = useCallback(
    (fields: Partial<InferInsertModel<typeof userProfile>>) => {
      if (fields.weightUnit) {
        setWeightUnit(fields.weightUnit);
      }

      if (repo.getById(PROFILE_ID)) {
        repo.update(PROFILE_ID, fields);
      } else {
        repo.create({ id: PROFILE_ID, ...fields });
      }
    },
    [repo, setWeightUnit],
  );

  const resetProfile = useCallback(() => {
    if (repo.getById(PROFILE_ID)) repo.deleteById(PROFILE_ID);
  }, [repo]);

  return { profile, set, resetProfile };
}
