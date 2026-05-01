import {create} from 'zustand';
import type {WorkoutSession, WorkoutSessionSet} from '../types/domain';
import * as SessionRepo from '../data/repositories/WorkoutSessionRepository';
import * as SetRepo from '../data/repositories/WorkoutSetRepository';

type SessionDetail = {
  session: WorkoutSession;
  sets: WorkoutSessionSet[];
};

type HistoryState = {
  sessions: WorkoutSession[];
  selectedDetail: SessionDetail | null;

  loadHistory: (userId: string) => void;
  loadSessionDetail: (sessionId: string) => void;
  clearDetail: () => void;
};

export const useHistoryStore = create<HistoryState>((set) => ({
  sessions: [],
  selectedDetail: null,

  loadHistory: (userId) => {
    const sessions = SessionRepo.getSessionsByUser(userId);
    set({sessions});
  },

  loadSessionDetail: (sessionId) => {
    const session = SessionRepo.getSessionById(sessionId);
    if (!session) {
      set({selectedDetail: null});
      return;
    }
    const sets = SetRepo.getSetsForSession(sessionId);
    set({selectedDetail: {session, sets}});
  },

  clearDetail: () => {
    set({selectedDetail: null});
  },
}));
