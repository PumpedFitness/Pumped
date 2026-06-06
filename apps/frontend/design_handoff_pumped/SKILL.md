---
name: pumped-design
description: Use this skill to generate well-branded interfaces and assets for Pumped, an offline-first strength-training app, either for production or throwaway prototypes/mocks. Contains the "Clay" design language — warm earthy colors, type, fonts, custom icons, component primitives, and a full mobile UI kit.
user-invocable: true
---

Read the `readme.md` file in this skill first — it is the design guide and manifest (content voice, visual foundations, iconography, and an index of everything available). Then explore the files you need:

- `styles.css` + `tokens/` — the source of truth for color, type, spacing, radius, shadow. Link `styles.css` and design against the **semantic aliases** (`--surface-card`, `--text-primary`, `--accent`, …). Recolor by setting `data-accent="terracotta|honey|rose|sage"`; re-space via `--density`.
- `components/` — React primitives (`Button`, `Card`, `Chip`, `Badge`, `ListRow`, `StatTile`, `RingGauge`, `ProgressBar`, `SegmentedControl`, `Toggle`, `Stepper`, `Icon`). Each has a `.d.ts` (props) and `.prompt.md` (what/when + usage). Compose these in production code.
- `ui_kits/pumped-app/` — a full click-through recreation of the app (Home, Active Session, Plan, Progress, You). Fork it as a starting point for new screens.
- `guidelines/` — foundation specimen cards.

**Non-negotiables of the Clay language:** warm oatmeal ground (never white/black); deep moss as the anchor for one hero card per screen; a single rationed earthy accent; **everything softly rounded** (pills for all actions/chips/nav, 12px minimum radius — never a sharp corner); soft far low-opacity shadows (or just a hairline border); Bricolage Grotesque for display + numbers, Hanken Grotesk for body; the custom 24px/1.75-stroke line icons; **no emoji**; calm second-person voice; numbers lead, always with a quiet unit and tabular figures.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets/tokens out and produce static HTML files for the user to view. If working on production code, copy the components and read the rules here to design as an expert in this brand.

If the user invokes this skill without other guidance, ask what they want to build, ask a few focused questions, and act as an expert designer who outputs HTML artifacts **or** production code as needed.
