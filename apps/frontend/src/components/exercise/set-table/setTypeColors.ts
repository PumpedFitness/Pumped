import { colors } from '@/theme/tokens';
import type { SetTypeColorName } from '@/types/setType';

type SetTypeColorTokens = {
  /** Foreground (icon + label + active badge fill). */
  fg: string;
  /** Soft tinted background for the pill. */
  soft: string;
};

// Resolves a set-type palette name to concrete fg/soft-bg tokens for the pill.
export function setTypeColorTokens(
  color: SetTypeColorName,
): SetTypeColorTokens {
  switch (color) {
    case 'honey':
      return { fg: colors.accentHoney, soft: 'rgba(194, 151, 76, 0.16)' };
    case 'rose':
      return { fg: colors.accentRose, soft: 'rgba(178, 107, 98, 0.16)' };
    case 'moss':
      return { fg: colors.moss, soft: 'rgba(70, 88, 60, 0.14)' };
    case 'sage':
      return { fg: colors.sage, soft: 'rgba(126, 144, 97, 0.16)' };
    case 'slate':
      return { fg: colors.ink2, soft: 'rgba(84, 86, 74, 0.12)' };
    case 'terracotta':
    default:
      return { fg: colors.accent, soft: colors.accentSoft };
  }
}
