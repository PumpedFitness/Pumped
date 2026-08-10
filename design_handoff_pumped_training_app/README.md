# Handoff: PUMPED — customizable training app (mobile)

## Overview
PUMPED is a mobile strength-training app for serious lifters and quantified-self users. Its differentiator is a **user-configurable dashboard**: the home screen is a canvas of modules the user can reorder, resize, remove and add — including **computed fields** the user defines with their own formula (e.g. tonnage, readiness).

Scope of this handoff: four screens — Home (editable dashboard), Trends (metric detail), Active session (set logging), and one-level-down index screens for Schedule / Library / Profile — plus two bottom sheets (Add module, Computed field builder).

## About the Design Files
The files in this bundle are **design references authored in HTML** (streaming "Design Component" format: a template plus a small logic class). They are prototypes that demonstrate intended look, copy and behavior — **not production code to copy directly**.

The task is to **recreate these designs inside the target codebase's existing environment** (React Native, SwiftUI, Flutter, Compose, web React…) using its established component library, navigation, theming and state patterns. If no environment exists yet, pick the most appropriate framework for the product and implement the designs there. Treat the HTML/CSS as a specification of geometry, color, type and motion — not as source to port.

`PUMPED v2.dc.html` is the current, approved direction. `PUMPED.dc.html` is an earlier, rejected direction (flat/technical); it is included only for context and should **not** be implemented.

## Fidelity
**High fidelity.** Colors, type, spacing, radii, shadows and interaction states below are final and exact. Recreate pixel-for-pixel using the codebase's own primitives. Content is realistic placeholder data (one athlete, one training block) — wire it to real data.

Device reference: 402 × 874 px logical viewport (iPhone-class). All measurements below are logical px at that width. Layout is a single fluid column with 18px side gutters; it should scale fluidly to other phone widths (grid columns and cards stretch; type sizes stay fixed).

---

## Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| ground | #E8E6E2 | app background (screen) |
| ground-desk | #DCDAD6 | area outside the device frame (presentation only) |
| surface | #FCFBFA | raised card / control background |
| surface-quiet | rgba(252,251,250,.45–.6) | inactive rows, secondary panels |
| sunken | #DFDCD8 | segmented-control track |
| track | #EBE8E4 | progress / bar-chart track |
| bar-idle | #E7E4E0 | unfilled chart bars, empty tick circle |
| ink | #1B1A18 | primary text, inverted cards, primary button |
| ink-nav | #26241F | floating tab bar background |
| ink-2 | #57544F | secondary text, stepper glyphs |
| muted | #8C8880 | labels, captions |
| muted-2 | #A9A6A1 | tertiary captions, placeholders |
| accent | #E2542C | primary accent (start, rest, ƒx, PR marker) |
| accent-hover | #F05F35 | accent hover |
| accent-press | #C2431F / #B33F1E | accent text on white / text on accent |
| accent-tint | rgba(226,84,44,.09–.12) | ƒx pills, edit-mode banner, chart area fill (.10) |
| on-ink | #F4F2EF | text on ink surfaces |
| hairline | rgba(27,26,24,.08) | 1px dividers |

No gradients anywhere. Depth comes only from layered shadows.

