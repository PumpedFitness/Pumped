# Pumped

An offline-first fitness tracking app built with React Native and Expo.

## Tech Stack

- **React Native** 0.83 with **Expo** 55
- **TypeScript**
- **SQLite** via expo-sqlite + **Drizzle ORM** for local persistence
- **Zustand** for state management
- **React Navigation** 7 (native stack + material top tabs)
- **Reanimated** 4 for animations
- **TailwindCSS** + Uniwind for styling
- **MMKV** for key-value storage

## Project Structure

```
apps/
├── frontend/          # React Native app
│   ├── src/
│   │   ├── components/    # UI components (Clay design system)
│   │   ├── data/local/    # SQLite schema, migrations, services
│   │   ├── navigation/    # Stack + tab navigators
│   │   ├── screens/       # App screens
│   │   ├── stores/        # Zustand stores
│   │   └── theme/         # Design tokens
│   ├── App.tsx            # Entry point
│   └── metro.config.js
└── backend/           # Kotlin/Spring Boot (not currently in use)
```

## Prerequisites

- [Node.js](https://nodejs.org) >= 22
- [Bun](https://bun.sh)
- [Xcode](https://developer.apple.com/xcode/) (for iOS)
- [Android Studio](https://developer.android.com/studio) (for Android)
- [CocoaPods](https://cocoapods.org) (for iOS)

## Getting Started

```bash
# Install dependencies
bun install:all

# iOS: install pods (first time or after native dep changes)
bun run frontend:setup:ios

# Start Metro bundler
bun run frontend

# Build and run on iOS simulator
bun run frontend:ios

# Build and run on Android emulator
bun run frontend:android
```

### iOS Simulator

1. Open Xcode and ensure you have a simulator installed (e.g. iPhone 16).
2. Run `bun run frontend:ios`.
3. If you get pod errors, run `bun run frontend:setup:ios` first.

### Android Emulator

1. Create an AVD in Android Studio via **Tools > Device Manager**.
2. Start the emulator.
3. Run `bun run frontend:android`.
4. If you get build errors, run `bun run frontend:setup:android` first.

## Scripts

| Script | Description |
| --- | --- |
| `bun run frontend` | Start Metro bundler |
| `bun run frontend:ios` | Build and run on iOS simulator |
| `bun run frontend:android` | Build and run on Android emulator |
| `bun run frontend:lint` | Lint |
| `bun run frontend:lint:fix` | Lint and auto-fix |
| `bun run frontend:typecheck` | TypeScript type checking |
| `bun run frontend:format` | Format with Prettier |
| `bun run frontend:test` | Run tests |
| `bun run frontend:setup:ios` | Clean and reinstall iOS pods |
| `bun run frontend:setup:android` | Clean Android build |
| `bun run frontend:db:generate` | Generate Drizzle migrations |
| `bun install:all` | Install all dependencies |

## Data Model

All data is stored locally in SQLite. The schema separates planned workouts from performed workouts:

```
Exercise

WorkoutTemplate
  └─ WorkoutTemplateExercise  (ordered by position)
       └─ WorkoutTemplateSet  (ordered by position)

WorkoutSession
  └─ PerformedSet  (ordered by exercisePosition, setPosition)
```

- **Exercise** — name, category, equipment, primary/secondary muscle groups.
- **WorkoutTemplate** — reusable workout with optional recurrence (every N days or selected weekdays).
- **WorkoutTemplateExercise** — exercise in a template with position, goal, and notes.
- **WorkoutTemplateSet** — set within an exercise, typed as `WARMUP`, `NORMAL`, `BACKOFF`, `DROP`, or `AMRAP`.
- **WorkoutSession** — a completed workout, optionally linked to its source template.
- **PerformedSet** — actual reps, weight, RPE, and timestamp.

Active workouts live in `src/stores/currentWorkoutStore.ts`. Finishing a workout writes the session and all sets to SQLite in a single transaction via `src/data/local/services/workoutService.ts`.
