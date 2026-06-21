import type { SetTypeColorName } from '@/types/setType';

export const SET_TYPE_COLOR_NAMES: readonly SetTypeColorName[] = [
  'terracotta',
  'honey',
  'rose',
  'moss',
  'sage',
  'slate',
];

/** Stable palette colour for a custom set type (built-ins map their own). */
export function deriveSetTypeColor(id: string): SetTypeColorName {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return SET_TYPE_COLOR_NAMES[hash % SET_TYPE_COLOR_NAMES.length];
}