### Elevation
| Token | Value | Use |
|---|---|---|
| card | `0 12px 28px rgba(27,26,24,.06), 0 2px 5px rgba(27,26,24,.03)` | dashboard modules |
| card-hover | `0 16px 34px rgba(27,26,24,.10)` | tappable module hover/press |
| hero | `0 14px 34px rgba(27,26,24,.07), 0 2px 6px rgba(27,26,24,.04)` | next-session card, chart card, log card |
| row | `0 8px 20px rgba(27,26,24,.05)` | list rows, set rows |
| row-hover | `0 14px 30px rgba(27,26,24,.09)` | list row hover |
| circle | `0 8px 18px rgba(27,26,24,.06)` | quick-action circles |
| chip | `0 4px 10px rgba(27,26,24,.10)` | active segmented pill |
| button-ink | `0 12px 26px rgba(27,26,24,.20)` | primary dark button |
| button-accent | `0 10px 22px rgba(226,84,44,.28)` | accent start button |
| rest-card | `0 14px 30px rgba(226,84,44,.26)` | rest timer card |
| nav | `0 16px 34px rgba(27,26,24,.28)` | floating tab bar |
| inset-track | `inset 0 2px 5px rgba(27,26,24,.08)` | segmented track, progress track, inputs |
| inset-bar | `inset 0 1px 3px rgba(27,26,24,.08)` | muscle-split bars |
| inset-avatar | `inset 0 2px 5px rgba(27,26,24,.10)` | avatar placeholder |
| inverted-card | `0 12px 28px rgba(27,26,24,.14)` | charcoal bodyweight card |

### Radius
999px (all pills, circles, bars, buttons, chips) · 34px top corners (bottom sheets) · 28px (hero cards, chart card, log card) · 26px (dashboard modules, rest card, add-module sheet rows) · 24px (sheet rows, list rows) · 22px (PR rows, set rows, expression panel) · 20px (edit banner, set rows) · 18px (inputs, preview panel).

### Spacing
4 / 6 / 7 / 8 / 9 / 10 / 12 / 14 / 16 / 18 / 20 / 22 / 24 / 26 / 28. Side gutter 18. Card padding 18 (modules) or 20 (hero/log/chart). Grid gap 12. List gap 10, set-row gap 8. Screen top padding 60 (below status bar), bottom padding 130 (clears floating nav) — session screen uses 40 (no nav).

### Typography
Family: **Manrope** (400/500/600/700/800), Google Fonts. Fallback `system-ui, sans-serif`. `-webkit-font-smoothing: antialiased`.

| Role | Spec |
|---|---|
| display | 800 34px / 1.06, letter-spacing −.02em |
| screen title | 800 32px / 1.1, −.02em |
| big number | 800 46px / 1, −.035em |
| section title | 800 20px / 1, −.01em |
| sheet title | 800 22px / 1, −.02em |
| metric title | 800 27px / 1.15, −.02em |
| module value | 800 30px / 1, −.03em |
| stepper value | 800 22px / 1, −.02em |
| rest clock | 800 26px / 1, −.02em |
| row title | 700 15–16px / 1.2 |
| card title | 700 19px / 1.25 |
| exercise name | 800 29px / 1.1, −.02em |
| body/label | 600 12px / 1 (muted) |
| caption | 500 12–13px / 1.4–1.6 (muted) |
| button | 700 13–14px / 1 |
| chip / tab label | 700 11–13px / 1 |
| ƒx badge | 700 9px / 1 |

Sentence case throughout. No all-caps, no letterspaced mono. Long paragraphs use `text-wrap: pretty`.

### Motion
| Name | Spec | Use |
|---|---|---|
| fade | `opacity 0→1, .25–.3s ease` | screen enter, scrim |
| rise | `opacity 0→1 + translateY(14px→0), .25–.28s ease` | rest card, edit banner |
| sheet | `translateY(102%→0), .3s cubic-bezier(.2,.85,.2,1)` | bottom sheets |
| hover | instant background/shadow swap | cards, buttons, chips |
| rest ring | `stroke-dashoffset` driven by 1s tick | rest countdown |

---

## Screens / Views

### 1. Home (editable dashboard)
**Purpose:** see today's session and the metrics the user chose to watch; start training in one tap; reconfigure the canvas.

