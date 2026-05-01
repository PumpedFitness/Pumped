# Handoff: Pumped — Strength-Training App Design System

## Overview

**Pumped** is a mobile-first iOS/Android strength-training app focused on the
core loop of *log a set, see your progress*. This handoff documents the full
design system: tokens, primitive components, a data-viz layer, and four
validating screens (Login, Active Workout, History Detail, Exercise Picker)
plus a Progress screen used to validate charts.

The design intent is **dark-first, sharp, mono-numeric, typography-driven**.
Hairlines do the work of shadows. The single accent color (clay by default,
an earthy terracotta `#D4A574`) is reserved for the primary action and live
data — never used decoratively. Nine alternates ship in the token layer
(see Accent palette below).

## About the Design Files

The files in `design_files/` are **design references created in HTML/JSX** —
prototypes that demonstrate the intended look, structure, and interaction.
They are **not production code to copy verbatim**.

Your task is to **recreate these designs in the target codebase's existing
environment** (React Native / SwiftUI / Jetpack Compose / native iOS / native
Android / Flutter, etc.) using its established patterns, primitives, and
animation system. If the project has no environment yet, choose the framework
that best matches the rest of the stack (React Native is the most direct
match given the JSX prototypes, but every component below maps cleanly to
SwiftUI, Compose, and Flutter).

What to lift directly from these files:

- **Token values** (colors, type scale, spacing, radii, motion) — copy hex
  codes and px values exactly.
- **Component anatomy** — the structure of each primitive (e.g., a Stepper
  is `[− button][big mono number + unit][+ button]`).
- **Layout proportions** — heights, paddings, gaps.
- **Copy** — use the exact strings from the screens.
- **Behavior contracts** — press-and-hold ramping, optimistic logging,
  states machines (pending → active → done).

What **not** to lift:

- The HTML/CSS class structure. Re-implement using the target framework's
  styling system.
- The phone frame chrome (`PhoneFrame` in `components.jsx`) — that's just for
  the gallery.
- The Tweaks panel (`tweaks-panel.jsx`) — design-time-only.

## Fidelity

**High-fidelity (hifi).** This is a complete pixel-spec'd design system.
Colors, typography, spacing, radii, motion durations, focus rings, and
interaction states are all final. Recreate to the spec; do not substitute the
target codebase's existing design system unless the team has explicitly
decided to merge the two.

## File Map

```
design_files/
├── index.html         — Entry point; loads tokens, components, screens
├── tokens.css         — All design tokens (colors, type, space, radius, motion)
├── components.css     — Stylesheet for all primitive components
├── components.jsx     — Primitive component library (Button, Input, Stepper…)
├── dataviz.jsx        — Charts: AreaChart, Sparkline, YearHeatmap, MonthGrid
├── screens.jsx        — The 5 validating screens
├── app.jsx            — Gallery shell (token previews + screen frames)
└── tweaks-panel.jsx   — Design-time controls (NOT for production)
```

---

## Touch targets (mobile-first)

Everything tappable clears **44pt (iOS HIG) / 48dp (Material)**:

| Element | Hit size |
|---|---|
| Button (sm / md / lg) | 44 / 48 / 56px |
| IconButton | 44×44px |
| TabBar (bottom nav) | 64px tall (+ safe-area-inset-bottom) |
| Segmented Tabs (`.tab-item`) | 44px min-height |
| Input | 52px |
| SetRow inline weight/reps inputs | 44px |
| SetRow completion checkbox | 44×44 |
| Stepper (default / sm) | 56 / 52px with 48px button cells |
| Switch | 52×32 visual; 60×48 hit zone (via `::before` padding) |
| Slider | 28px thumb, 44px tall hit area |

Display-only chips (badges, sync pills) stay compact since they're not
tap targets. **Do not shrink any of the above** when porting — the design
assumes thumb hits, not stylus precision.

## Design Tokens

All tokens are defined in `tokens.css`. The system is dark-first; light
tokens flip via `:root[data-theme="light"]`. The accent color is swappable
via `:root[data-accent="cyan|lime"]`.

### Color — Accent

