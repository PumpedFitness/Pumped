# Frontend — Agent Guidelines

## Stack

- React Native 0.85 + Expo + TypeScript (strict)
- Uniwind (Tailwind CSS v4 for React Native) — styling via `className`
- HeroUI Native (Button, Input, TextArea, BottomSheet, Slider, Portal)
- Drizzle ORM + expo-sqlite (local-first persistence)
- i18next + react-i18next (en + de, fully integrated — see i18n)
- Zustand (auth/session via MMKV; in-progress-workout draft in memory)
- React Navigation (native-stack + material-top-tabs)
- Reanimated + Gesture Handler

## Data Layer

**All domain data lives in SQLite via Drizzle.** Do NOT create Zustand/MMKV
stores for domain data. MMKV is only for auth/session (`authStore`).
`currentWorkoutStore` is a pure in-memory draft state machine — all of its DB
reads/writes live in `useCurrentWorkout`.

### Access rules (lint-enforced)

- **Never import `database`** outside `src/data/local/` — the
  `no-restricted-imports` rule blocks it. All reads/writes go through:
  - **`useRepository(table)`** — generic CRUD hook for any Drizzle table.
    No per-entity repository files.
  - **Domain hooks** in `src/hooks/` (`useUserProfile`, `useWorkoutTemplates`,
    `useWorkoutHistory`, `useWorkoutSession`, `useCurrentWorkout`,
    `useExerciseOptions`) — wrap the data layer with domain logic.
  - **Data-core functions** in `src/data/local/workouts/` (template/session
    hydration + transactional saves) — plain functions, only called from hooks.

### Reactivity (tableVersions)

Every write notifies per-table subscribers (`src/data/local/tableVersions.ts`):

- `useRepository` writes re-render **every** component reading that table —
  no manual refresh / focus-effect hacks needed.
- `useTableQuery([tables], () => query(), deps)` — run a synchronous query,
  cached until one of the tables (or a dep) changes.
- Data-core write functions call `notifyTableChanged(...)` after their
  transaction. New write functions must do the same.

### Schema & Migrations

- Schema files: `src/data/local/schema/`; custom column helpers in
  `schema/columns.ts` (`enumText`, `jsonArray`)
- Migrations: `src/data/local/drizzle/` — `npx drizzle-kit generate`, then
  register in `drizzle/index.ts`
- Multi-table writes use `db.transaction` inside data-core functions
  (`useRepository` is single-table only)

## File Organization — screens grouped by feature

`src/screens/` is grouped by **domain feature**, not by navigator shape.
Related screens live together; each screen keeps its own folder with a
`components/` subfolder for its screen-local pieces. The navigation role of
each screen (tab / modal / detail) is declared in `navigation/`, not encoded
in the folder tree.

```
src/
├── navigation/            # AppNavigator (root stack), MainTabs, AppBar
│   └── navigation.d.ts    # global RootParamList — bare useNavigation() is typed
├── screens/
│   ├── onboarding/        # OnboardingScreen + useOnboardingDraft + components/
│   ├── home/
│   │   ├── HomeScreen.tsx  #   Home tab
│   │   └── widget-picker/  #   WidgetPicker modal
│   ├── workout/           # the whole training flow
│   │   ├── plan/           #   Plan tab
│   │   ├── library/        #   Library tab
│   │   ├── current-workout/
│   │   ├── template-editor/    # + useWorkoutTemplateEditorDraft
│   │   ├── exercise-selection/ # returnRouteKey result pattern
│   │   ├── create-exercise/
│   │   ├── edit-exercise/
│   │   └── placeholder/        # "Premade workouts" stub
│   ├── history/
│   │   ├── HistoryScreen.tsx   #   History tab + components/ (summary, item)
│   │   └── completed-workout/
│   ├── tracking/
│   │   ├── metric-history/     #   detail — { metric: 'weight' | 'bodyFat' }
│   │   └── add-metric/         #   modal  — { metric }
│   └── profile/           # ProfileScreen (You tab) + UserSettings/AppSettings/LanguageSwitcher
├── components/            # SHARED components only (used by 2+ screens)
│   ├── clay/              # design-system primitives
│   ├── exercise/          # exercise UI shared across screens
│   ├── forms/             # shared form components
│   ├── icons/             # ClayIcon SVG icon system
│   ├── layout/            # AppShell, AppView, ModalHeader, ScreenHeader
│   ├── widgets/           # home-screen widget module (registry pattern)
│   ├── workout/           # current-workout overlay, template presentation
│   └── uniwind.ts         # withUniwind wrappers (AnimatedView, StyledWebView)
├── hooks/                 # domain hooks
├── data/local/            # schema, migrations, useRepository, tableVersions,
│                          # workouts/ data core, resetAllData, database init
├── i18n/                  # i18next init + resources (en, de)
├── stores/                # zustand (auth, homescreen, current-workout draft)
├── types/  utils/  theme/
```

