// Regenerates the theme block of global.css from the single source of truth in
// src/theme/palette.ts. Runs automatically via `dev:prepare` (before ios/android/
// start); run manually with `bun run scripts/generate-theme-css.ts`.

import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { alpha, brand, dark, light, shadowVars, type ThemeColors } from '../src/theme/palette';

const START = '/* @theme-gen:start — AUTO-GENERATED from src/theme/palette.ts. Do not edit by hand. */';
const END = '/* @theme-gen:end */';

const varsFor = (theme: ThemeColors, shadow: { surface: string; overlay: string; field: string }) => {
  const line = (name: string, value: string) => `    --${name}: ${value};`;
  const body = Object.entries(theme)
    .map(([name, value]) => line(name, value))
    .join('\n');
  return [
    body,
    line('focus', 'var(--accent)'),
    line('link', 'var(--accent)'),
    line('surface-shadow', shadow.surface),
    line('overlay-shadow', shadow.overlay),
    line('field-shadow', shadow.field),
  ].join('\n');
};

const block = `${START}
@layer theme {
  /* ── Light (Clay — default) ── */
  @variant light {
${varsFor(light, shadowVars.light)}
  }

  /* ── Dark ── */
  @variant dark {
${varsFor(dark, shadowVars.dark)}
  }
}

/* ── Custom Clay tokens for Tailwind (reference the vars above) ── */
@theme inline {
  /* Surfaces */
  --color-surface-card: var(--surface);
  --color-surface-raised: var(--overlay);
  --color-surface-sunk: var(--default);
  --color-surface-well: ${brand.surfaceWell};

  /* Text */
  --color-text-muted: var(--muted);
  --color-text-secondary: ${brand.ink2};
  --color-foreground-secondary: ${brand.ink2};
  --color-text-on-raised: ${brand.cream};
  --color-text-on-raised-dim: ${alpha(brand.cream, 0.6)};

  /* Brand */
  --color-moss: ${brand.moss};
  --color-moss-deep: ${brand.mossDeep};
  --color-cream: ${brand.cream};
  --color-cream-dim: ${alpha(brand.cream, 0.6)};
  --color-sage: ${brand.sage};

  /* Accent variants */
  --color-accent-soft: var(--accent-soft);
  --color-accent-ink: ${brand.accentInk};

  /* Borders */
  --color-border-hairline: ${alpha(brand.ink, 0.09)};
  --color-border-soft: ${alpha(brand.ink, 0.06)};
  --color-border-on-moss: ${alpha(brand.cream, 0.16)};
}
${END}`;

const cssPath = join(import.meta.dir, '..', 'global.css');
const css = readFileSync(cssPath, 'utf8');

const startIdx = css.indexOf(START);
const endIdx = css.indexOf(END);
if (startIdx === -1 || endIdx === -1) {
  throw new Error(`global.css is missing the @theme-gen sentinels; cannot regenerate safely.`);
}

const next = css.slice(0, startIdx) + block + css.slice(endIdx + END.length);
if (next !== css) {
  writeFileSync(cssPath, next);
  console.log('[theme] global.css regenerated from src/theme/palette.ts');
} else {
  console.log('[theme] global.css already up to date');
}