The accent is reserved for the primary CTA, the active state, and live data.
It must never be used for decorative fills, backgrounds, or large surfaces.
Ten accents ship; **clay is the default**. They split into two families:

**Toned (default family — muted, earthy, gym-rubber feel):**

| Token | Hex | Notes |
|---|---|---|
| `clay` *(default)* | `#D4A574` | Terracotta. Default. |
| `rust` | `#C97B5C` | Burnt orange. More assertive. |
| `bone` | `#D8CFB8` | Off-white/cream. Most restrained. |
| `steel` | `#7DA9C9` | Slate-blue. Clinical. |
| `sage` | `#9BBFA8` | Desaturated mint. |
| `glacier` | `#A8C8D8` | Ice blue. Near-neutral tint. |
| `graphite` | `#9CA3AB` | Single-hue accent (UI becomes monochrome). |

**Saturated (legacy family — brighter, instrument-panel feel):**

| Token | Hex |
|---|---|
| `mint` | `#6EF0C8` |
| `cyan` | `#5EE3FF` |
| `lime` | `#C8F36B` |

Each accent defines a full set of supporting tokens (`--accent`,
`--accent-hover`, `--accent-pressed`, `--accent-soft`, `--accent-foreground`,
`--accent-glow`, `--accent-rgb`) defined in oklch and toggled via
`:root[data-accent="<name>"]` — see `tokens.css` for exact values.

### Color — Dark Theme (default)

| Role | Token | Hex |
|---|---|---|
| Page bg | `--bg` | `#0A0B0C` |
| Default surface | `--surface` | `#0F1113` |
| Raised (cards, sheets) | `--surface-raised` | `#16191C` |
| Sunken | `--surface-sunken` | `#06070808` |
| Input bg | `--surface-input` | `#0B0D0F` |
| Hover overlay | `--surface-hover` | `#1B1F23` |
| Press overlay | `--surface-press` | `#22272C` |
| Text — primary | `--text-primary` | `#F4F5F6` |
| Text — secondary | `--text-secondary` | `#B4B9BF` |
| Text — muted | `--text-muted` | `#6F767D` |
| Text — disabled | `--text-disabled` | `#3D4147` |
| Hairline (default) | `--border` | `#1F2327` |
| Hairline (soft) | `--border-soft` | `#15181B` |
| Hairline (strong) | `--border-strong` | `#2A2F34` |
| Success | `--success` | `#6EF0C8` (= accent in mint) |
| Warning | `--warning` | `#F4C24A` |
| Danger | `--danger` | `#FF5D5D` |
| Offline | `--offline` | `#8A6A2E` (amber-brown, intentionally not alarming) |
| Modal scrim | `--scrim` | `rgba(0,0,0,0.5)` |
| Bottom-sheet overlay | `--overlay` | `rgba(0,0,0,0.72)` |

### Color — Light Theme

| Role | Token | Hex |
|---|---|---|
| Page bg | `--bg` | `#F4F5F6` |
| Default surface | `--surface` | `#FFFFFF` |
| Raised | `--surface-raised` | `#FFFFFF` |
| Sunken | `--surface-sunken` | `#ECEEF0` |
| Input bg | `--surface-input` | `#FFFFFF` |
| Hover | `--surface-hover` | `#F4F5F6` |
| Press | `--surface-press` | `#ECEEF0` |
| Text — primary | `--text-primary` | `#0A0B0C` |
| Text — secondary | `--text-secondary` | `#3D4147` |
| Text — muted | `--text-muted` | `#6F767D` |
| Text — disabled | `--text-disabled` | `#B4B9BF` |
| Border | `--border` | `#E2E5E8` |
| Border-soft | `--border-soft` | `#ECEEF0` |
| Border-strong | `--border-strong` | `#C6CACE` |
| Success | `--success` | `#0E8C66` |
| Warning | `--warning` | `#B8860B` |
| Danger | `--danger` | `#D1393A` |
| Offline | `--offline` | `#A07418` |

The accent values are the **same in both themes**. Only neutrals flip.

### Color — Data-Viz

These derive from theme + accent and should be pulled through token references,
not hard-coded.

