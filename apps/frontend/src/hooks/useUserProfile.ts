import { useCallback, useMemo } from 'react';
import type { InferInsertModel } from 'drizzle-orm';
import {
  userProfile,
  type Gender,
  type WeightUnit,
} from '@/data/local/schema/userProfile';
import { useRepository } from '@/data/local/useRepository';

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

  const profile: Profile = useMemo(() => {
    const row = repo.getById(PROFILE_ID);
    return row
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
  }, [repo]);

  const set = useCallback(
    (fields: Partial<InferInsertModel<typeof userProfile>>) => {
      if (repo.getById(PROFILE_ID)) {
        repo.update(PROFILE_ID, fields);
      } else {
        repo.create({ id: PROFILE_ID, ...fields });
      }
    },
    [repo],
  );

  const resetProfile = useCallback(() => {
    if (repo.getById(PROFILE_ID)) repo.deleteById(PROFILE_ID);
  }, [repo]);

  return { profile, set, resetProfile };
}
