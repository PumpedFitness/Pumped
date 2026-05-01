# Pumped — Agent Guidelines

## Project Overview

Pumped is a strength-training fitness app. This is a bun-based monorepo with two apps:

- `apps/frontend` — React Native (TypeScript) mobile app
- `apps/backend` — Kotlin/Spring Boot backend (Dumbbell)

## Monorepo Commands

All commands run from the root via `bun run <script>`:

- `frontend` / `frontend:ios` / `frontend:android` — start Metro / run on device
- `backend` — starts Docker services + bootRun
- `backend:build` / `backend:test` — Gradle build/test
- `services:up` / `services:down` — Docker Compose (MariaDB + Redis)

## Architecture Decisions

- **Package manager:** Bun (workspaces in `apps/*`)
- **Metro config:** Uniwind must be the outermost wrapper, Reanimated inside. `watchFolders` includes monorepo root for hoisted deps.
- **CI/CD:** GitHub Actions with path-based change detection. Composite actions in `.github/actions/` for setup-frontend and setup-backend. Backend tests use Testcontainers (no docker-compose needed in CI).
- **Git remote:** SSH (`git@github.com:PumpedFitness/Pumped.git`)

## Code Conventions

- Named exports only (no `export default` for components)
- Dedicated `type` for all component props (not inline, not `interface`)
- Functional components with hooks
- No `style={}` tags — use Tailwind `className` via Uniwind
- Third-party components that don't support `className` must be wrapped with `withUniwind()` (called outside the component, not inside render)
- TypeScript strict mode, zero tolerance for `any`

## File Organization

```
apps/frontend/src/
├── components/    # Reusable UI primitives
├── screens/       # Full-page screen components
├── navigation/    # React Navigation config
├── theme/         # Design tokens (for SVG/dynamic values only)
└── types/         # Shared TypeScript types
```
