import { useCallback } from 'react';
import { randomUUID } from 'expo-crypto';
import type { InferInsertModel } from 'drizzle-orm';
import { userProfile, type Gender, type WeightUnit } from '../data/local/schema/userProfile';
import { useRepository } from '../data/local/useRepository';

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
  const row = repo.getById(PROFILE_ID);

  const profile: Profile = row
    ? {
        name: row.name,
        gender: row.gender ?? null,
        birthdate: row.birthdate ?? null,
        heightCm: row.heightCm ?? null,
        weightUnit: row.weightUnit,
      }
    : {
        name: '',
        gender: null,
        birthdate: null,
        heightCm: null,
        weightUnit: 'kg',
      };

  const set = useCallback(
    (fields: Partial<InferInsertModel<typeof userProfile>>) => {
      if (row) {
        repo.update(PROFILE_ID, fields);
      } else {
        repo.create({ id: PROFILE_ID, ...fields });
      }
    },
    [row, repo],
  );

  const resetProfile = useCallback(() => {
    if (row) repo.deleteById(PROFILE_ID);
  }, [row, repo]);

  return { profile, set, resetProfile };
}