| Token | Dark | Light |
|---|---|---|
| `--chart-line` (current series) | `var(--accent)` | `var(--accent)` |
| `--chart-line-prev` (previous series) | `#6F767D` | `#B4B9BF` |
| `--chart-grid` | `var(--border-soft)` | `var(--border-soft)` |
| `--chart-axis` | `var(--text-muted)` | `var(--text-muted)` |
| `--chart-crosshair` | `var(--border-strong)` | `var(--border-strong)` |
| `--chart-pr` (personal-record marker) | `var(--accent)` | `#0E8C66` |
| `--chart-deload` (deload marker) | `var(--text-muted)` | `var(--text-muted)` |

**Heatmap intensity scale** (for `YearHeatmap` / `MonthGrid`):

| Stop | Dark | Light |
|---|---|---|
| `--heat-0` (no activity) | `var(--surface-input)` (`#0B0D0F`) | `#ECEEF0` |
| `--heat-1` | `rgba(--accent-rgb, 0.18)` | `rgba(--accent-rgb, 0.25)` |
| `--heat-2` | `rgba(--accent-rgb, 0.40)` | `rgba(--accent-rgb, 0.50)` |
| `--heat-3` | `rgba(--accent-rgb, 0.70)` | `rgba(--accent-rgb, 0.78)` |
| `--heat-4` (max) | `var(--accent)` | `var(--accent)` |

### Typography

**Fonts** — load from Google Fonts. Both have weights 400/500/600/700.

- **Geist** (sans) — `--font-sans` — UI text.
- **Geist Mono** — `--font-mono` — all numbers, eyebrows, tabular labels.

The body has `font-feature-settings: "ss01", "cv11"` to enable Geist's
slashed zero and disambiguated I/l. **Tabular numerals** are required
anywhere a number can change (sets, weights, timer): use
`font-variant-numeric: tabular-nums; font-feature-settings: "tnum";`
(class `.tnum` in the prototype).

**Type scale** (mobile-tuned, 24px floor for screen content; smaller sizes
allowed for eyebrows/captions only):

| Token | Size | Use |
|---|---|---|
| `--text-display` | 56px | Hero numbers (Stepper value) |
| `--text-h1` | 32px | Screen title (rare) |
| `--text-h2` | 24px | Card headers |
| `--text-h3` | 20px | Sheet title, sub-section |
| `--text-body` | 16px | Default body |
| `--text-label` | 14px | Form labels, list-row sub |
| `--text-caption` | 12px | Captions |
| `--text-micro` | 11px | Uppercase eyebrows, tabular labels |

**Line heights:** `--leading-tight: 1.05`, `--leading-snug: 1.2`,
`--leading-body: 1.45`.

**Letter spacing:** `--tracking-tight: -0.02em` (display sizes),
`--tracking-snug: -0.01em` (titles/buttons), `--tracking-wide: 0.06em`
(uppercase eyebrows only).

### Spacing (4px base)

`--space-1: 4px` `--space-2: 8px` `--space-3: 12px` `--space-4: 16px`
`--space-5: 20px` `--space-6: 24px` `--space-7: 32px` `--space-8: 40px`
`--space-9: 48px` `--space-10: 64px`

### Radius (sharp / minimal — this is intentional)

- `--radius-1: 2px` — chips, inputs, list rows (default for most things)
- `--radius-2: 4px` — cards, sheets, primary surfaces
- `--radius-3: 6px` — phone screen
- `--radius-pill: 9999px` — **status dots only** (8×8 dots in SyncStatus)

Do **not** introduce 8px / 12px / 16px / "soft" radii. The visual identity
depends on the sharpness.

### Elevation

There are **no drop shadows** anywhere in the UI except the modal overlay.
Surfaces are differentiated by hairlines (`1px solid var(--border)`).

Modal-only shadow:
`0 24px 48px -12px rgba(0,0,0,0.6), 0 0 0 1px var(--border-strong)`.

### Motion

All motion is fast (≤ 200ms) and uses a single ease curve.

- `--dur-fast: 80ms` — micro (button press, focus)
- `--dur-base: 140ms` — default (toasts, sync-status transitions)
- `--dur-slow: 200ms` — sheets, large transitions
- `--ease-out: cubic-bezier(0.2, 0.6, 0.2, 1)` — the only curve

