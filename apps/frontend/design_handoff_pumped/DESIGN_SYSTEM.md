# Pumped Design System

**Pumped** is an offline-first strength-training app for people who lift. It helps you walk in, see today's session, log every set with minimal friction, rest, and walk out — all on-device, no connection required. The product is **mobile-first**; every pattern here is designed for a phone in one hand.

This design system captures the **"Clay"** visual language: warm, organic, and tactile — the deliberate opposite of the neon-on-black, hard-cornered fitness-app cliché. It is a **visual style reference**. Any names or sample data inside (Alex Kim, Push Day, etc.) are placeholder content, not facts about anyone.

> **Sources:** authored from scratch for this project (no external Figma or codebase). The interactive prototype with live theme controls lives at the project root as `Pumped.html`; the clean, token-driven recreation is `ui_kits/pumped-app/`.

---

## The idea in one line
> Warm oatmeal paper, a deep moss anchor, one earthy accent, everything softly rounded. Calm and human, never clinical or loud.

---

## CONTENT FUNDAMENTALS

**Voice:** a calm, encouraging training partner — never a drill sergeant, never a cheerleader with confetti.

- **Person:** second person, light. "Let's move, Alex." "You're primed for Push Day." "Next set in 1:30."
- **Tone:** warm, plainspoken, confident. Short sentences. It states facts and gentle encouragement; it doesn't hype.
- **Casing:** sentence case everywhere in body and titles ("Begin session", "Muscle freshness"). **Eyebrows/labels** are the one exception — UPPERCASE with wide tracking ("TODAY'S SESSION", "RECOVERY").
- **Numbers lead.** Metrics are first-class — weights, reps, volume, streaks, percentages. Always with a quiet unit ("24.8k **kg**", "12 **days**", "86 **%**"). Use real units (kg/lb), tabular figures so they don't jitter.
- **Brevity:** a card says one thing. "Last session · Tuesday → Pull Day — 52 min". No paragraphs inside the app.
- **No emoji.** Status is shown with colored dots and icons, not emoji. No exclamation spam.
- **Encouragement is earned and specific:** "Workout complete — nice work!", "+18%", "2 PRs" — tied to a real number, never generic ("Great job!!!").

Example microcopy: `Begin session` · `Log set 2` · `Next exercise` · `You're primed for Push Day` · `Active recovery` · `Workout complete — nice work!`

---

## VISUAL FOUNDATIONS

### Color
A warm, muted, earthy palette — every hue is desaturated and slightly dusty. See `tokens/colors.css`.
- **Ground:** warm oatmeal `--clay-bg #EAE3D5`. The app is "paper", not white and not black.
- **Surfaces:** cream cards `--clay-card #F7F2E8` sit on the ground with a hairline border (no heavy shadow by default).
- **Anchor:** deep **moss** `--clay-moss #46583C` is the brand color — used for the single most important card per screen (the hero), the floating nav, toasts, and headline stat tiles. Cream text rides on moss.
- **Accent:** one warm accent at a time, default **terracotta** `#C67B52`. Swappable via `data-accent` to honey, clay-rose, or sage. The accent is rationed — primary CTA, the live/now marker, key data highlights. If everything is accented, nothing is.
- **Status:** sage `--clay-sage #7E9061` = positive/fresh; the accent doubles as "needs attention/resting".
- **Always design against the semantic aliases** (`--surface-card`, `--text-primary`, `--accent`, …), not raw hues.

### Typography
Two families (`tokens/typography.css`):
- **Display — Bricolage Grotesque** (chunky, humanist, friendly). Greetings, screen/card titles, button labels, and every big number. Weight 700, tight tracking.
- **Body — Hanken Grotesk** (calm, legible). Everything else; sits a notch heavy (500–600) for warmth.
- Big metrics use **tabular figures**. Type never goes below ~11px (uppercase eyebrows).

