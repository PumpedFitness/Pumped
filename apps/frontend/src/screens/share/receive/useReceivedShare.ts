import { useCallback, useEffect, useState } from 'react';
import {
  downloadShare,
  ShareError,
  type ShareErrorKind,
} from '@/lib/share/handoverClient';
import type { ShareEnvelope } from '@/lib/share/shareTypes';

export type ReceivedShareState =
  | { status: 'loading' }
  | { status: 'error'; kind: ShareErrorKind }
  | { status: 'ready'; envelope: ShareEnvelope };

/** Downloads the share behind a handover code; `retry` re-runs the fetch. */
export function useReceivedShare(code: string): {
  state: ReceivedShareState;
  retry: () => void;
} {
  const [state, setState] = useState<ReceivedShareState>({
    status: 'loading',
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    downloadShare(code)
      .then(envelope => {
        if (active) setState({ status: 'ready', envelope });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          status: 'error',
          kind: error instanceof ShareError ? error.kind : 'server',
        });
      });
    return () => {
      active = false;
    };
  }, [code, attempt]);

  const retry = useCallback(() => setAttempt(value => value + 1), []);

  return { state, retry };
}