**Co-location rule:** a component used by exactly one screen lives in that
screen's `components/` subfolder (a screen-local hook sits next to the screen
file). Promote to `src/components/` only when a second screen needs it. When
adding a screen, drop it in the feature folder it belongs to (new feature →
new top-level folder) and register the route in `navigation/`.

**Imports:** use the `@/` path alias (`@/* → src/*`, configured in
`tsconfig.json`, resolved by both TS and Metro) for anything outside the
current folder — e.g. `import { ClayIcon } from '@/components/icons/ClayIcon'`.
Keep same-folder imports relative (`./Foo`, `./components/Foo`) so a folder
stays internally relative and survives being moved as a unit. No `../` imports
— they break on every folder move; that's the whole point of the alias.

## REUSE BEFORE YOU BUILD

Check this catalog (then heroui-native's exports) before writing any new UI.
Do not hand-roll a button/row/sheet/search/empty-state that already exists.

| Need | Use |
|---|---|
| Screen wrapper, tab screen | `layout/AppShell` (reserves floating-tab-bar space) |
| Screen wrapper, stack screen | `layout/AppView` (SafeAreaView + edges prop) |
| Back-button header | `layout/ScreenHeader` |
| Modal Cancel/Title/Action header | `layout/ModalHeader` |
| Button (className-styled code) | heroui `Button` + `Button.Label` (variants: primary/secondary/ghost/danger-soft, `feedbackVariant="scale"`) |
| Button (token-styled legacy) | `clay/Button`, `clay/CTAButton` |
| Text input / textarea | heroui `Input` / `TextArea` |
| Search input (with icon) | `forms/SearchInput` (heights 48/52/54, `sheetAware`) |
| Bottom sheet | heroui `BottomSheet` (+ `useBottomSheetAwareHandlers`) |
| Option picker sheet (enums) | `forms/OptionSelectorSheet` |
| Optional numeric slider sheet | `forms/OptionalSliderSheet` |
| Selectable option row | `forms/SelectableRow` |
| Pick-or-create from a list | `forms/LibraryPicker` |
| Wheel picker (Android dates) | `forms/WheelPicker`, `forms/DateWheelPicker` |
| Date picker (iOS) | `DateTimePicker` from `@expo/ui/community/datetime-picker` |
| Card surface | `clay/Card` (variants card/sunk/raised/float) |
| Settings row | `clay/ListRow` (+ `clay/SettingsSection`, `clay/EditableRow`) |
| Segmented control | `clay/SegmentedControl` |
| Swipe-to-delete | `clay/SwipeToDelete` |
| Ring gauge / step dots | `clay/RingGauge`, `clay/StepDots` |
| Confirm/option popup | `clay/option-popup` (`OptionPopup`) |
| Empty state (dashed box) | `clay/EmptyState` |
| Exercise row (list/selection) | `exercise/ExerciseRowCard` (+ `exercise/exerciseFilter`) |
| Exercise card with sets | `exercise/ExerciseCard` + `exercise/set-table` |
| Icons | `icons/ClayIcon` — add new icons to its `PATHS` record |

## Navigation

- **Root stack** (`AppNavigator`): Onboarding, Main, + modals
  (`slide_from_bottom` + `presentation:'modal'`) and details (`slide_from_right`)
- **Tabs** (`MainTabs`): Home, Plan, Library, History, Profile — custom `AppBar`
- `navigation.d.ts` registers `RootStackParamList` globally: bare
  `useNavigation()` and `navigate()` are typed. Tab screens that navigate the
  parent stack use `CompositeScreenProps` (see `HistoryScreen`).
- **Result passing** (`ExerciseSelection`): push with
  `{ selectedExerciseIds, returnRouteKey: route.key }`; the selection screen
  dispatches `CommonActions.setParams({ exerciseSelection })` against
  `returnRouteKey` and pops. Callers consume the param in an effect guarded by
  an applied-id ref. Preserve this pattern when adding selection-style flows.
- Adding a screen: create `src/screens/<kebab-route>/`, register in
  `AppNavigator`/`MainTabs`, extend the param list.

## Styling

- **Tailwind `className` via Uniwind everywhere.** `style={}` is allowed ONLY
  for: Reanimated animated styles, safe-area inset values, SVG props,
  data-driven/computed values, and the RN shadow token objects
  (`shadows.*` from `theme/tokens.ts`).
- Third-party components without className: use the wrappers in
  `components/uniwind.ts` (`AnimatedView`, `StyledWebView`) or add one there.
- Exact values over near-miss scale classes: `text-[15px]`, `rounded-[18px]`,
  `gap-[13px]`. Don't use `t-*` typography utilities as approximations (they
  set weight/tracking/line-height). Don't use `/NN` opacity modifiers on theme
  colors when replacing an `rgba(...)` (oklab color-mix drifts) — use
  `bg-[rgba(...)]`.