**Press-and-hold ramp** (Stepper specifically): first repeat at 320ms,
then 180ms, then accelerates by ×0.85 each tick down to a 50ms floor.
Replicate this curve precisely — see `Stepper` in `components.jsx`.

### Selection & Focus

- Text selection: `background: var(--accent); color: var(--accent-ink);`
- Focus ring (keyboard): `outline: 2px solid var(--accent); outline-offset: 2px;`
  — applied only on `:focus-visible`, never on `:focus`.

---

## Primitive Components

All defined in `design_files/components.jsx` + styled in
`design_files/components.css`. Reproduce each with the props listed.

### Button — `components.jsx:42`

Props: `children, variant, size, block, loading, disabled, leadingIcon,
trailingIcon, onClick, type`.

- **Variants:** `primary` (accent fill, ink text), `secondary` (transparent
  + strong-border outline), `ghost` (text only, hover gets surface-hover),
  `destructive` (danger color outline → soft fill on hover),
  `destructive-solid` (danger fill).
- **Sizes:** `lg` (56px tall, 17px text, 24px h-pad), `md` (48px tall —
  default), `sm` (36px tall, 14px text, 12px h-pad).
- **Block** prop = full-width.
- **Loading state:** swap label for an inline spinner SVG (see
  `.btn[data-loading]` in `components.css`); button keeps its width.
- **Press feedback:** `transform: translateY(1px)` on `:active`.
- **Border-radius:** `--radius-1` (2px). All buttons.
- **Font weight:** 600. Letter-spacing: `--tracking-snug`.

### IconButton — `components.jsx:61`

44×44 square (iOS HIG min hit target). Optional bordered variant. Hover
fills with `--surface-hover`. Used in AppBar leading/trailing slots.

### Input — `components.jsx:75`

Props: `label, hint, error, value, onChange, type, placeholder, autoFocus,
inputMode, readOnly`.

- 52px tall, `--radius-1`, 14px h-pad, 16px text.
- Background: `--surface-input`. Border: 1px `--border`.
- Hover: border `--border-strong`. Focus: border `--accent` + 3px
  `--accent-soft` glow ring.
- Error (`aria-invalid="true"`): border `--danger`, hint text in `--danger`.
- Label sits above input as an 11px uppercase eyebrow with
  `--tracking-wide`, color `--text-muted`, weight 600.

### NumberField — `components.jsx:445`

Same chassis as Input but font is Geist Mono at 22px. Optional `unit` prop
(e.g. `lb`, `kg`) renders muted right-aligned suffix at 12px.

### Card — `components.jsx:99`

Background `--surface-raised`, 1px `--border`, `--radius-2` (4px). Optional
`.card-header` (16/16/12 padding, flex-between) and `.card-footer` (12/16
padding, top-border `--border-soft`).

### ListRow — `components.jsx:104`

Props: `title, subtitle, leading, trailing, onClick, chevron`.

- Min-height 56px, 12/16 padding, 12px gap.
- Rows in a `.list` wrapper get `1px solid --border-soft` between them.
- Hover: `--surface-hover`. Press: `--surface-press`.
- Title 16px / weight 500 / primary. Sub 12px / muted / tabular numerals.

### AppBar — `components.jsx:122`

Props: `title, leading, trailing, eyebrow`.

- Fixed 56px tall, `--surface` bg, 1px bottom `--border`.
- Three slots: `leading` (left, flex-shrink:0), `center` (`flex:1;
  min-width:0` so the title can truncate when trailing is wide),
  `trailing` (right, flex-shrink:0).
- Title: 17px / weight 600 / `--tracking-snug`. Truncates with ellipsis.
- Eyebrow: 10px Geist Mono, weight 600, `--tracking-wide`, uppercase,
  color `--text-muted`. Sits above the title with 1px gap.

### TabBar (bottom nav) — `components.jsx:136`

Props: `items: [{key,label,icon}], current, onChange`.

- Fixed 56px tall, `--surface` bg, 1px top `--border`.
- Equal-width tabs, icon (20px) over 11px label.
- Active state: text becomes `--text-primary`, plus a 24×2 accent bar
  pinned to the **top** of the tab.

