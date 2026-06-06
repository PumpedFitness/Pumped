# Handoff: Pumped — Offline-First Strength Training App

## Overview
**Pumped** is a mobile-first, offline-first strength-training app. The core loop: open the app → see today's session → log every set with minimal friction → rest → finish. This bundle is the complete **"Clay"** design system plus a full click-through recreation of the app, ready to be implemented in a real codebase.

## About the Design Files
The files here are **design references authored in HTML/CSS/React (via Babel in-browser)** — prototypes that show the intended look and behavior. They are **not production code to copy verbatim**. Your task is to **recreate these designs in the target codebase's environment** (React Native, SwiftUI, Flutter, a React web app, etc.) using its established patterns, component library, and conventions. If no environment exists yet, pick the most appropriate framework for an offline-first mobile app and implement there.

The **design tokens** (`styles.css` + `tokens/`) are real and authoritative — port these values exactly into the target platform's theming system. The **component primitives** (`components/`) document the intended props/variants and should map onto equivalents in the target's component library.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, shadows, and interactions are final. Recreate pixel-faithfully using the codebase's libraries. Exact values are in `tokens/` and summarized under **Design Tokens** below.

---

## Design Tokens (authoritative — see `tokens/`)

### Color (`tokens/colors.css`)
| Token | Value | Use |
|---|---|---|
| `--clay-bg` | `#EAE3D5` | App background (warm oatmeal — never white/black) |
| `--clay-bg-warm` | `#E4DCCB` | Secondary ground / behind sheets |
| `--clay-card` | `#F7F2E8` | Raised card surface |
| `--clay-card-sunk` | `#EFE8DA` | Sunken well inside a card |
| `--clay-moss` | `#46583C` | **Brand anchor** — hero card, nav, toasts |
| `--clay-moss-deep` | `#3A4A32` | Well inside a moss surface |
| `--clay-cream` | `#F3EEE2` | Text/icons on moss |
| `--clay-ink` | `#34362C` | Primary text |
| `--clay-ink-2` | `#54564A` | Secondary text |
| `--clay-muted` | `#928E7E` | Captions / tertiary |
| `--clay-sage` | `#7E9061` | Positive / "fresh" / success |
| `--accent-terracotta` | `#C67B52` | **Default accent** |
| `--accent-honey` | `#C2974C` | Alt accent |
| `--accent-rose` | `#B26B62` | Alt accent |
| `--accent-sage` | `#7E9061` | Alt accent |
| `--accent-ink` | `#FBF6EF` | Text/icons on the accent |
| `--border-hairline` | `rgba(52,54,44,0.09)` | Card borders |

Semantic aliases (`--surface-card`, `--surface-raised`, `--text-primary`, `--text-muted`, `--accent`, `--accent-soft`, `--success`) are what UI should reference. Accent is swappable at runtime via `data-accent="honey|rose|sage"`. `--accent-soft` is the accent at ~13% alpha (used for icon tiles / tinted chips).

### Typography (`tokens/typography.css`)
- **Display:** `Bricolage Grotesque` (700) — greetings, titles, button labels, **all big numbers**. Tight tracking (−0.02em).
- **Body:** `Hanken Grotesk` (500–600) — everything else.
- Scale (px): display 30 / title 21 / heading 17 / stat 28 / body 15 / label 13.5 / caption 12.5 / micro 11 (uppercase, 0.12em tracking).
- All metrics use **tabular figures**. Minimum size ~11px.

### Spacing, radius, shadow, motion (`tokens/spacing.css`)
- Spacing: 4pt scale (`--space-1..8` = 4,8,12,16,20,24,32,40). Default screen gutter **20px**.
- Radius: `sm 12 / md 18 / lg 22 / xl 28 / 2xl 34 / pill 999`. **Nothing sharp — 12px floor; all actions/chips/nav/avatars are full pills.**
- Shadow: `--shadow-card` (hairline-soft), `--shadow-raised` (moss hero), `--shadow-nav` (floating nav), `--shadow-accent` (CTA lift). Soft, far, low-opacity — never hard drops.
- Motion: `--ease-soft` cubic-bezier(0.22,0.61,0.36,1); durations 0.12 / 0.2 / 0.4s. Buttons shrink ~4% on press; bars & segmented thumbs slide.
- Density: `--density` multiplier (compact 0.82 / regular 1 / cozy 1.18) scales paddings & gaps.

