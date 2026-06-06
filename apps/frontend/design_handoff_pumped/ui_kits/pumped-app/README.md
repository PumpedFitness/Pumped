# Pumped — UI Kit (Mobile App)

A high-fidelity, click-through recreation of the **Pumped** strength-training app, built entirely from the design system's tokens and patterns.

## Run
Open `index.html`. It links the system stylesheet (`../../styles.css`) so every color, font, radius and shadow comes from the real tokens.

## Flow
- **Home** — readiness hero (moss card + recovery ring), muscle-freshness chips, streak + weekly volume, last-session recap. Tap **Start** to begin a workout.
- **Active session** — log sets with weight/rep steppers; completed sets collapse, the next becomes active, a rest-timer banner counts down (+15s / Skip), the top progress bar fills, and you advance exercise → exercise to **Finish** (which drops a confirmation toast on Home).
- **Plan** — the week as a Push/Pull/Legs split with today highlighted.
- **Progress** — stat strip, weekly-volume chart, recent PRs.
- **You** — profile + grouped settings (with a live toggle).

## Theming
Colors are CSS-variable references, so the kit is themed by `styles.css` alone:
- Recolor the accent: wrap the app in `data-accent="sage"` (or `honey` / `rose`).
- Change density: the shell calls `buildKitTheme('regular')` — swap for `'compact'` or `'cozy'`.

## Files
- `index.html` — entry; loads React + the screens, mounts `<PumpedApp/>`.
- `App.jsx` — shell: tab nav, start→session flow, device scaling, toast.
- `screen-home.jsx`, `screen-session.jsx`, `screen-misc.jsx` — the screens.
- `kit-theme.jsx` — maps design tokens into the `{ C, sp }` shape the screens consume.
- `ios-frame.jsx`, `icons.jsx` — device bezel + the brand icon set.

## Note for production
These screens use inline styles bound to the token variables for fidelity and zero-build previewing. In production, compose the documented primitives in `/components` (`Button`, `Card`, `Chip`, `StatTile`, `RingGauge`, `SegmentedControl`, `Stepper`, `Toggle`, `ListRow`, `Icon`) — they encode the same decisions with a proper props API.