### SyncStatus — `components.jsx:155`

Pill-shaped status indicator with an 8×8 dot + label.

- States: `synced` (accent dot, "Synced"), `syncing` (animated accent dot,
  "Syncing"), `offline` (offline-color dot, "Offline").
- Pill height ~24px, 8px h-pad, `--radius-pill`, 1px `--border-soft`,
  bg `--surface-raised`, label 11px Geist Mono.

### EmptyState — `components.jsx:166`

Centered: title (16px primary) + sub (14px muted, max-width ~280px) +
optional `action` slot for a Button.

### Toast — `components.jsx:180`

Top-aligned strip. Variants: `default`, `success` (accent border),
`danger` (danger border). 8×8 colored dot + 14px message. Dismissible.

### BottomSheet — `components.jsx:191`

Props: `open, onClose, title, children, height`.

- Scrim: `rgba(0,0,0,0.5)`, fades in over `--dur-base`.
- Sheet slides up from bottom over `--dur-slow`. Max-width: phone width.
- 36×4px drag handle pill at the top (`--border-strong`).
- Header: 16/16/8 padding, title 20px weight 600 + close IconButton.
- Body: 8/16/16 padding, scrolls if content overflows.
- Top-corners only get `--radius-2`.

### Stepper — `components.jsx:211` ⭐

The hero component. Used for weight/reps entry.

Props: `value, onChange, min, max, step, unit, label, size, disabled`.

Layout: `[− IconButton][big mono number + unit suffix][+ IconButton]`.
Both buttons are 56×56 with 1px `--border` and `--radius-1`. The number
uses `--text-display` (56px) Geist Mono with tabular numerals; the unit
suffix is `--text-h3` (20px), color `--text-muted`, baseline-aligned to
the bottom of the number with ~8px gap.

**Behavior:**
- Tap +/− → `onChange(value ± step)`, clamped to min/max.
- **Press-and-hold to ramp:** after 320ms hold, fire repeats. First
  interval 180ms, each subsequent multiplied by 0.85, floor 50ms. So a
  long hold accelerates: ~5 reps in the first second, ~20 in the third.
- Disable when `value` is at min/max bound (the relevant button only).
- All transitions `--dur-fast`.

**Native equivalents:**
- iOS: `UILongPressGestureRecognizer` with min duration 0.32s, then a
  `Timer` that decays.
- Android: `OnLongClickListener` + `Handler.postDelayed` recursion.
- React Native: `Pressable` with `onPressIn` starting a setTimeout chain,
  `onPressOut` clearing it.

### SetRow (workout-specific) — `components.jsx:303`

Renders one set inside an exercise card. Props: `index, weight, reps,
state, onChangeWeight, onChangeReps, onComplete, onActivate, prev`.

Three states drive three layouts:

- **`done`** — 1-line compact summary: `[#index][weight × reps][checkmark]`.
  Color is muted; checkmark is accent. Tappable to re-edit.
- **`active`** — full layout with two stacked Steppers (weight + reps) and
  a primary block-Button "Mark complete" beneath. Outline accent.
- **`pending`** — placeholder row showing "Set #N · prev: 185 × 8" in
  muted text, tappable to promote to active.

Only **one** set is `active` at a time per exercise.

### Stat — `components.jsx:365`

Compact stat block. `label` (11px micro eyebrow) + `value` (18px or 32px
when `large`). Mono numerals. Used in card headers and the History screen.

### Badge — `components.jsx:375`

Small pill, 11px micro caps. Default (border + muted text) and `accent`
(accent-soft fill + accent text).

---

## Data-Viz Components

Defined in `design_files/dataviz.jsx`. All charts are pure SVG, no
external libraries.

### AreaChart — `dataviz.jsx:46`

Props: `data: [{x, y}], compare: [{x, y}], loading, empty, height, yLabel,
xFormat, yFormat`.

- Smooth Catmull-Rom curve (tension 0.5) — see `smoothPath` helper at
  `dataviz.jsx:9`.
- Current series: stroke `--chart-line`, 2px, with a vertical area fill
  fading from `rgba(--accent-rgb, 0.20)` at top to `0` at bottom.
