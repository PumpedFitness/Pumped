import {create} from 'zustand';
import {createMMKV} from 'react-native-mmkv';
import type {SyncState} from '../types/sync';
import * as SyncQueueRepo from '../data/repositories/SyncQueueRepository';

const storage = createMMKV({id: 'sync-storage'});
const SYNC_ENABLED_KEY = 'sync_enabled';

type SyncStoreState = {
  syncState: SyncState;
  pendingCount: number;
  syncEnabled: boolean;

  setSyncState: (state: SyncState) => void;
  refreshPendingCount: () => void;
  setSyncEnabled: (enabled: boolean) => void;
  initialize: () => void;
};

export const useSyncStore = create<SyncStoreState>((set) => ({
  syncState: 'idle',
  pendingCount: 0,
  syncEnabled: false,

  setSyncState: (syncState) => set({syncState}),

  refreshPendingCount: () => {
    const pendingCount = SyncQueueRepo.getPendingCount();
    set({pendingCount});
  },

  setSyncEnabled: (enabled) => {
    storage.set(SYNC_ENABLED_KEY, enabled);
    set({syncEnabled: enabled});
  },

  initialize: () => {
    const syncEnabled = storage.getBoolean(SYNC_ENABLED_KEY) ?? false;
    const pendingCount = SyncQueueRepo.getPendingCount();
    set({syncEnabled, pendingCount});
  },
}));
