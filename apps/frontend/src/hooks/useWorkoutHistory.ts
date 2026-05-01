import {useEffect} from 'react';
import {useHistoryStore} from '../stores/historyStore';
import {useAuthStore} from '../stores/authStore';

export function useWorkoutHistory() {
  const userId = useAuthStore((s) => s.userId);
  const sessions = useHistoryStore((s) => s.sessions);
  const selectedDetail = useHistoryStore((s) => s.selectedDetail);
  const loadHistory = useHistoryStore((s) => s.loadHistory);
  const loadSessionDetail = useHistoryStore((s) => s.loadSessionDetail);
  const clearDetail = useHistoryStore((s) => s.clearDetail);

  useEffect(() => {
    if (userId) {
      loadHistory(userId);
    }
  }, [userId, loadHistory]);

  return {sessions, selectedDetail, loadSessionDetail, clearDetail, refresh: () => loadHistory(userId)};
}
