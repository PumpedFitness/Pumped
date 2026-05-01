import {create} from 'zustand';
import { randomUUID } from 'expo-crypto';
import type {
  WorkoutSession,
  WorkoutSessionSet,
  Exercise,
} from '../types/domain';
import * as SessionRepo from '../data/repositories/WorkoutSessionRepository';
import * as SetRepo from '../data/repositories/WorkoutSetRepository';

type ActiveExercise = {
  exercise: Exercise;
  sets: WorkoutSessionSet[];
};

type WorkoutState = {
  activeSession: WorkoutSession | null;
  activeExercises: ActiveExercise[];

  startWorkout: (userId: string, name: string, templateId?: string) => void;
  addExercise: (exercise: Exercise) => void;
  logSet: (exerciseId: string, weight: number | null, reps: number) => void;
  deleteSet: (setId: string) => void;
  finishWorkout: (notes?: string) => void;
  discardWorkout: () => void;
  reloadActiveSession: (sessionId: string) => void;
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  activeSession: null,
  activeExercises: [],

  startWorkout: (userId, name, templateId) => {
    const session: WorkoutSession = {
      id: randomUUID(),
      userId,
      templateId: templateId ?? null,
      name,
      startedAt: Date.now(),
      endedAt: null,
      notes: null,
    };
    SessionRepo.createSession(session);
    set({activeSession: session, activeExercises: []});
  },

  addExercise: (exercise) => {
    const {activeExercises} = get();
    const alreadyAdded = activeExercises.some(
      (e) => e.exercise.id === exercise.id,
    );
    if (alreadyAdded) {
      return;
    }
    set({activeExercises: [...activeExercises, {exercise, sets: []}]});
  },

  logSet: (exerciseId, weight, reps) => {
    const {activeSession, activeExercises} = get();
    if (!activeSession) {
      return;
    }

    const exerciseEntry = activeExercises.find(
      (e) => e.exercise.id === exerciseId,
    );
    if (!exerciseEntry) {
      return;
    }

    const newSet: WorkoutSessionSet = {
      id: randomUUID(),
      sessionId: activeSession.id,
      exerciseId,
      setIndex: exerciseEntry.sets.length + 1,
      reps,
      weight,
      restSeconds: null,
      durationSeconds: null,
      notes: null,
      performedAt: Date.now(),
    };

    SetRepo.logSet(newSet);

    set({
      activeExercises: activeExercises.map((e) =>
        e.exercise.id === exerciseId
          ? {...e, sets: [...e.sets, newSet]}
          : e,
      ),
    });
  },

  deleteSet: (setId) => {
    SetRepo.deleteSet(setId);
    const {activeExercises} = get();
    set({
      activeExercises: activeExercises.map((e) => ({
        ...e,
        sets: e.sets.filter((s) => s.id !== setId),
      })),
    });
  },

  finishWorkout: (notes) => {
    const {activeSession} = get();
    if (!activeSession) {
      return;
    }
    const endedAt = Date.now();
    SessionRepo.finishSession(activeSession.id, endedAt, notes ?? null);
    set({
      activeSession: {...activeSession, endedAt, notes: notes ?? null},
    });
  },

  discardWorkout: () => {
    const {activeSession} = get();
    if (activeSession) {
      SessionRepo.deleteSession(activeSession.id);
    }
    set({activeSession: null, activeExercises: []});
  },

  reloadActiveSession: (sessionId) => {
    const session = SessionRepo.getSessionById(sessionId);
    if (!session) {
      set({activeSession: null, activeExercises: []});
      return;
    }
    const sets = SetRepo.getSetsForSession(sessionId);
    // Group sets by exercise — we need exercise metadata from the exercise store
    const exerciseMap = new Map<string, WorkoutSessionSet[]>();
    for (const s of sets) {
      const existing = exerciseMap.get(s.exerciseId) ?? [];
      existing.push(s);
      exerciseMap.set(s.exerciseId, existing);
    }

    // Note: activeExercises requires Exercise objects which the caller must provide
    // This reload only restores the session reference
    set({activeSession: session});
  },
}));
