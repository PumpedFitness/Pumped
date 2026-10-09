// Links that carry a handover code. The QR code encodes `pumped://share/<id>`
// so the system camera can open the app directly; the in-app scanner and the
// manual-entry field also accept the bare id and the handover URL.

export const HANDOVER_URL = 'https://handover.devinfritz.workers.dev/';

const SHARE_LINK_PREFIX = 'pumped://share/';

const UUID_PATTERN =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function shareLinkFor(handoverId: string): string {
  return `${SHARE_LINK_PREFIX}${handoverId}`;
}

/**
 * Extracts the handover id from whatever was scanned or typed: a share link,
 * the handover URL, or the bare id. `null` when nothing id-shaped is in it.
 */
export function parseShareCode(text: string): string | null {
  const match = text.trim().match(UUID_PATTERN);
  return match ? match[0].toLowerCase() : null;
}
