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

### Device helpers

- `bun run device:doctor` — check local mobile tooling
- `bun run dev:ready -- ios|android` — boot/check a device, Metro, and app
- `bun run device:status -- ios|android` — concise device readiness
- `bun run device:launch -- ios|android` / `device:reload` — no rebuild
- `bun run device:screenshot -- ios|android` — writes under `.artifacts/`
- `bun run device:logs -- ios|android` — stream app-only logs
- `bun run device:reset -- ios|android --yes` — clear local app data
- `bun run e2e:flow -- ios|android <flow>` — run one Maestro flow

Pass `--device <id>` after the platform when multiple devices are active.

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
