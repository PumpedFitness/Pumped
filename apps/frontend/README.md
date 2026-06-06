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
schema/  ->  inferred row types  ->  useRepository(table)  ->  component
```

| Layer         | Location                          | Purpose                                              |
| ------------- | --------------------------------- | ---------------------------------------------------- |
| Schema        | `src/data/local/schema/`          | Table definitions (single source of truth)           |
| Enums         | `src/data/local/enums.ts`         | Domain enums (types + value arrays)                  |
| Workout types | `src/types/workout.ts`            | Nested domain types used outside direct table access |
| Migrations    | `src/data/local/drizzle/`         | Auto-generated SQL from schema                       |
| useRepository | `src/data/local/useRepository.ts` | Generic typed CRUD hook for any table                |
| Custom hooks  | `src/hooks/`                      | Complex logic on top of useRepository                |

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

### Using data in a screen

```typescript
import { eq, desc } from 'drizzle-orm';
import { useRepository } from '../data/local/useRepository';
import { workoutSessions, performedSets } from '../data/local/schema';

function MyScreen() {
  const sessionRepo = useRepository(workoutSessions);
  const setRepo = useRepository(performedSets);

  // Reads are typed from the schema.
  const session = sessionRepo.getById(sessionId);
  const sets = setRepo.query({
    where: eq(performedSets.workoutSessionId, sessionId),
    orderBy: [desc(performedSets.performedAt)],
  });

  // Writes trigger a re-render so reads pick up the change.
  sessionRepo.create({ id: uuid(), name: 'Push Day', ... });
  sessionRepo.update(sessionId, { notes: 'Good session' });
  sessionRepo.deleteById(sessionId);
}
```

### Adding a new entity

1. **Define the table** in `src/data/local/schema/`
2. **Generate the migration**: `bun run db:generate`
3. **Review the generated SQL**, especially data backfills and table rebuilds
4. **Use it**: `const repo = useRepository(myNewTable)`

The migration index is regenerated automatically. For complex logic (computed values, multi-table operations), create a
custom hook in `src/hooks/` on top of `useRepository`.

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

- Four barbell exercises
- A weekly push template scheduled for Monday and Thursday
- A full-body template scheduled every three days
- Warmup, normal, and backoff template sets
- One completed workout with performed-set history
- One active workout with partially completed squat sets

The seed lives in `src/data/local/seed.ts` and only runs when `__DEV__` is true.

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
