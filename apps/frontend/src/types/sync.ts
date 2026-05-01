export type SyncAction = 'create' | 'update' | 'delete';

export type SyncEntity =
  | 'workout_session'
  | 'workout_session_set'
  | 'workout_template'
  | 'workout_template_exercise';

export type SyncState = 'idle' | 'syncing' | 'error' | 'offline';

export type SyncQueueEntry = {
  id: number;
  entity: SyncEntity;
  entityId: string;
  action: SyncAction;
  payload: string;
  createdAt: number;
  retries: number;
  lastError: string | null;
};