---

## Screens / Views
(Full interactive source: `ui_kits/pumped-app/` — `screen-home.jsx`, `screen-session.jsx`, `screen-misc.jsx`, shell in `App.jsx`. Device frame is 402×874.)

### 1. Home (`screen-home.jsx`)
- **Purpose:** orient the user and launch today's workout.
- **Layout:** vertical scroll, 20px gutter, ~120px bottom padding to clear the floating nav.
  - **Header:** "Thursday morning" caption (muted) + "Let's move, Alex" (display 30). Right: 48px moss avatar disc with cream initials.
  - **Hero card** (`--surface-raised` moss, radius 34, `--shadow-raised`): left = **recovery RingGauge** (conic ring, value 86, cream fill on faint cream track, moss center disc; center shows "86" display + "READY" micro). Right = "RECOVERY" eyebrow + "You're primed for Push Day" (display 20). Divider, then two metrics ("6 movements", "48m est. time") and the **primary CTA** ("Start", accent pill with play icon, `--shadow-accent`). Tapping Start → Session.
  - **Muscle freshness:** label + row of `Chip`s, each a cream pill with a status dot (sage = fresh, accent = resting).
  - **Stat row:** grid 1.3fr/1fr — left cream card "12-day streak" with a 7-bar week strip (filled = sage); right moss card "This week / 24.8k kg" (display).
  - **Last session recap:** cream card, accent-soft icon tile (dumbbell) + "Last session · Tuesday / Pull Day — 52 min" + "2 PRs" (sage, award icon).

### 2. Active Session (`screen-session.jsx`)
- **Purpose:** log sets exercise-by-exercise with rest timing. The heart of the app.
- **State:** `data` (exercises → sets `{w, r, done}`), `idx` (current exercise), `elapsed` (session seconds, ticks every 1s), `rest` (`{remaining, total}` or null, decrements every 1s). Active set = first `!done` set in the current exercise.
- **Layout:**
  - **Sticky top bar** (translucent oatmeal `rgba(234,227,213,0.9)` + blur): X close button (cream pill) · centered "Push Day" + "Exercise N of 6" · moss elapsed-time pill (clock icon, `m:ss`). Below: overall **ProgressBar** (accent fill = sets done / total).
  - **Exercise header:** muscle eyebrow (accent) + name (display 27) + "Last time · 60 kg × 8" (rest icon). Swap button (ghost square, radius 12).
  - **Set list:** three row states — **done** (cream row, moss check disc, "Set N", "60 kg × 8"); **active** (moss card with two `Stepper`s — Weight step 2.5kg, Reps step 1 — on moss wells, then full-width accent "Log set N" button); **upcoming** (dashed hairline row, 0.7 opacity).
  - **Logging a set:** marks done → starts `rest` countdown for that exercise's rest seconds. When all sets done, an advance button appears (moss "Next exercise" with chevron, or "Finish workout" with check on the last exercise).
  - **Rest banner** (absolute, bottom 24, moss, `--shadow-raised`): small accent RingGauge counting down + "Next set in m:ss" + "+15s" ghost button + accent "Skip" button.
- **Finish:** returns to Home and shows a toast "Workout complete — nice work!" for 2.6s.

### 3. Plan (`screen-misc.jsx` → `PlanScreen`)
- **Purpose:** the week as a Push/Pull/Legs split.
- **Layout:** title "Your week" + "Push · Pull · Legs split". Seven day rows (cards). States: **done** (cream + sage check disc), **today** (moss card, cream text, accent "TODAY" badge, `--shadow-raised`), **rest** (dashed, 0.72 opacity, rest icon), **upcoming** (cream). Each row: 44px rounded icon tile (day abbrev + dumbbell/rest icon) + name (display) + meta caption.

### 4. Progress (`screen-misc.jsx` → `ProgressScreen`)
- **Purpose:** trends and records.
- **Layout:** title "Progress" / "Last 8 weeks". 3-col `StatTile` strip (Sessions 14 / Volume 96.2k kg / Streak 12d). **Weekly volume** card: header + "+18%" (sage, trend icon) + 8 bars (last = accent, rest = accent-soft), day labels. **Recent personal records** list: cream rows, accent-soft award tile, name + relative date + accent value.

