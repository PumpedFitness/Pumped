# Pumped — Agent Guidelines

## What is Pumped?

Pumped is an **offline-first** strength-training app. It works without internet — no backend required for any feature. The frontend is the single source of truth for schemas, business logic, and data.

## Monorepo Layout

```
apps/frontend/   # React Native mobile app (iOS + Android) — the main app
apps/handover/   # Optional Cloudflare Worker for device-to-device sharing
```

**Package manager:** Bun (workspaces in `apps/*`)

### Commands (run from root)

- `bun run frontend` / `frontend:ios` / `frontend:android` — start Metro / run on device
- `bun run check:verify` — formatting, lint, and TypeScript (matches CI)
- `bun run check:precommit` — verify + unit tests
- `bun run check:finish -- [ios|android]` — precommit + diff check, optionally Maestro

Agents should run `bun run check:finish` before handing work back. Include the
platform argument when the change affects a user flow and a device is available.

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
