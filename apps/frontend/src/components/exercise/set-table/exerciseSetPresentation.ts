import type { TFunction } from 'i18next';
import type { WorkoutSetType } from '@/data/local/enums';
import type { EditableExerciseSet } from '@/types/exercise';
import type { SetTypeOption } from './exerciseSetTableModel';

export const SET_TYPE_OPTIONS: SetTypeOption[] = [
  { value: 'WARMUP', labelKey: 'setTable.setTypes.warmup' },
  { value: 'NORMAL', labelKey: 'setTable.setTypes.working' },
  { value: 'BACKOFF', labelKey: 'setTable.setTypes.backoff' },
  { value: 'DROP', labelKey: 'setTable.setTypes.drop' },
  { value: 'AMRAP', labelKey: 'setTable.setTypes.amrap' },
];

const SET_TYPE_SUMMARY_KEYS: Record<
  WorkoutSetType,
  `setTable.setTypesSummary.${
    | 'warmup'
    | 'working'
    | 'backoff'
    | 'drop'
    | 'amrap'}`
> = {
  WARMUP: 'setTable.setTypesSummary.warmup',
  NORMAL: 'setTable.setTypesSummary.working',
  BACKOFF: 'setTable.setTypesSummary.backoff',
  DROP: 'setTable.setTypesSummary.drop',
  AMRAP: 'setTable.setTypesSummary.amrap',
};

export function formatExerciseSetSummary(
  t: TFunction,
  sets: EditableExerciseSet[],
): string {
  return SET_TYPE_OPTIONS.map(option => ({
    typeKey: SET_TYPE_SUMMARY_KEYS[option.value],
    count: sets.filter(set => set.setType === option.value).length,
  }))
    .filter(item => item.count > 0)
    .map(item =>
      t('setTable.summaryItem', { count: item.count, type: t(item.typeKey) }),
    )
    .join(' · ');
}
