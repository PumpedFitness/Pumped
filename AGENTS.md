# Pumped — Agent Guidelines

## What is Pumped?

Pumped is an **offline-first** strength-training app. It works without internet — no backend required for any feature. The frontend is the single source of truth for schemas, business logic, and data.

## Monorepo Layout

```
apps/frontend/   # React Native mobile app (iOS + Android) — the main app
apps/backend/    # Kotlin/Spring Boot API — optional, not required for any features
```

**Package manager:** Bun (workspaces in `apps/*`)

### Commands (run from root)

- `bun run frontend` / `frontend:ios` / `frontend:android` — start Metro / run on device
- `bun run backend` — starts Docker services + bootRun
- `bun run backend:build` / `backend:test` — Gradle build/test

## Code Quality Rules

- Named exports only — no `export default`
- TypeScript strict mode
- Functional components with hooks
- Dedicated `type` for all component props (not inline, not `interface`)
- Keep boilerplate low and DX high — prefer generic patterns over per-entity wiring

## Frontend Details

See [`apps/frontend/AGENTS.md`](apps/frontend/AGENTS.md) for data layer, UI/UX patterns, and component conventions.

## Git

- Remote: SSH (`git@github.com:PumpedFitness/Pumped.git`)
- CI/CD: GitHub Actions with path-based change detection
