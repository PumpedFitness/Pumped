import {
  workoutRecordCounts,
  type RecordSet,
  type RecordWorkout,
} from '../workoutRecordCounts';

function workout(
  id: string,
  startedAt: number,
  sets: RecordSet[],
  endedAt: number | null = startedAt + 1,
): RecordWorkout {
  return { id, startedAt, endedAt, sets };
}
const set = (
  weightKg: number | null,
  reps: number,
  exerciseId = 'bench',
): RecordSet => ({ weightKg, reps, exerciseId });

it('counts historical improvements in chronological order and keeps old achievements', () => {
  const counts = workoutRecordCounts([
    workout('new', 3, [set(60, 8)]),
    workout('first', 1, [set(40, 10)]),
    workout('middle', 2, [set(50, 8)]),
  ]);
  expect(counts.get('first')).toBe(4);
  expect(counts.get('middle')).toBe(2);
  expect(counts.get('new')).toBe(3);
});
it('counts one record per metric even when several sets improve it in one workout', () => {
  expect(
    workoutRecordCounts([
      workout('one', 1, [set(20, 5), set(30, 6), set(40, 8)]),
    ]).get('one'),
  ).toBe(4);
});
it('does not award ties or lower results', () => {
  const counts = workoutRecordCounts([
    workout('first', 1, [set(40, 10)]),
    workout('tie', 2, [set(40, 10)]),
    workout('lower', 3, [set(30, 8)]),
  ]);
  expect(counts.get('tie')).toBe(0);
  expect(counts.get('lower')).toBe(0);
});
it('tracks each exercise separately', () => {
  expect(
    workoutRecordCounts([
      workout('one', 1, [set(40, 8, 'bench'), set(40, 8, 'squat')]),
    ]).get('one'),
  ).toBe(8);
});
it('awards only a repetition record for bodyweight sets', () => {
  expect(
    workoutRecordCounts([workout('one', 1, [set(null, 10)])]).get('one'),
  ).toBe(1);
});
it('ignores unfinished workouts and invalid or empty sets', () => {
  const counts = workoutRecordCounts([
    workout('draft', 1, [set(100, 10)], null),
    workout('empty', 2, [set(0, 0), set(NaN, NaN)]),
    workout('done', 3, [set(40, 8)]),
  ]);
  expect(counts.has('draft')).toBe(false);
  expect(counts.get('empty')).toBe(0);
  expect(counts.get('done')).toBe(4);
});
