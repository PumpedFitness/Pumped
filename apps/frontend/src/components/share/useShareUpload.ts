import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ShareError,
  uploadShare,
  type UploadedShare,
} from '@/lib/share/handoverClient';
import type { ShareEnvelope } from '@/lib/share/shareTypes';

/** Why a share could not be created, as the sheet words it. */
export type ShareUploadErrorKind = 'build' | 'offline' | 'tooLarge' | 'server';

export type ShareUploadState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'ready'; share: UploadedShare }
  | { status: 'error'; error: ShareUploadErrorKind };

function toErrorKind(error: unknown): ShareUploadErrorKind {
  if (error instanceof ShareError) {
    if (error.kind === 'offline' || error.kind === 'tooLarge') {
      return error.kind;
    }
    return 'server';
  }
  return 'server';
}

/**
 * Uploads a share once per opening of the sheet. Opening starts the upload,
 * closing resets, and `retry` starts over — a re-render never uploads again.
 */
export function useShareUpload(
  active: boolean,
  buildEnvelope: () => ShareEnvelope,
): { state: ShareUploadState; retry: () => void } {
  const [state, setState] = useState<ShareUploadState>({ status: 'idle' });
  const buildRef = useRef(buildEnvelope);
  buildRef.current = buildEnvelope;
  // Bumped per attempt; a late answer from an earlier attempt is dropped.
  const attempt = useRef(0);

  const start = useCallback(() => {
    const current = ++attempt.current;

    let envelope: ShareEnvelope;
    try {
      envelope = buildRef.current();
    } catch {
      setState({ status: 'error', error: 'build' });
      return;
    }

    setState({ status: 'uploading' });
    uploadShare(envelope).then(
      share => {
        if (attempt.current === current) setState({ status: 'ready', share });
      },
      error => {
        if (attempt.current === current) {
          setState({ status: 'error', error: toErrorKind(error) });
        }
      },
    );
  }, []);

  useEffect(() => {
    if (active) {
      start();
      return;
    }
    attempt.current += 1;
    setState({ status: 'idle' });
  }, [active, start]);

  return { state, retry: start };
}

/** Seconds left until `expiresAt`, ticking once a second while running. */
export function useSecondsLeft(expiresAt: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (expiresAt === null) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  if (expiresAt === null) return null;
  return Math.max(0, Math.ceil((expiresAt - now) / 1000));
}
