# Frontend — Agent Guidelines

## Stack

- React Native 0.83 + Expo 55 + TypeScript
- Uniwind (Tailwind CSS v4 for React Native)
- HeroUI Native (Button, Input, Slider, etc.)
- Drizzle ORM + expo-sqlite (local-first persistence)
- Zustand + MMKV (auth/session state only)
- React Navigation (native-stack + material-top-tabs)
- Reanimated + Gesture Handler

## Data Layer

**All domain data lives in SQLite via Drizzle.** This includes user profile, body metrics, workouts, exercises — everything. Do NOT create Zustand/MMKV stores for domain data. MMKV is only for auth/session state (`authStore`).

### Schema & Migrations

- Schema files: `src/data/local/schema/`
- Migrations: `src/data/local/drizzle/` — generate with `npx drizzle-kit generate`, then register in `drizzle/index.ts`
- Custom column helpers in `schema/columns.ts` (`enumText`, `jsonArray`)

### Data Access

- **`useRepository(table)`** — generic CRUD hook for any Drizzle table. Do not create per-entity repository files.
- **Domain hooks** live in `src/hooks/` (e.g. `useUserProfile`, `useWorkoutTemplates`). These wrap `useRepository` with domain-specific convenience logic.
- The generic `useRepository` stays in `data/local/` as an infrastructure primitive.
- **Never access `db` directly** from components, screens, or hooks. All reads and writes go through `useRepository` or a domain hook that wraps it. Direct `db.insert/select/delete` calls break the repository layer and bypass re-render triggers. The only exception is `database.ts` (init/migrations) and the reset-all-data action.

## UI / UX

### Component Architecture

- **Screen files must stay small** (~30-50 lines). They compose sub-components — no business logic, sheets, or inline styles in screen files.
- **Extract reusable components** when patterns repeat. UI primitives go in `components/clay/`, feature groups in `components/<feature>/`.
- **Sub-components own their state.** Sheets, modals, and editing state live in the sub-component, not the parent.

### Mobile Input Rules

- For text/number input, use **inline editing with the OS keyboard** — no custom bottom sheets for text entry.
- **Bottom sheets** are for pickers only (date picker, option selector).
- Use **native OS controls**: `@react-native-community/datetimepicker` for dates, `OptionSelectorSheet` for enums.

### Styling

- Use Tailwind `className` via Uniwind. Avoid `style={}` except for animated styles, SVG props, and safe-area insets.
- Third-party components without `className` support: wrap with `withUniwind()` at module scope.
- Design tokens in `theme/tokens.ts` for JS contexts (SVG, animations). Prefer Tailwind classes everywhere else.
- Light theme with Clay design system (earthy palette: terracotta accent, moss brand, cream surfaces).

### Typography Utilities (from `global.css`)

`t-display` (30px) · `t-title` (21px) · `t-heading` (17px) · `t-body` (15px) · `t-label` (13.5px) · `t-caption` (12.5px) · `t-eyebrow` (11px uppercase)

### Icons

`ClayIcon` component with SVG paths — `<ClayIcon name="settings" size={18} color={colors.accent} />`. Add new icons to the `PATHS` record in `ClayIcon.tsx`.

### Clay Design System Components

Button, Card, ListRow, EditableRow, SettingsSection, Chip, Badge, StatTile, Toggle, Stepper, SegmentedControl, ProgressBar, RingGauge — all in `components/clay/`.

## File Organization

```
src/
├── components/
│   ├── clay/          # Design system primitives
│   ├── charts/        # Data-driven chart components
│   ├── forms/         # BottomSheetFrame, OptionSelectorSheet, ProfileField
│   ├── icons/         # ClayIcon SVG icon system
│   ├── settings/      # Settings sub-components (UserSettings, AppSettings)
│   └── widgets/       # Home screen widgets
├── screens/           # Thin screen orchestrators
├── hooks/             # Domain hooks (useUserProfile, useWorkoutTemplates)
├── navigation/        # React Navigation config
├── data/local/        # Drizzle schema, migrations, useRepository, database init
├── stores/            # MMKV stores (auth only)
├── utils/             # Pure functions (unit conversion, etc.)
└── theme/             # Design tokens (JS fallback for non-Tailwind contexts)
```

## Navigation

- **Stack:** `AppNavigator` — Onboarding, Main, WidgetPicker, WeightHistory, BodyFatHistory
- **Tabs:** `MainTabs` — Home, Plan, Progress, You
- Type-safe via `RootStackParamList` and `MainTabParamList`
- Tab screens use `AppShell` wrapper (handles safe area + floating tab bar spacing)
- Modal screens use `animation: 'slide_from_bottom'`
- Detail screens use `animation: 'slide_from_right'`
