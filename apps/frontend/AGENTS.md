# Frontend — Agent Guidelines

## Stack

- React Native 0.85 + TypeScript 5.8
- HeroUI Native (UI components: Button, Input, Card, etc.)
- Uniwind 1.6 (Tailwind CSS v4 for React Native)
- React Navigation 7 (native-stack + bottom-tabs)
- Reanimated 4 + Gesture Handler 2

## Styling Rules

**Always use Tailwind `className`.** Never use `style={}` except for:
- Animated styles (Reanimated `useAnimatedStyle`)
- SVG props (fill, stroke, viewBox)
- Safe area insets on non-Uniwind components

**Third-party components** (e.g. `SafeAreaView`) — wrap with `withUniwind()` at module scope:
```tsx
import {withUniwind} from 'uniwind';
const StyledSafeAreaView = withUniwind(SafeAreaView);
```

### Typography Utilities (defined in `global.css`)

Use these instead of repeating class combinations:

| Utility | Use for |
|---|---|
| `eyebrow` | 11px mono uppercase muted labels |
| `mono-sm` | 11px mono semibold (badges, small values) |
| `mono-value` | 18px mono semibold (set weights/reps) |
| `mono-display` | 30px mono semibold (stepper values) |
| `heading-lg` | 32px bold (hero text) |
| `heading-md` | 20px semibold (section titles) |
| `body-text` | 16px medium (list row titles) |
| `body-sub` | 12px muted (subtitles) |

### Color Tokens

Semantic colors from `global.css` — use as Tailwind classes:

- `bg-background`, `text-foreground` — page level
- `bg-surface`, `bg-surface-raised`, `bg-surface-hover` — cards, elevated, hover
- `text-muted`, `text-foreground-secondary` — secondary text
- `border-border`, `border-border-soft`, `border-border-strong` — hairlines
- `bg-accent`, `text-accent`, `border-accent` — primary action color (clay)
- `bg-accent-soft` — accent at 14% opacity
- `bg-field-background`, `border-field-border` — form inputs

## Component Patterns

### Screen Wrapper

Every screen must use `<AppView>` as its root:

```tsx
import {AppView} from '../components/AppView';

export function MyScreen() {
  return (
    <AppView>
      {/* screen content */}
    </AppView>
  );
}
```

`AppView` handles safe area insets and background color. Pass `edges` to control which edges get insets (default: `['top']`). Pass `className` for additional styling.

### Component Props

Always define a named `type` for props:

```tsx
type MyComponentProps = {
  title: string;
  onPress?: () => void;
};

export function MyComponent({title, onPress}: MyComponentProps) {
  return (...);
}
```

### Icons

Use `SvgIcon` + `Icons` map from `components/IconButton`:

```tsx
import {SvgIcon, Icons} from '../components/IconButton';

<SvgIcon d={Icons.check} size={18} color={colors.accent} />
```

Add new icons to the `Icons` const in `IconButton.tsx` using Lucide-style SVG path data.

### HeroUI Native Components

Use HeroUI components where available (Button, Input, Card, etc.):

```tsx
import {Button} from 'heroui-native';

<Button variant="primary" size="lg" className="w-full rounded-sm" onPress={handlePress}>
  <Button.Label>Sign in</Button.Label>
</Button>
```

Variants: `primary`, `secondary`, `tertiary`, `outline`, `ghost`, `danger`.

## Navigation

- **Stack:** `AppNavigator` (Login, Main, ActiveWorkout, HistoryDetail, ExercisePicker)
- **Tabs:** `MainTabs` (Workout, History, Progress, Profile)
- Type-safe navigation via `RootStackParamList` and `MainTabParamList`
- Modal screens use `animation: 'slide_from_bottom'`

## Theme

- Dark-first design, forced via `Uniwind.setTheme('dark')` in `App.tsx`
- Accent color: clay (`oklch(75% 0.09 70)` / `#D4A574`)
- All tokens defined in `global.css` using CSS variables in OKLCH
- `theme/tokens.ts` exists only as a fallback for SVG/dynamic contexts — prefer Tailwind classes

## Design Reference

The design handoff lives in `design_handoff_pumped 2/`. Key specs:
- Dark-first, sharp radii (2-6px), no shadows (hairlines only)
- Touch targets: 44px minimum (iOS HIG)
- Stepper: press-and-hold ramp (320ms delay, 0.85x acceleration, 50ms floor)
- Monospace numerals everywhere numbers change