### Shape & corners
**Nothing is sharp.** The smallest radius is 12px; cards are 18–34px; **all actions, chips, avatars and the nav are full pills** (`--radius-pill`). Hero cards get the largest radius (34px). This roundness is the single most recognizable trait — never ship a square corner.

### Depth & shadows
Soft, far, low-opacity — never a hard drop shadow (`tokens/spacing.css`).
- Cards mostly rely on a **hairline border**, not shadow.
- The moss hero and floating nav cast a large, very soft, tinted shadow (`--shadow-raised`, `--shadow-nav`).
- The accent CTA gets a faint colored lift (`--shadow-accent`).
- Depth *inside* a card is shown by a **sunken well** (`--surface-sunk` / `--surface-well`), not by stacking shadows.

### Layout
- Mobile-first. Default screen gutter **20px**; vertical rhythm on a 4pt scale.
- One **hero** (moss) card per screen, then lighter cream cards and 2–3 column stat grids.
- A **floating pill nav** sits 22px off the bottom; content pads ~120px so it never hides behind it.
- Generous breathing room — the design is calm, not dense (though density is tunable via `--density`).

### Motion
Gentle and physical (`--ease-soft`, `--dur-*`). Buttons **shrink ~4% on press**. Progress bars and segmented thumbs **slide** (0.2–0.4s). Toasts fade-and-rise. No bounces, no spinners-for-show, no infinite decorative loops. Respect `prefers-reduced-motion`.

### States
- **Hover/press:** scale-down on press for buttons; subtle translucent-cream highlight for the active nav item.
- **Selected:** accent fill (segmented thumb, active filter chip) or accent-soft tint.
- **Disabled:** 50% opacity.
- **Done/positive:** moss or sage fill with a check.

### Imagery
The app is type-, color-, and data-led; it does **not** rely on photography. Avatars are initials in a moss disc. If product/marketing imagery is introduced, keep it warm-toned and grainy to match the Clay palette (flag for real assets rather than inventing).

---

## ICONOGRAPHY

A **custom line-icon set**, not a third-party pack — see `components/icons/Icon.jsx`.
- Drawn on a **24×24 grid, 1.75 stroke, round caps & joins**, `currentColor`.
- Bump stroke to ~2.2–2.6 at sizes ≤14px so glyphs stay crisp.
- Icons inherit text color; tint via the parent. In list rows they sit in a **soft accent tile**.
- Coverage: dumbbell, flame, clock, calendar, pulse, target, trend, award, play, skip, rest, swap, plus, minus, check, x, chevron(/down), back, home, settings, bolt, edit, more (`ICON_NAMES`).
- **No emoji, no unicode glyphs as icons.** If you need a glyph outside the set, draw it on the same 24/1.75 grid.

---

## INDEX / MANIFEST

**Tokens** (`tokens/`, entry `styles.css`)
- `fonts.css` — Bricolage Grotesque + Hanken Grotesk (Google Fonts)
- `colors.css` — ground, moss, ink ramp, accents, semantic aliases, `data-accent` themes
- `typography.css` — families, weights, type scale, helper classes
- `spacing.css` — spacing scale, density, radii, shadows, motion
- `base.css` — element defaults

**Components** (`components/`) — React primitives, each with `.d.ts` + `.prompt.md`
- `actions/` — **Button**
- `content/` — **Card**, **Chip**, **Badge**, **ListRow**
- `data/` — **StatTile**, **RingGauge**, **ProgressBar**
- `forms/` — **SegmentedControl**, **Toggle**, **Stepper**
- `icons/` — **Icon** (custom set)

**Foundations** (`guidelines/`) — specimen cards shown in the Design System tab (colors, type, spacing, radius, shadow).

**UI kit** (`ui_kits/pumped-app/`) — full click-through app: Home, Active Session, Plan, Progress, You. See its `README.md`.

**Demo** (`Pumped.html`, project root) — the interactive prototype with live accent + density tweaks.

**SKILL.md** — instructions for using this system as a downloadable Claude skill.