**Layout** (scrolling column, gutters 18, top 60, bottom 130):
1. **Identity row** — 42px circle avatar (ground #DAD7D2, inset-avatar shadow, initials 700 13px #8C8880) · text column: date (500 12px muted) + block status (700 15px ink, 6px above-gap) · right: **Edit** pill (h38, padding 0 16, radius 999, surface bg / ink text; when active: ink bg / on-ink text; shadow `0 4px 12px rgba(27,26,24,.07)`).
2. **Display headline** — 26px above, display token, two lines: "Ready for / Push A."
3. **Next-session card** — surface, radius 28, padding 20, hero shadow. Row: left column (label "Next session" 600 12 muted → 9px gap → "Bench focus · 5 lifts" 700 19 → 9px gap → "18 sets · ~52 min · 6.4 t target" 500 13 muted); right 64px accent circle with white play triangle (SVG path `M2 1.6 16 10 2 18.4Z`, 18×20), button-accent shadow, hover accent-hover. Below (20px): "Block progress" / "38%" (600 12, value in ink) then 12px track (radius 999, #EBE8E4, inset-track) with ink fill at 38%.
4. **Quick actions** — 4 equal columns, gap 12: full-width square circle (aspect-ratio 1, radius 999, surface, circle shadow, hover #fff) containing a 20×20 1.7px-stroke line icon, then 9px gap, label 600 11 muted. Items: Log lift (dumbbell), Timer (clock), Weigh in (scale/upload), Trends (line chart → navigates to Trends).
5. **Summary header** — 26px above: "Summary" (section title) + right segmented pill: track radius 999 #DFDCD8 with inset-track, 4px padding; items padding 8/13, radius 999, 700 11; active = surface bg + ink text + chip shadow; inactive = transparent + muted. Options: Daily / **Weekly** / Monthly.
6. **Module grid** — 2 equal columns, gap 12, `align-items: start`; each module spans 1 or 2 columns. Order and span are per-module state.

**Modules** (all radius 26, padding 18, card shadow unless noted):
- **Tonnage** (span 1, tappable → Trends/Volume): label row "Tonnage" + ƒx badge (700 9, accent on accent-tint, radius 999, padding 4/6) · value 38.4 + unit "t" (600 13 muted) · 34px-tall bar row, 7 bars, gap 4, radius 999, heights 34/52/44/68/60/82/100%, colors bar-idle ×5, ink, accent. Hover card-hover.
- **Squat e1RM** (span 1, tappable → Trends/Strength): value 182.5 + unit · delta chip "+4.0 28d" (inline-flex, padding 5/9, radius 999, rgba(27,26,24,.06), 700 11 with 500 muted "28d") · 30px smooth sparkline, 2px ink stroke, round caps.
- **Readiness** (span 2): left 76px progress ring — SVG rotate(−90°), r 32, track #EBE8E4 9px, accent 9px round-cap, dasharray 201 / offset 34 (≈83%), centered value 800 19 · right column: "Readiness" + ƒx badge, "In the optimal band" (700 17/1.3), "1 ÷ ACWR × HRV z-score · full load cleared" (500 12/1.45 muted).
- **Adherence** (span 1): value 92 + "%" · 7-column dot grid, 28 dots, gap 5, aspect 1, radius 999 — ink for completed, bar-idle for missed (indices 3, 9, 17), rgba(27,26,24,.22) for future (indices > 24).
- **Bodyweight** (span 1, **inverted**): ink background, on-ink text, inverted-card shadow, muted labels at rgba(244,242,239,.6); value 84.2 + unit; "+0.3 / wk · on target"; accent smooth sparkline.
- **Weekly sets by muscle** (span 2, hidden by default): 5 rows, gap 11 — name (56px, 600 12 muted) · bar (h10, radius 999, #EBE8E4 + inset-bar, fill widths 90/100/70/55/40%, colors ink, ink, ink-2, ink-2, accent) · value (26px right, 700 12). Chest 18, Back 20, Quads 14, Delts 11, Arms 8.
- **Computed field** (hidden until created): like Tonnage but with `outline: 1.5px solid rgba(226,84,44,.35); outline-offset: -1.5px`; shows user's name, value, unit and the raw expression (500 11/1.5 #A9A6A1, word-break).

**Edit mode** (Edit pill toggles):
- Banner above grid: radius 20, accent-tint bg, padding 13/16, 7px accent dot + "Drag cards to reorder · ⇱ resize · ✕ remove" (600 12, #A84324), rise animation.
- Every module: `draggable`; **✕** 26px accent circle at top −6/right −6 (white glyph, `0 4px 10px rgba(226,84,44,.35)`) removes it; **⇱** 28px ink circle inset at bottom 12/right 12 toggles span 1 ↔ 2. Tap-through to navigation is suppressed while editing.
- Footer: "+ Add module" — radius 26, padding 20, `rgba(252,251,250,.5)`, 1.5px dashed rgba(27,26,24,.20), 700 13 muted, centered; hover darkens border + ink text. Opens the Add-module sheet.

### 2. Trends (metric detail)
Back circle (40px surface, circle shadow, chevron) + "Trends" (700 15) + "Last 8 weeks" (600 12 muted). Segmented pill (5px padding, items padding 11/6, 700 12): **Strength / Volume / Bodyweight**. Then metric title (metric-title token), big number + unit (600 15 muted) + right delta chip (padding 7/11, radius 999, rgba(27,26,24,.06), 700 12).

Chart card: surface, radius 28, padding 20/16/14, hero shadow. SVG viewBox 320×160, height 170, non-uniform scaling: area path filled `rgba(226,84,44,.10)`, line 2.6px accent round-cap, last point a 6px circle (surface fill, 3px accent stroke). Curve is Catmull-Rom→cubic-Bézier smoothing over 8 weekly points; y maps the series into 130px with 40%-of-range padding above and below. Axis row below: W1 · W3 · W5 · W7 · Now (600 11 #A9A6A1, space-between).

"Personal records" section (section title, 28 above / 14 below): rows radius 22, padding 16/18, surface, row shadow — lift (700 15) · load (700 15) · date (600 12 #A9A6A1, 58px right-aligned). Back squat 175 × 3 · 18 Jul; Bench press 122.5 × 4 · 11 Jul; Deadlift 210 × 2 · 4 Jul; Overhead press 72.5 × 6 · 27 Jun.

"How this is calculated" panel: radius 22, `rgba(252,251,250,.6)`, padding 18, label 600 12 muted + explanation 500 13/1.6 #57544F. Copy per metric:
- Strength: "Epley: load × (1 + reps ÷ 30), taken from your best working set each session, then smoothed over a 3-session rolling max."
- Volume: "Sum of sets × reps × load across the week, warm-up sets excluded, converted to metric tonnes."
- Bodyweight: "Mean of your last seven morning weigh-ins, with readings more than two standard deviations out dropped."

Series data (8 points): strength 162, 165, 164, 170, 169, 174, 178, 182.5 · volume 29.1, 31.4, 30.2, 34.8, 33.1, 36.0, 37.2, 38.4 · bodyweight 82.4, 82.7, 82.9, 83.3, 83.4, 83.8, 84.0, 84.2.

### 3. Active session
No tab bar (full-screen modal-ish). Header: ✕ close circle (40px surface) + "Push A" (700 15) + elapsed clock pill (ink bg, on-ink, padding 9/14, radius 999, 700 13, leading 6px accent dot). Elapsed starts at 12:04 and ticks 1s.

Exercise name (800 29/1.1, −.02em) + target line (600 13 muted, e.g. "Target 4 × 6 @ RPE 8 · 90s rest").

**Set list** — rows gap 8, radius 20, padding 14/16. Logged: surface + row shadow, index (700 13 #A9A6A1), "75 × 8" (700 16 ink), "RPE 7" (600 12 #A9A6A1), 22px accent circle with white ✓. Pending row: `rgba(252,251,250,.45)`, no shadow, index in accent, load in #A9A6A1, "Pending", empty #E7E4E0 circle.

**Rest card** (visible while resting): accent bg, radius 26, padding 18, rest-card shadow, rise animation. 52px ring (rotate −90°, r 22, track rgba(255,255,255,.32) 5px, white 5px round-cap, dasharray 138.2, offset = 138.2 × (1 − remaining/total)) · "Rest" (600 12, .8 opacity) + clock (800 26) · "Skip" pill (white bg, #B33F1E text, padding 13/16).

**Log card**: surface, radius 28, padding 20, hero shadow. Two stepper columns split by a 1px hairline: label (600 12 muted) then − / value / + — steppers are 38px circles `#F1EFEC`, glyph 700 17 #57544F, hover #E9E6E2; value 800 22 centered. Load steps ±2.5 (unit-aware), reps ±1, floor 0 / 1. RPE row (18 above): "RPE" label (600 12 muted, 32px) + 5 equal chips 6–10, padding 11/0, radius 999 — selected ink bg / on-ink text / `0 6px 14px rgba(27,26,24,.18)`, else #F1EFEC / #57544F. Primary **Log set** button: ink, on-ink, padding 19, radius 999, 700 14, button-ink shadow, hover #2E2C29. Hint below: 500 12/1.5 #A9A6A1 — "Last week you hit 82.5 × 6 at RPE 8 — +2.5 suggested".

**Up next** list: rows radius 22, padding 16/18, gap 10; 8px status dot (accent = done, ink = current, #D7D4CF = upcoming) · name (700 15, ink when current else #57544F) · status/target (600 12, accent when current else #A9A6A1); current row uses surface bg, others `rgba(252,251,250,.55)`. Tapping a row switches to that exercise (clears logged sets and rest). Queue: Barbell bench press 4 × 6 · Incline dumbbell press 3 × 10 · Cable fly 3 × 12 · Overhead press 4 × 8 · Triceps pushdown 3 × 15.

### 4. Index screens (Schedule / Library / Profile)
Kicker (600 12 muted) → screen title (800 32/1.1) → rows gap 10: radius 24, padding 18, surface, row shadow, hover row-hover — title (700 16/1.25) + subtitle (500 12/1.4 muted, 7px gap) + 32px `#F1EFEC` circle with chevron. These are the entry points to the deeper single-domain submenus; their detail screens are out of scope for this handoff.

Rows:
- **Schedule** — kicker "Meso 2 · hypertrophy · week 3 of 8": Push A — Bench focus / "Today · 5 lifts · 18 sets"; Pull A — Row focus / "Sunday · 5 lifts · 19 sets"; Lower A — Squat focus / "Tuesday · 4 lifts · 16 sets"; Deload week / "Week 8 · auto-generated at 55% volume"; Progression rules / "RPE caps · load steps · substitutions".
- **Library** — kicker "214 movements · 12 of your own": Barbell 48 · Dumbbell 61 · Machine & cable 73 · Bodyweight 32 · Your custom movements "12 · tempo, range of motion, load type".
- **Profile** — kicker "Account · data · dashboard": Dashboard layout / "6 modules · 2 computed fields"; Computed fields / "Edit formulas, units and rounding"; Units & plate math / "kg · 2.5 kg increments"; Data sources / "HRV · sleep · smart scale · CSV import"; Export / "CSV · JSON · full history".

### 5. Bottom sheets
Shared: scrim `rgba(27,26,24,.38)` + fade; panel ground bg, radius 34 top, side padding 18, bottom padding 36–40, sheet animation, internal scroll, 44×5 grab handle (`rgba(27,26,24,.16)`, radius 999, 18px below). Header: title (sheet title) + 34px surface close circle.

**Add module** (max-height 80%): one row per currently-hidden module — radius 24, padding 17/18, surface, row shadow; title (700 16) + description (500 12 muted) + 32px `#F1EFEC` "+" circle. Tapping adds it back to the canvas and closes. Footer CTA: accent card, radius 24, padding 18, button-accent-style shadow `0 12px 26px rgba(226,84,44,.24)` — white ƒx pill on `rgba(255,255,255,.24)` + "Build a computed field" (700 16 white) + white chevron → opens the formula sheet.
Module descriptions: Tonnage "Computed · sum of sets × reps × load" · Estimated 1RM "Per lift · Epley formula" · Readiness "Computed · acute:chronic load × HRV" · Adherence "28-day completion grid" · Bodyweight trend "Seven-day rolling mean" · Weekly sets by muscle "Volume split across six groups".

**Computed field** (max-height 88%):
- "Name" label → text input: surface, no border, radius 18, padding 15/16, 700 15, inset-track shadow, placeholder "Push volume" (#A9A6A1).
- "Expression" label → ink panel, radius 22, padding 18, min-height 54, on-ink 600 14/1.6, word-break; empty state "Tap the chips below to build a formula".
- Token chips: wrapping row, gap 7, padding 10/13, radius 999, surface, 700 12, chip-ish shadow `0 4px 10px rgba(27,26,24,.05)`, hover inverts to ink/on-ink. Tokens in order: Σ, sets, reps, load, bodyweight, sessions, e1RM, HRV, sleep, (, ), ÷, ×, +, −, 7d, 28d. Trailing ⌫ chip uses accent-tint bg / #C2431F text and drops the last token.
- Row of two: "Unit" input (same style, 600 14, placeholder "t · kg · %") and a Preview panel (surface, radius 18, padding 13/16, row-ish shadow, label + 800 21 value; "—" until an expression exists).
- Primary "Add to dashboard": ink pill, padding 19, 700 14, button-ink shadow. Creates the computed module (name defaults to "Custom field", expression defaults to "Σ sets × reps × load"), shows it on the canvas, resets the form and closes.
Note: the prototype's preview number is a stand-alone stub (`12.8 + expression.length × 0.37`). In production, parse the expression into an AST over named training metrics and evaluate it against real data; validate tokens, arity and units, and surface errors inline in the expression panel.

### Floating tab bar
Absolutely positioned: left/right 16, bottom 26, z-index 60. Track: ink-nav bg, radius 999, 7px padding, nav shadow, `display: flex`, gap 2. Five items, radius 999, padding 13/6, 17×17 1.8px-stroke line icons, gap 8. **Inactive**: `flex: 1`, transparent bg, icon `rgba(244,242,239,.62)`, label hidden. **Active**: `flex: none`, `#F4F2EF` bg, ink icon + visible label (700 12, nowrap). Tabs: Home, Schedule, Library, Trends, Profile. Hidden entirely during an active session.

---

## Interactions & Behavior
- **Navigation**: tab bar switches screens (Home → dashboard, Trends → metric detail, others → index screens); switching tabs exits edit mode. Tonnage / e1RM modules and the Trends quick action deep-link into Trends with the matching metric preselected (and mark the Trends tab active). Back/✕ circles return to Home.
- **Start session**: accent play button → session screen; stops event propagation so it doesn't trigger the card; exits edit mode.
- **Edit mode**: Edit pill toggles; closes any open sheet. While editing, module taps do not navigate. HTML5-style drag: dragStart records the module, dragOver prevents default, drop reorders (array splice on the order-sorted list, then reindex). ⇱ toggles span between 1 and 2 columns. ✕ hides the module and returns it to the Add-module sheet.
- **Session logging**: Log set appends {load, reps, RPE} to the set list and starts the rest countdown at the configured duration. A 1s interval, active only on the session screen, increments elapsed and decrements rest to 0. Skip zeroes the rest. Selecting a queue row switches exercise and clears that exercise's logged sets and rest.
- **Sheets**: dismiss via close circle (scrim tap should also dismiss in production). Only one sheet at a time; Add module → Build a computed field replaces the sheet.
- **Hover/press**: cards raise (card → card-hover), circles brighten to #fff, steppers to #E9E6E2, accent buttons to #F05F35, ink button to #2E2C29, token chips invert. On touch targets, mirror these as pressed states. All tap targets ≥ 38px; steppers 38, circles 40–64.
- **Screen enter** uses fade; rest card and edit banner use rise; sheets use the sheet curve. Respect reduce-motion by dropping transforms.
- **Responsive**: single fluid column; grid columns and cards stretch with width; type sizes fixed; bottom padding must always clear the floating nav (130) — increase by the safe-area inset on real devices.

## State Management
Local UI state in the prototype (map to the codebase's store/navigation as appropriate):
| State | Type | Notes |
|---|---|---|
| screen | 'dash' \| 'progress' \| 'session' \| 'stub' | in production, real routes |
| tab | 'dash' \| 'schedule' \| 'library' \| 'history' \| 'settings' | drives nav highlight |
| editing | boolean | dashboard edit mode |
| sheet | null \| 'add' \| 'formula' | active bottom sheet |
| drag | module key \| null | drag source during reorder |
| order | Record<moduleKey, number> | canvas order — **persist per user** |
| span | Record<moduleKey, 1 \| 2> | column span — **persist** |
| vis | Record<moduleKey, 0 \| 1> | which modules are on the canvas — **persist** |
| custom | { name, expr, unit, value } \| null | user's computed field — **persist**; production supports many |
| metric | 'e1rm' \| 'tonnage' \| 'bw' | Trends selection |
| range | 'Daily' \| 'Weekly' \| 'Monthly' | dashboard summary range (visual only in the prototype) |
| sets | Array<{ w, r, rpe }> | logged sets for the current exercise |
| weight, reps, rpe | number | pending set inputs |
| rest, elapsed | number (seconds) | countdown and session clock |
| exIdx | number | index into the session queue |
| fName, fExpr, fUnit | string | formula-builder form |

Module keys: `tonnage, e1rm, fresh, adher, bw, vol, custom`.

Configuration exposed as props in the prototype, which should become real settings: `units` ('kg' | 'lb', affects labels, plate math and stepper increment), `restSeconds` (default 90, 30–300 in 15s steps), `startInEditMode` (demo convenience only).

**Data the real app needs**: today's session (name, focus, lift/set counts, duration and tonnage estimates, block progress), per-exercise targets and last-week performance for the suggestion line, logged sets, weekly tonnage and volume-by-muscle aggregates, e1RM series per lift, bodyweight series, adherence per day over 28 days, readiness inputs (acute:chronic workload ratio, HRV), PR log, movement library counts, and the user's dashboard layout + computed-field definitions.

## Assets
No image or icon assets. Every icon is inline SVG drawn from 1.7–1.9px stroked paths on a 16/20px grid (dumbbell, clock, scale, line chart, home, calendar, chevron, close, plus) — replace with the codebase's icon set at equivalent weight and size. The avatar is a placeholder circle with initials; swap for a real image. Progress rings and sparklines are SVG; the Trends chart path is generated at runtime from the data series.

Font: **Manrope** from Google Fonts (weights 400–800). If the codebase already has a geometric-humanist sans, use it — match weight and tracking, not the family name.

## Files
| File | What it is |
|---|---|
| `PUMPED v2.dc.html` | **The approved design.** All four screens + both sheets, fully interactive. |
| `ios-frame.jsx` | Presentation-only iPhone bezel/status bar used to display the design. Not part of the product. |
| `PUMPED.dc.html` | Earlier rejected direction (flat, mono, square). Context only — do not implement. |
| `support.js` | Runtime for the HTML prototype format. Not product code. |

Open `PUMPED v2.dc.html` in a browser to interact with the design: Edit → drag/resize/remove modules → Add module → Build a computed field; tap the accent play button for the session flow; tap a metric card for Trends.
