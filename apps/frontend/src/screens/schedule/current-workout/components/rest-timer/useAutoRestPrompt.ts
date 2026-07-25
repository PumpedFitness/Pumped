import { useCallback, useState } from 'react';
import { useAppSettingsStore } from '@/stores/appSettingsStore';

type AutoRestPrompt = {
  // Rest length awaiting an answer to the one-time prompt; null when hidden.
  pendingRestSeconds: number | null;
  // Call when a set is logged, with the rest it carries (0 = none). Honors the
  // saved choice; defers to the prompt only when the choice is still unset.
  onSetLogged: (restSeconds: number) => void;
  // Persist the prompt answer, seeding the pending rest on "yes".
  decide: (enabled: boolean) => void;
  // Dismiss without answering — the prompt returns on the next logged set.
  dismiss: () => void;
};

// Owns the "auto-start the rest timer?" preference and its first-run prompt.
// `startRest` is the rest timer's stable start fn (`useRestTimer().start`).
export function useAutoRestPrompt(
  startRest: (seconds: number) => void,
): AutoRestPrompt {
  const autoRestTimer = useAppSettingsStore(state => state.autoRestTimer);
  const setAutoRestTimer = useAppSettingsStore(state => state.setAutoRestTimer);
  const [pendingRestSeconds, setPendingRestSeconds] = useState<number | null>(
    null,
  );

  const onSetLogged = useCallback(
    (restSeconds: number) => {
      if (restSeconds <= 0 || autoRestTimer === false) {
        return;
      }
      if (autoRestTimer === true) {
        startRest(restSeconds);
        return;
      }
      setPendingRestSeconds(restSeconds);
    },
    [autoRestTimer, startRest],
  );

  const decide = useCallback(
    (enabled: boolean) => {
      setAutoRestTimer(enabled);
      if (enabled && pendingRestSeconds != null) {
        startRest(pendingRestSeconds);
      }
      setPendingRestSeconds(null);
    },
    [setAutoRestTimer, pendingRestSeconds, startRest],
  );

  const dismiss = useCallback(() => setPendingRestSeconds(null), []);

  return { pendingRestSeconds, onSetLogged, decide, dismiss };
}