- Pressed states: `active:` variants.
- `theme/tokens.ts` is for JS contexts only (icon `color` props, shadows,
  animation math). Design tokens/utilities live in `global.css`
  (`t-display` 30 · `t-title` 21 · `t-heading` 17 · `t-body` 15 · `t-label`
  13.5 · `t-caption` 12.5 · `t-eyebrow` 11 uppercase).
- Light theme, Clay design system (terracotta accent, moss brand, cream surfaces).

## i18n — every user-facing string goes through t()

- `useTranslation()` in components; data-layer throw sites use `i18n.t()`;
  pure formatters take a `t` parameter.
- Keys live in `src/i18n/resources.ts` — **always add both `en` and `de`**
  (informal du-form German). Typed `t()`: a wrong key is a typecheck error.
- Plurals: `_one`/`_other` keys + `t(key, { count })`. Interpolation:
  `{{name}}`.
- Module-level label constants carry `labelKey` (resolved with `t()` at
  render) — never call `t()` at module scope.
- Dates/weekdays/months: `toLocaleDateString(i18n.language, …)` — no
  hardcoded month/day-name arrays.
- Language switcher lives in Profile → Preferences; persisted via MMKV.

## Mobile Input Rules

- Text/number input: **inline editing with the OS keyboard** — no custom
  bottom sheets for text entry.
- Bottom sheets are for pickers only (dates, option selection).
- Dates: `@expo/ui` DateTimePicker on iOS + custom `WheelPicker` on Android.
  Do NOT add `@react-native-community/datetimepicker` (broken).
- Confirmations/errors: OS-native `Alert.alert` (heroui Toast is unused by
  convention).

## Code Quality (lint-enforced)

- Named exports only; dedicated `type XxxProps = {…}` for props (no
  interfaces, no inline types).
- Screens stay thin: compose sub-components; sheets/editing state live in the
  sub-component that owns them.
- Limits: complexity 15, 150 lines/function, 400 lines/file. Do not add
  per-file overrides — split the component instead.
- Zero `eslint-disable` comments in src/ — keep it that way.

## Commands (from `apps/frontend/`)

- `bun run typecheck` · `bun run lint` · `bun run format`
- `bun run ios` / `bun run android` / `bun run start`
- `bun run db:generate` — drizzle migrations