- Compare series (optional, for "vs last 3M" overlay): stroke
  `--chart-line-prev`, 1.5px dashed `4 4`, no fill.
- Axes: y-axis ticks generated by `niceRange(min,max,4)` (`dataviz.jsx:27`)
  → 5 ticks rounded to nice numbers. Axis labels in 11px Geist Mono,
  `--chart-axis` color.
- Grid: 1px horizontal lines, `--chart-grid`.
- Skeleton state (`loading=true`): static gradient placeholder.
- Empty state: centered "No data yet" muted text.

### Sparkline — `dataviz.jsx:297`

Compact inline chart. Default 96×28. Same smoothing as AreaChart, no
fill, no axes. `showEnd=true` adds a 3px accent dot at the last point.

### YearHeatmap — `dataviz.jsx:409`

GitHub-style 53-week × 7-day grid. Props: `data: Map<dateString, intensity>,
end`. Cells are 12×12 with 2px gap, `--radius-1`. Color uses the
`--heat-0..4` scale based on intensity 0–1.

### MonthGrid — `dataviz.jsx:342`

Single-month calendar. Props: `year, month, workouts: Set<dayNum>, today`.
Used on History screen for at-a-glance monthly view. Cells 32×32,
muted day numbers, accent fill on workout days, accent ring on `today`.

---

## Screens

The following 5 screens validate the system. Each is a fully-rendered
prototype in `design_files/screens.jsx`.

### 1. LoginScreen — `screens.jsx:9`

**Purpose:** unauthenticated entry point.

**Layout** (top → bottom, all centered, ~24px h-padding):

1. Top safe-area
2. **Wordmark** ("PUMPED" — see `Wordmark` at `screens.jsx:71`) — 28px
   Geist Mono weight 700, `--tracking-wide`, uppercase, color
   `--text-primary`
3. ~80px spacer
4. **Email Input** — label "Email", value `alex@gym.co`
5. 12px gap
6. **Password Input** — label "Password", `type="password"`, value `••••••••`
7. 8px gap
8. Right-aligned **ghost Button**: "Forgot password?"
9. 24px gap
10. **Primary block Button**: "Sign in"
11. 12px gap
12. Centered muted text: "Don't have an account?" + accent inline link "Create one"
13. Bottom safe-area

**Behavior:** stub — clicking "Sign in" navigates to the home tab.

### 2. ActiveWorkoutScreen — `screens.jsx:91`

**Purpose:** the core moment — logging a set mid-session. The whole app's
visual language is anchored here.

**Layout:**

- **AppBar** with eyebrow `28:14` (mono, indicates elapsed time) and
  title "Push Day · Week 4". Trailing slot: SyncStatus (`synced`).
- **Scroll body** (`overflow-y: auto`, `padding: 16px`):
  - **Exercise Card #1: Bench Press** (state: in-progress)
    - Card header: title "Bench Press" + Stat "Set 3 of 4"
    - Set rows:
      - Set 1 — `done`: `185 × 8 ✓`
      - Set 2 — `done`: `185 × 8 ✓`
      - Set 3 — `active`: full editor with two Steppers (weight 185 lb,
        reps 6) and a primary block "Mark set complete" button
      - Set 4 — `pending`: "Set 4 · prev: 185 × 8"
  - 16px gap
  - **Exercise Card #2: Incline DB Press** (state: queued, all `pending`)
  - 16px gap
  - **Exercise Card #3: Cable Fly** (state: queued)
  - **Footer button row:** secondary "Add exercise" + primary "Finish workout"
- **No bottom TabBar** during active workout (full-attention mode).

**Behavior:**
- Stepper increments/decrements weight in 5lb steps, reps in 1-rep steps.
- Press-and-hold to ramp (see Stepper spec).
- "Mark set complete" → set goes `done`, next `pending` set promotes to
  `active`, optimistic rest-timer eyebrow resets.
- Tapping a `done` set re-opens it for editing.
- Tapping a `pending` set promotes it to `active` (and demotes the
  current active back to `pending`).
- Logging is **optimistic + offline-first** — SyncStatus reflects state.

