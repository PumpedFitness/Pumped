// Turns the live workout's flat exercise list into the sections the session
// screen scrolls through: standalone exercises and whole supersets. Pure, so
// the list component only renders.

import type {
  CurrentWorkout,
  CurrentWorkoutExercise,
} from '@/stores/currentWorkoutModel';
import type { ExerciseSectionState } from '@/components/exercise/ExerciseSectionHeader';
import {
  currentSupersetRound,
  currentSupersetSetId,
  groupIntoBlocks,
  type SupersetBlock,
} from '@/data/local/workouts/supersets';
import type { SnapSection } from './useSectionSnap';

export type SessionSupersetBlock = {
  kind: 'superset';
  id: string;
  exercises: CurrentWorkoutExercise[];
  rounds: number;
  /** 1-based round the whole group is on. */
  currentRound: number;
  /** The one set to log next, across every member, in round-major order. */
  currentSetId: string | null;
  position: number;
};

export type SessionBlock =
  | {
      kind: 'single';
      id: string;
      exercise: CurrentWorkoutExercise;
      position: number;
    }
  | SessionSupersetBlock;

function allSetsDone(exercise: CurrentWorkoutExercise): boolean {
  return exercise.sets.length > 0 && exercise.sets.every(set => set.isDone);
}

function toSessionBlock(
  block: SupersetBlock<CurrentWorkoutExercise>,
): SessionBlock {
  if (block.kind === 'single') {
    return {
      kind: 'single',
      id: block.exercise.id,
      exercise: block.exercise,
      position: block.position,
    };
  }
  return {
    kind: 'superset',
    id: block.group.id,
    exercises: block.exercises,
    rounds: block.rounds,
    currentRound: currentSupersetRound(block),
    currentSetId: currentSupersetSetId(block),
    position: block.position,
  };
}

export function buildSessionBlocks(workout: CurrentWorkout): SessionBlock[] {
  return groupIntoBlocks(workout.exercises, workout.supersets).map(
    toSessionBlock,
  );
}

export function blockIsComplete(block: SessionBlock): boolean {
  return block.kind === 'single'
    ? allSetsDone(block.exercise)
    : block.exercises.every(allSetsDone);
}

export function blockSnapSections(blocks: SessionBlock[]): SnapSection[] {
  return blocks.map(block => ({
    id: block.id,
    isComplete: blockIsComplete(block),
  }));
}

export function blockState(
  block: SessionBlock,
  activeId: string | undefined,
): ExerciseSectionState {
  if (blockIsComplete(block)) {
    return 'finished';
  }
  return block.id === activeId ? 'active' : 'upcoming';
}
