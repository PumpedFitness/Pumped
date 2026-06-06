# Pumped

A fitness app monorepo powered by [Bun](https://bun.sh).

## Structure

```
apps/
├── frontend/   # React Native app
└── backend/    # Kotlin/Spring Boot backend (Dumbbell)
```

## Workout Data Model

The frontend SQLite model separates planned workouts from performed workouts:

```
WorkoutTemplate
  -> WorkoutTemplateExercise (ordered by position)
       -> WorkoutTemplateSet (ordered by position)

WorkoutSession
  -> PerformedSet (ordered by exercisePosition, then setPosition)
```

- `WorkoutTemplate` stores reusable workout metadata and an optional recurrence such as every 2 days or selected weekdays
  every 3 weeks.
- `WorkoutTemplateExercise` identifies an exercise, its zero-based `position`, optional goal, notes, and explicit sets.
- `WorkoutTemplateSet` stores its zero-based `position` and configurable type such as `WARMUP` or `NORMAL`.
- `WorkoutSession` represents one actual workout and may reference its source `workoutTemplateId`.
- `PerformedSet` stores the set type, actual reps, weight, RPE, and `performedAt`.

`position` is the standard ordering term. Performed sets use `exercisePosition` and `setPosition` because both ordered
levels must be retained. Exercise prescriptions use one flexible `goal` string instead of duplicating targets on every
set.

Frontend workout persistence is exposed through `apps/frontend/src/data/local/services/workoutService.ts`. It provides
ordered aggregate reads and transactional saves for templates and completed sessions. An active workout lives only in
`apps/frontend/src/stores/currentWorkoutStore.ts`; finishing it writes the session and all performed sets to SQLite in
one transaction. Since the local SQLite database represents one user, the service does not perform ownership checks.

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Node.js](https://nodejs.org) >= 22
- [Xcode](https://developer.apple.com/xcode/) (for iOS)
- [Android Studio](https://developer.android.com/studio) (for Android)
- [CocoaPods](https://cocoapods.org) (for iOS)
- [JDK 21+](https://adoptium.net) (for backend)
- [Docker](https://www.docker.com) (for backend services)

## Getting Started

```bash
# Install all dependencies
bun install

# iOS setup
cd apps/frontend/ios && bundle install && bundle exec pod install && cd ..

# Start the Metro bundler
bun run frontend

# Run on iOS
bun run frontend:ios

# Run on Android
bun run frontend:android

# Start services (MariaDB, Redis)
bun run services:up

# Run the backend
bun run backend
```

## Available Scripts

| Script                     | Description                        |
| -------------------------- | ---------------------------------- |
| `bun run frontend`         | Start the Metro bundler            |
| `bun run frontend:ios`     | Build and run on iOS simulator     |
| `bun run frontend:android` | Build and run on Android emulator  |
| `bun run frontend:lint`    | Lint the frontend code             |
| `bun run frontend:test`    | Run frontend tests                 |
| `bun run backend`          | Run the Spring Boot backend        |
| `bun run backend:build`    | Build the backend                  |
| `bun run backend:test`     | Run backend tests                  |
| `bun run services:up`      | Start MariaDB & Redis              |
| `bun run services:down`    | Stop MariaDB & Redis               |
| `bun run services:logs`    | Tail service logs                  |
| `bun run install:all`      | Install all workspace dependencies |

## Deployment

### Overview

The backend is deployed to a VPS over SSH using a blue/green strategy for zero downtime. The frontend is deployed
separately (app stores / OTA).

### Infrastructure

All backend services run as Docker containers on a single VPS connected via a shared `dumbbell-net` bridge network:

```
        [ nginx :80 ]
              │
     ┌────────▼────────┐
     │  upstream.conf  │  ← swapped on each deploy
     └────────┬────────┘
              │
    ┌─────────┴──────────┐
    │                    │
[blue:8080]        [green:8080]
  (active)           (idle)

[mariadb-dumbbell:3306]   [redis-dumbbell:6379]
```

### One-time Bootstrap

Run once when provisioning a new server. Requires Docker to already be installed on the VPS.

1. Add the following secrets to the GitHub repository:

| Secret             | Description                                    |
| ------------------ | ---------------------------------------------- |
| `SSH_HOST`         | Server IP or hostname                          |
| `SSH_USER`         | SSH user (e.g. `ubuntu`)                       |
| `SSH_PRIVATE_KEY`  | Private key for SSH auth                       |
| `DB_ROOT_PASSWORD` | MariaDB root password                          |
| `DB_USER`          | MariaDB application user                       |
| `DB_PASSWORD`      | MariaDB application password                   |
| `REDIS_PASSWORD`   | Redis password                                 |
| `JWT_SECRET`       | JWT signing secret (min 256-bit random string) |

2. Go to **Actions → CI Backend → Run workflow**, check the **Bootstrap** checkbox and run.

This will:

- Create the `dumbbell-net` Docker network on the server
- Start MariaDB and Redis via `docker-compose.yml`
- Wait for both services to pass their health checks

### Deploying the Backend

Every push to `main` that touches `apps/backend/**` automatically:

1. Runs `gradlew build` (compile + test)
2. Builds a Docker image via JIB and pushes it to GHCR (`ghcr.io/<owner>/dumbbell-backend`)
3. SSHes into the server and performs a blue/green deploy:
   - Pulls the new image
   - Starts the idle slot (blue or green)
   - Polls the Spring Boot `/actuator/health` endpoint until healthy
   - Rewrites `nginx/upstream.conf` and reloads nginx — zero downtime traffic switch
   - Stops the previously active slot

If the new slot fails its health check the deploy aborts and the original slot stays live.

### Local Backend Development

```bash
# Copy and fill in your local credentials
cp apps/backend/.env.example apps/backend/.env

# Start MariaDB and Redis
bun run services:up

# Run the backend (uses application.properties by default)
bun run backend
```

The `application.properties` file is used for local development with hardcoded defaults. On the server,
`SPRING_PROFILES_ACTIVE=production` activates `application-production.yml` which reads all credentials from environment
variables injected by the deploy action.
