import type { TFunction } from 'i18next';
import type { EditableExerciseSet } from '@/types/exercise';
import { formatExerciseSetSummary } from '../exerciseSetPresentation';

const t = ((key: string, values?: { count?: number; type?: string }) => {
  if (key === 'common.set') {
    return `${values?.count} ${values?.count === 1 ? 'set' : 'sets'}`;
  }
  if (key === 'setTable.summaryItem') {
    return `${values?.count} ${values?.type}`;
  }
  return key;
}) as TFunction;

function set(id: string, setType: string): EditableExerciseSet {
  return {
    id,
    setType,
    restSeconds: null,
    fieldValues: [],
  };
}

describe('formatExerciseSetSummary', () => {
  it('shows the total followed by a set-type breakdown', () => {
    const sets = [
      set('warmup-1', 'warmup'),
      set('warmup-2', 'warmup'),
      set('warmup-3', 'warmup'),
      set('working-1', 'working'),
      set('working-2', 'working'),
      set('working-3', 'working'),
    ];

    expect(
      formatExerciseSetSummary(t, sets, [
        { value: 'warmup', label: 'Warm-up' },
        { value: 'working', label: 'Working' },
      ]),
    ).toBe('6 sets: 3 Warm-up, 3 Working');
  });
});
