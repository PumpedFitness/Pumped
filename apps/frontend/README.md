# Pumped Frontend

React Native (Expo) fitness tracking app with an offline-first SQLite data layer.

## Getting Started

```sh
bun install
bun run ios      # or: bun run android
```

No backend required for development.

## Data Layer

The frontend owns its data layer. All data lives in a local SQLite database managed by
[Drizzle ORM](https://orm.drizzle.team/).

### Architecture

```
schema/  ->  workoutService  ->  custom hook / screen
       \->  useRepository(table)  ->  component
currentWorkoutStore  ->  active workout screen
```

| Layer           | Location                            | Purpose                                              |
| --------------- | ----------------------------------- | ---------------------------------------------------- |
| Schema          | `src/data/local/schema/`            | Table definitions (single source of truth)           |
| Enums           | `src/data/local/enums.ts`           | Domain enums (types + value arrays)                  |
| Workout types   | `src/types/workout.ts`              | Nested domain types used outside direct table access |
| Workout service | `src/data/local/services/`          | Transactional workout reads and writes               |
| Current workout | `src/stores/currentWorkoutStore.ts` | In-memory active workout state                       |
| Migrations      | `src/data/local/drizzle/`           | Auto-generated SQL from schema                       |
| useRepository   | `src/data/local/useRepository.ts`   | Generic typed CRUD hook for any table                |
| Custom hooks    | `src/hooks/`                        | UI state and refresh behavior                        |

### Workout model

Templates describe intended work; sessions and performed sets record what actually happened:

```
WorkoutTemplate
  -> WorkoutTemplateExercise (ordered by position)
       -> WorkoutTemplateSet (ordered by position)

WorkoutSession
  -> PerformedSet (ordered by exercisePosition, then setPosition)
```

| Model                     | Important fields                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| `WorkoutTemplate`         | metadata, optional day/week recurrence, timestamps                                        |
| `WorkoutTemplateExercise` | `exerciseId`, `position`, optional `goal` and `notes`                                     |
| `WorkoutTemplateSet`      | `position`, configurable `setType`                                                        |
| `WorkoutSession`          | optional source `workoutTemplateId`, `name`, `startedAt`, `endedAt`, `notes`              |
| `PerformedSet`            | session/exercise IDs, positions, `setType`, actual `reps`, `weight`, `rpe`, `performedAt` |

Positions are zero-based everywhere. `position` is used for a single ordered child list; performed sets use
`exercisePosition` and `setPosition` because they preserve both levels of the completed workout. A template exercise has
one flexible goal string instead of repeating targets on every set. Performed sets contain only actual performance
values; timing and rest prescriptions do not belong to the performed-set record.

Template recurrence uses `scheduleType` (`DAYS` or `WEEKS`) and `scheduleInterval`. Weekly schedules additionally store
selected weekdays in `workout_template_schedule_weekday`. Set types are `WARMUP`, `NORMAL`, `BACKOFF`, `DROP`, or
`AMRAP`; the performed set stores the type as a snapshot so history remains meaningful if its source template changes.

### Current workout store

```typescript
import { useCurrentWorkoutStore } from './src/stores/currentWorkoutStore';

const startWorkout = useCurrentWorkoutStore.getState().startWorkout;
const saveSet = useCurrentWorkoutStore.getState().saveSet;
const finishWorkout = useCurrentWorkoutStore.getState().finishWorkout;

startWorkout({
  workoutTemplateId: template.id,
});

saveSet({
  exerciseId: benchPressId,
  exercisePosition: 0,
  setPosition: 0,
  setType: 'WARMUP',
  reps: 10,
  weight: 20,
});

const completedSession = finishWorkout();
```

The active workout and its sets live only in the memory-backed Zustand store. Starting or editing a workout does not
write to SQLite. `finishWorkout` commits the session and all performed sets in one database transaction and clears the
store after the write succeeds. `discardWorkout` clears it without writing anything. Because this store is intentionally
not persisted, an active workout is lost when the app process restarts.

The workout service handles templates and completed workout history. `saveWorkoutTemplate` replaces a template's
complete ordered exercise/set structure, while `saveCompletedWorkout` is the single persistence path used when the
current workout finishes. Reads return ordered nested models through `getWorkoutTemplate` and `getWorkoutSession`. The
local database represents one user, so service methods do not accept a user ID or perform ownership filtering.

### Using a single table in a screen

Use `useRepository` for simple entities that do not require a multi-table transaction.

### Adding a new entity

1. **Define the table** in `src/data/local/schema/`
2. **Generate the migration**: `bun run db:generate`
3. **Review the generated SQL**, especially data backfills and table rebuilds
4. **Use it**: `const repo = useRepository(myNewTable)`

The migration index is regenerated automatically. Put multi-table persistence in a service under
`src/data/local/services/`; use a custom hook under `src/hooks/` when React state or refresh behavior is needed.

### Adding a new enum

Add the type and values array to `src/data/local/enums.ts`:

```typescript
export type MyEnum = 'A' | 'B' | 'C';
export const myEnumValues = ['A', 'B', 'C'] as const;
```

### Database migrations

Migrations are auto-generated from the Drizzle schema:

```sh
# After changing files under schema/:
bun run db:generate
```

This creates a new `.sql` file and snapshot under `src/data/local/drizzle/`, then regenerates `index.ts`. Migrations run
automatically on app startup via `initDatabase(userId)`.

### Development sample data

Development builds seed sample workout data after migrations run. The seed is scoped to the active guest or logged-in
user and is idempotent, so restarting the app does not duplicate rows.

The sample includes:

- Fifteen exercises covering free weights, machines, and bodyweight movements
- Five workout templates with weekly, interval, and unscheduled examples
- Active and inactive templates with all supported set styles represented
- Twenty-four completed workouts spread across roughly three months
- Progressive loads, RPEs, notes, bodyweight sets, and recent activity for history widgets

The seed lives under `src/data/local/seed/`, is orchestrated by
`src/data/local/seed.ts`, and only runs when `__DEV__` is true. Sample history
is refreshed on startup so relative-date charts continue to show recent data.

## Scripts

| Script                | Description                            |
| --------------------- | -------------------------------------- |
| `bun run ios`         | Build and run on iOS                   |
| `bun run android`     | Build and run on Android               |
| `bun run start`       | Start Metro dev server                 |
| `bun run db:generate` | Generate migration from schema changes |
| `bun run lint`        | Run ESLint                             |
| `bun run typecheck`   | Run TypeScript without emitting files  |
| `bun run format`      | Run Prettier                           |
| `bun run test`        | Run tests                              |

## Tech Stack

- **Framework**: React Native 0.83 + Expo 55
- **Database**: SQLite (expo-sqlite) + Drizzle ORM
- **State**: Zustand + MMKV
- **UI**: HeroUI Native + Tailwind (Uniwind)
- **Navigation**: React Navigation 7
