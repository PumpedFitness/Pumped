# Pumped Frontend

React Native (Expo) fitness tracking app with an offline-first SQLite data layer.

## Getting Started

```sh
bun install
bun run ios      # or: bun run android
```

No backend required for development.

## Data Layer

The frontend owns its data layer. All data lives in a local SQLite database managed by [Drizzle ORM](https://orm.drizzle.team/).

### Architecture

```
schema.ts  →  types auto-derived  →  useRepository(table)  →  component
```

| Layer | Location | Purpose |
|-------|----------|---------|
| Schema | `src/data/local/schema.ts` | Table definitions (single source of truth) |
| Enums | `src/data/local/enums.ts` | Domain enums (types + value arrays) |
| Types | `src/types/domain.ts` | Auto-derived from schema via `InferSelectModel` |
| Migrations | `src/data/local/drizzle/` | Auto-generated SQL from schema |
| useRepository | `src/data/local/useRepository.ts` | Generic typed CRUD hook for any table |
| Custom hooks | `src/hooks/` | Complex logic on top of useRepository |

### Using data in a screen

```typescript
import { eq, desc } from 'drizzle-orm';
import { useRepository } from '../data/local/useRepository';
import { workoutSessions, workoutSessionSets } from '../data/local/schema';

function MyScreen() {
  const sessionRepo = useRepository(workoutSessions);
  const setRepo = useRepository(workoutSessionSets);

  // Read — typed from the schema, no manual types needed
  const session = sessionRepo.getById(sessionId);
  const sets = setRepo.query({
    where: eq(workoutSessionSets.workoutSessionId, sessionId),
    orderBy: [desc(workoutSessionSets.performedAt)],
  });

  // Write — triggers re-render so reads pick up the change
  sessionRepo.create({ id: uuid(), name: 'Push Day', ... });
  sessionRepo.update(sessionId, { notes: 'Good session' });
  sessionRepo.deleteById(sessionId);
}
```

### Adding a new entity

1. **Define the table** in `src/data/local/schema.ts`
2. **Generate the migration**: `bun run db:generate`
3. **Register the migration** in `src/data/local/drizzle/migrations.ts`
4. **Use it**: `const repo = useRepository(myNewTable)` — that's it

Types are derived automatically from the schema. For complex logic (computed values, multi-table operations), create a custom hook in `src/hooks/` on top of `useRepository`.

### Adding a new enum

Add the type and values array to `src/data/local/enums.ts`:

```typescript
export type MyEnum = 'A' | 'B' | 'C';
export const myEnumValues = ['A', 'B', 'C'] as const;
```

### Database migrations

Migrations are auto-generated from the Drizzle schema:

```sh
# After changing schema.ts:
bun run db:generate
```

This creates a new `.sql` file in `src/data/local/drizzle/`. Then add it to the migrations bundle in `src/data/local/drizzle/migrations.ts`.

Migrations run automatically on app startup via `initDatabase()` in `App.tsx`.

## Scripts

| Script | Description |
|--------|-------------|
| `bun run ios` | Build and run on iOS |
| `bun run android` | Build and run on Android |
| `bun run start` | Start Metro dev server |
| `bun run db:generate` | Generate migration from schema changes |
| `bun run lint` | Run ESLint |
| `bun run format` | Run Prettier |
| `bun run test` | Run tests |

## Tech Stack

- **Framework**: React Native 0.83 + Expo 55
- **Database**: SQLite (expo-sqlite) + Drizzle ORM
- **State**: Zustand + MMKV
- **UI**: HeroUI Native + Tailwind (Uniwind)
- **Navigation**: React Navigation 7
