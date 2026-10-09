import { HANDOVER_URL } from './shareLink';
import {
  parseShareEnvelope,
  type ShareEnvelope,
  type ShareParseError,
} from './shareTypes';

export type ShareErrorKind =
  /** No connection, or the request never got an answer. */
  | 'offline'
  /** The code is unknown — it expired (30 min) or never existed. */
  | 'expired'
  /** The payload is over the service's size limit. */
  | 'tooLarge'
  | 'server'
  | ShareParseError;

export class ShareError extends Error {
  readonly kind: ShareErrorKind;

  constructor(kind: ShareErrorKind, message?: string) {
    super(message ?? kind);
    this.name = 'ShareError';
    this.kind = kind;
  }
}

export type UploadedShare = {
  /** Handover id — what the QR code and link carry. */
  id: string;
  /** Epoch ms after which the receiver gets `expired`. */
  expiresAt: number;
};

async function request(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    throw new ShareError(
      'offline',
      error instanceof Error ? error.message : String(error),
    );
  }
}

/** Stores the envelope with the handover service for 30 minutes. */
export async function uploadShare(
  envelope: ShareEnvelope,
): Promise<UploadedShare> {
  const response = await request(HANDOVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: JSON.stringify(envelope) }),
  });

  if (response.status === 413) throw new ShareError('tooLarge');
  if (!response.ok) {
    throw new ShareError('server', `Handover answered ${response.status}`);
  }

  const data = (await response.json()) as { uuid: string; ttl: number };
  return { id: data.uuid, expiresAt: Date.now() + data.ttl * 1000 };
}

/** Fetches and validates a share by its handover id. */
export async function downloadShare(id: string): Promise<ShareEnvelope> {
  const response = await request(`${HANDOVER_URL}${encodeURIComponent(id)}`);

  if (response.status === 404) throw new ShareError('expired');
  if (!response.ok) {
    throw new ShareError('server', `Handover answered ${response.status}`);
  }

  const parsed = parseShareEnvelope(await response.text());
  if (!parsed.ok) throw new ShareError(parsed.error);
  return parsed.envelope;
}
