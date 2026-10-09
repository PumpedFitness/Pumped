import { HANDOVER_URL, parseShareCode } from '@/lib/share/shareLink';

const SHARE_LINK_PREFIX = 'pumped://share/';

/**
 * The handover id in a scanned QR code, or `null` when the code isn't a Pumped
 * share. Stricter than manual entry: any QR code may carry a UUID, so a scan
 * only counts when it is one of our links.
 */
export function shareCodeFromScan(data: string): string | null {
  const text = data.trim();
  const lower = text.toLowerCase();
  if (
    !lower.startsWith(SHARE_LINK_PREFIX) &&
    !lower.startsWith(HANDOVER_URL.toLowerCase())
  ) {
    return null;
  }
  return parseShareCode(text);
}
