export type RecordSet = {
  exerciseId: string;
  weightKg: number | null;
  reps: number;
};
export type RecordWorkout = {
  id: string;
  startedAt: number;
  endedAt: number | null;
  sets: RecordSet[];
};

function metrics(set: RecordSet): [string, number][] {
  const values: [string, number][] = [];
  if (Number.isFinite(set.reps) && set.reps > 0)
    values.push(['maxReps', set.reps]);
  if (
    set.weightKg !== null &&
    Number.isFinite(set.weightKg) &&
    set.weightKg > 0 &&
    set.reps > 0 &&
    Number.isFinite(set.reps)
  ) {
    const round = (value: number) => Math.round(value * 10) / 10;
    values.push(
      ['topWeight', round(set.weightKg)],
      ['volumeSet', round(set.weightKg * set.reps)],
      ['estimated1Rm', round(set.weightKg * (1 + set.reps / 30))],
    );
  }
  return values;
}

/** Personal bests achieved at the time, one per exercise/metric per workout.
 * Matches the four metrics used by exercise analytics; ties are not new PRs. */
export function workoutRecordCounts(
  workouts: RecordWorkout[],
): Map<string, number> {
  const best = new Map<string, number>();
  const counts = new Map<string, number>();
  const completed = workouts
    .filter(workout => workout.endedAt !== null)
    .sort((a, b) => a.startedAt - b.startedAt || a.id.localeCompare(b.id));
  for (const workout of completed) {
    const improved = new Set<string>();
    for (const set of workout.sets) {
      for (const [metric, value] of metrics(set)) {
        const key = JSON.stringify([set.exerciseId, metric]);
        if (value <= (best.get(key) ?? 0)) continue;
        best.set(key, value);
        improved.add(key);
      }
    }
    counts.set(workout.id, improved.size);
  }
  return counts;
}