### 3. HistoryDetailScreen — `screens.jsx:255`

**Purpose:** review a completed workout.

**Layout:**

- AppBar: leading back IconButton, title "Tuesday, Mar 12", eyebrow "PUSH DAY"
- Stats strip (4 mini-Stats in a row, divided by hairlines):
  Duration `52:14`, Volume `12,450 lb`, Sets `16`, PRs `2`.
- **ExerciseSummary** card per exercise (see `screens.jsx:348`):
  - Header: order "01" + name "Bench Press" + Stat "5×5 @ 185"
  - Body: 5-set table — `# | weight | reps | RPE` — mono, tabular.
  - PR sets get an accent "PR" Badge in the trailing column.
- 3 exercises shown.
- Bottom: secondary Button "Repeat workout".

### 4. PickerScreen (Exercise Picker) — `screens.jsx:391`

**Purpose:** add an exercise to today's workout. Bottom-sheet pattern in
the actual app, but rendered as a full screen here for clarity.

**Layout:**

- AppBar: title "Add exercises", trailing primary sm-Button
  "Add (2)" — count reflects selection.
- **Search Input** at top: "Search exercises…" placeholder, with an inline
  leading search icon.
- **Filter chip row** (horizontal scroll, 8px gap): "All", "Push", "Pull",
  "Legs", "Core". Active chip: accent fill + ink text.
- **List**: ListRows with leading 40×40 muscle-group thumbnail (use a
  monospace text placeholder like `[BCH]`), title (exercise name),
  sub ("Chest · Barbell"), trailing checkbox-style toggle: empty
  square hairline → accent-filled square with checkmark when selected.
- Selected: `Bench Press`, `Cable Fly` by default in the prototype.

### 5. ProgressScreen — `screens.jsx:503`

**Purpose:** validate the data-viz components in context.

**Layout:**

- AppBar: title "Progress"
- **Lift selector**: horizontal chip row — "Bench" (active), "Squat",
  "Deadlift", "OHP".
- **Range selector**: chip row — "1M", "3M" (active), "6M", "1Y", "All".
- **Hero AreaChart** card: title "Estimated 1RM" + Stat "234 lb +12 lb",
  AreaChart (current 3M data, compare = previous 3M).
- **Stats grid** (2×2): Sparklines for "Volume", "Top Set", "Avg RPE",
  "Sessions/wk".
- **YearHeatmap** card: full year, "12 workouts this month" sub.
- TabBar at bottom.

---

## Interactions & Behavior

### Press-and-hold ramping (Stepper)

The signature interaction. See `components.jsx:211`. Reproduce exactly:

```
on press-down:
  fire onChange once
  schedule first repeat at 320ms
on each repeat tick:
  fire onChange
  next interval = max(50, current * 0.85)  (start current = 180)
on press-up or press-cancel:
  cancel timer
```

This makes the first hundred lb feel slow, then accelerate.

### Optimistic logging + offline queue

- "Mark set complete" updates UI immediately.
- SyncStatus pill shows `syncing` (animated dot) while the request is in
  flight, → `synced` on success, → `offline` if the device drops.
- All set logs are queued; when connectivity returns, they flush in order.
- The app is **fully usable offline** — there is no blocking error state
  for network failure during logging.

### Animations

| What | Duration | Easing |
|---|---|---|
| Button press | 80ms | ease-out |
| Toast slide-in | 200ms | `--ease-out` |
| Sheet slide-up | 200ms | `--ease-out` |
| Sheet scrim fade | 140ms | `--ease-out` |
| Set state change (pending↔active↔done) | 140ms cross-fade + height animate | `--ease-out` |
| TabBar indicator slide | 140ms | `--ease-out` |
| SyncStatus dot pulse (syncing) | 1.0s loop | linear opacity 0.4↔1.0 |

### Form validation

- Inline. `error` prop on Input swaps the hint text + flips border to
  `--danger`. No modal/toast for field-level errors.
- Required fields are not visually marked — empty submission triggers the
  inline error.

### Responsive behavior

The whole app targets mobile portrait (375–430 wide). Tablet/landscape is
out of scope for this design. The phone-frame in the gallery clamps
content to ~390px wide; in production, the screens fill the viewport.