### 5. You (`screen-misc.jsx` → `ProfileScreen`)
- **Purpose:** profile + settings.
- **Layout:** title "You". Profile row (64px moss avatar + "Alex Kim" + "148 sessions · since 2024"). Two grouped `Card pad={0}` lists with `ListRow`s — **Training** (Units · Kilograms; Default rest · 90 sec; Weekly goal · 4 sessions) and **App** (Workout reminders + live `Toggle`; Apple Health · Connected; Appearance + chevron). Each row: accent-soft icon tile + label + muted detail/control; hairline divider between rows.

### App shell (`App.jsx`)
- **Floating tab bar** (absolute, bottom 22, moss pill, `--shadow-nav`): Home · Plan · Progress · You. Active tab expands to a translucent-cream pill showing icon **+ label** (display 14); inactive = icon only at 55% cream. Tab switch + Start/Finish drive all navigation.
- The whole device is scaled to fit the viewport (`useFit`); a phone-bezel frame wraps it (`ios-frame.jsx`).

---

## Interactions & Behavior
- **Start** (Home hero) → Active Session.
- **Stepper ± buttons** adjust weight/reps (clamped ≥ 0; weight rounds to 0.1).
- **Log set** → set marked done, set collapses, next set activates, rest timer starts.
- **Rest timer** counts down each second; **+15s** adds time; **Skip** dismisses. Auto-clears at 0.
- **Next exercise / Finish workout** advances `idx` or ends the session (→ Home + toast).
- **Toggle** (You) flips on/off with a sliding thumb.
- **Tab bar** switches root screens; active state animates (0.2s).
- **Press feedback:** primary/secondary buttons scale to 0.96 on press.
- Honor `prefers-reduced-motion` — no essential info conveyed by motion alone.

## State Management
- Session: `data[]`, `idx`, `elapsed` (interval 1s), `rest` (interval 1s) — see `screen-session.jsx`.
- Shell: `tab`, `inSession`, `toast` — see `App.jsx`.
- **Offline-first note:** the prototype holds state in memory only. In production, persist workout logs, set history, streak, and settings locally (e.g. SQLite / Core Data / AsyncStorage / IndexedDB) and sync opportunistically when online. The UI intentionally shows **no** sync/online chrome — keep offline invisible.

## Assets
- **Icons:** a custom line-icon set, not a third-party pack — `components/icons/Icon.jsx` (24×24 grid, 1.75 stroke, round caps, `currentColor`). Port these exact glyphs, or substitute a matching set (e.g. Lucide) at the same weight and document the swap. `ICON_NAMES` lists all available.
- **Fonts:** Bricolage Grotesque + Hanken Grotesk (Google Fonts; `tokens/fonts.css`). Self-host the binaries for production.
- **Images:** none — the app is type/color/data-led. Avatars are initials in a moss disc. **No emoji.**

## Files
- `styles.css` — global entry (links all tokens). Link this one file.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `base.css`.
- `components/` — documented React primitives, each with `.jsx` + `.d.ts` (props) + `.prompt.md` (what/when + usage): `actions/Button`, `content/{Card,Chip,Badge,ListRow}`, `data/{StatTile,RingGauge,ProgressBar}`, `forms/{SegmentedControl,Toggle,Stepper}`, `icons/Icon`.
- `ui_kits/pumped-app/` — full click-through app (`index.html` + screens + shell). Open `index.html` to see the intended product.
- `guidelines/` — foundation specimen cards (color/type/spacing/radius/shadow).
- `DESIGN_SYSTEM.md` — the full design guide (voice, foundations, iconography, manifest).
- `SKILL.md` — optional: use this bundle as a Claude skill.

## Suggested implementation order
1. Port `tokens/` into the target theming system (colors, type, spacing, radii, shadows).
2. Wire the two fonts.
3. Build the primitives in `components/` against the platform's component library.
4. Assemble screens in this order: **Home → Active Session** (core loop) → Plan → Progress → You.
5. Add local persistence; keep offline invisible.
