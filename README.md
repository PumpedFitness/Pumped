# Pumped

An offline-first fitness tracking app built with React Native and Expo.

## Tech Stack

- **React Native** 0.85 with **Expo** 56
- **TypeScript**
- **SQLite** via expo-sqlite + **Drizzle ORM** for local persistence
- **Zustand** for state management
- **React Navigation** 7 (native stack + material top tabs)
- **Reanimated** 4 for animations
- **TailwindCSS** + Uniwind for styling
- **MMKV** for key-value storage
- **i18next** for localization (English, German)

## Project Structure

```
apps/
├── frontend/          # React Native app (iOS + Android) — the product
│   └── src/
│       ├── components/    # Shared UI (Clay design system)
│       ├── data/local/    # SQLite schema, migrations, data layer
│       ├── hooks/         # Domain hooks
│       ├── i18n/          # i18next setup + resources (en, de)
│       ├── navigation/    # Stack + tab navigators
│       ├── screens/       # Feature-grouped screens
│       ├── stores/        # Zustand stores
│       └── theme/         # Design tokens
├── handover/          # Cloudflare Worker — device-to-device handover (see below)
└── backend/           # Kotlin/Spring Boot API — currently unused
```

The **backend is not used right now** — the app is fully offline-first and no
feature depends on it.

## Prerequisites

- [Node.js](https://nodejs.org) >= 22
- [Bun](https://bun.sh)
- [Xcode](https://developer.apple.com/xcode/) (for iOS)
- [Android Studio](https://developer.android.com/studio) (for Android)
- [CocoaPods](https://cocoapods.org) (for iOS)

## Quick Start

```bash
# 1. Install dependencies
bun install:all

# 2. iOS only — install pods (first time / after native dep changes)
bun run frontend:setup:ios

# 3. Start the Metro bundler
bun run frontend

# 4. In another terminal, build & run the app
bun run frontend:ios       # iOS simulator
bun run frontend:android   # Android emulator
```

If the iOS build fails on pods run `bun run frontend:setup:ios` first; for
Android build errors run `bun run frontend:setup:android`. The other scripts
(`frontend:lint`, `frontend:typecheck`, `frontend:format`, `frontend:test`,
`frontend:e2e`, `frontend:db:generate`) live in the root `package.json` under
the `frontend:*` prefix.

## End-to-end tests (Maestro)

Mobile E2E flows live in [`apps/frontend/.maestro/`](apps/frontend/.maestro/)
(Maestro YAML) and run with
[`maestro-runner`](https://github.com/devicelab-dev/maestro-runner) — a single
Go binary (no JVM) that runs Maestro flows unchanged.

```bash
# Install the runner once (adds ~/.maestro-runner/bin to PATH)
curl -fsSL https://open.devicelab.dev/install/maestro-runner | bash

# With the app already built + installed on a booted simulator/emulator
# (e.g. `bun run frontend:ios`), run the flows:
bun run frontend:e2e          # iOS simulator
bun run frontend:e2e:android  # Android emulator/device
```

Reports (HTML · JSON · JUnit · Allure) are written to `apps/frontend/reports/`
(gitignored). See
[`apps/frontend/.maestro/README.md`](apps/frontend/.maestro/README.md) for
details and how to add flows.

**CI:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs lint,
typecheck and unit tests on every PR. The native builds and Maestro e2e suites
(Android on `ubuntu-latest`, iOS on `macos-latest`) only run on pushes to
`main` and on manual dispatch — to run them for a branch:
`gh workflow run ci.yml --ref <branch> -f force_frontend=true`.

## Handover

[`apps/handover`](apps/handover) is a small
[Cloudflare Worker](https://workers.cloudflare.com) (Hono + Workers KV) that
powers device-to-device handover — the frontend's `useHandover` hook posts a
payload, gets back a short-lived UUID, and another device fetches it.

- `POST /` → store a value in KV (30-minute TTL) → `{ uuid, ttl }`
- `GET /:uuid` → retrieve it (`404` once expired)

```bash
cd apps/handover
bun install
bun run dev      # local dev (wrangler dev)
bun run deploy   # deploy to Cloudflare (needs CLOUDFLARE_API_TOKEN)
```

CI deploys it on push to `main` via
[`.github/workflows/ci.yml`](.github/workflows/ci.yml). More detail in
[`apps/handover/README.md`](apps/handover/README.md).