---

## State Management

The prototypes use local React state (`useState`) for everything. In
production, structure roughly:

- **Auth** — current user, JWT/session token. Persisted to secure storage.
- **Workout session** — currently-active workout (if any). Includes
  exercise list, set states, start time. Persisted locally so an app
  kill mid-workout recovers.
- **History** — list of completed workouts. Server-backed, paginated.
- **Sync queue** — local FIFO of unsynced set logs. Flushed on
  connectivity.
- **Settings** — theme (`dark`/`light`), accent (`mint`/`cyan`/`lime`),
  unit (`lb`/`kg`), rest-timer default. Persisted to local storage.

Choose whatever the codebase already uses (Redux Toolkit, Zustand,
Riverpod, MVVM with Combine, etc.). The data shapes:

```ts
type SetState = 'pending' | 'active' | 'done';

interface SetLog {
  id: string;
  exerciseId: string;
  index: number;        // 1-based
  weight: number;       // in user's unit
  reps: number;
  rpe?: number;         // 1-10
  state: SetState;
  completedAt?: string; // ISO
  prevWeight?: number;  // last session's weight, for the "prev:" hint
  prevReps?: number;
}

interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'push' | 'pull' | 'legs' | 'core';
  equipment: string;
  sets: SetLog[];
}

interface Workout {
  id: string;
  name: string;        // "Push Day"
  weekIndex?: number;  // for "Week 4"
  startedAt: string;
  finishedAt?: string;
  exercises: Exercise[];
}
```

---

## Assets

- **Fonts** — Geist + Geist Mono from Google Fonts. The prototype loads
  weights 400/500/600/700; production should ship the same set.
- **Icons** — inline SVGs in `components.jsx:5` (`ICONS` map). Lucide-style,
  24×24 viewBox, stroke-2 currentColor. Replace with the codebase's icon
  library if there is one (Lucide, Phosphor, SF Symbols, Material
  Symbols), keeping the same metaphors:
  - `plus`, `minus` — Stepper buttons
  - `check` — completed set
  - `chevron-right` — list-row affordance
  - `search` — picker search field
  - `arrow-left` — back nav
  - `x` — close (sheets, toasts)
  - `dot` — generic indicator
  - `flame` — PRs / streaks
- **Imagery** — none in the current scope. Exercise thumbnails in the
  picker are text placeholders (`[BCH]`, `[CBL]`); production should
  replace with a small illustrated set.
- **No emoji.** Anywhere.

---

## Implementation Checklist

When porting:

1. Set up the token layer first (theme provider / styled-system / Compose
   `MaterialTheme.colors`-equivalent). Verify accent swap works before
   building any components.
2. Wire the type system — load Geist + Geist Mono, enable tabular
   numerals, Geist's stylistic sets `ss01` and `cv11`.
3. Build the primitives in this order: Button, IconButton, Input,
   NumberField, Card, ListRow, Badge, Stat, AppBar, TabBar, BottomSheet,
   Toast, EmptyState, SyncStatus.
4. Build Stepper. Validate the press-and-hold ramp on a real device — it
   needs to feel right at 60fps; if your framework's gesture system has
   latency, tune the initial 320ms delay.
5. Build SetRow and the three-state machine.
6. Build the data-viz primitives. SVG + path math is portable — see
   `smoothPath` and `niceRange` in `dataviz.jsx`. The Catmull-Rom
   formula and the nice-range tick algorithm should be lifted as-is.
7. Compose screens.
8. Hook up theme + accent toggles.
9. Test with real data (long exercise names, big numbers, slow networks).

## Notes on the Prototype

- The `Tweaks` panel (`tweaks-panel.jsx`) is a **design-time tool** that
  lets reviewers swap theme/accent live in the browser. Do not ship it.
- The `PhoneFrame` component in `components.jsx:380` only exists for the
  gallery — it draws a phone bezel. Drop it on port.
- The gallery shell in `app.jsx` is purely for review; the production app
  is just the screens.
- All numeric copy in the prototype (`185 lb`, `28:14`, `12,450 lb`) is
  static — wire to real data on port.
