import {useSyncStore} from '../stores/syncStore';

export function useSyncStatus() {
  const syncState = useSyncStore((s) => s.syncState);
  const pendingCount = useSyncStore((s) => s.pendingCount);
  const syncEnabled = useSyncStore((s) => s.syncEnabled);
  const setSyncEnabled = useSyncStore((s) => s.setSyncEnabled);

  // Map internal sync state to the SyncStatus component's expected states
  const displayState: 'synced' | 'syncing' | 'offline' =
    syncState === 'syncing'
      ? 'syncing'
      : syncState === 'offline' || syncState === 'error'
        ? 'offline'
        : pendingCount > 0
          ? 'syncing'
          : 'synced';

  return {syncState, displayState, pendingCount, syncEnabled, setSyncEnabled};
}
