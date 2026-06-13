# Archived workflows

Files here are **not run** by GitHub Actions — only workflows directly inside
`.github/workflows/` are scheduled.

## `ci.yml`

The previous CI pipeline (backend-centric): change detection → Kotlin/Spring
build → publish image to GHCR → deploy to staging/production over SSH → infra
provisioning over SSH → frontend build against the staging API.

It depends on the composite actions in [`.github/actions/`](../actions/)
(`setup-backend`, `setup-frontend`, `publish-backend`, `deploy-staging`,
`deploy-backend`, `build-frontend`) and a set of repo secrets (SSH_*, DB_*,
DOMAIN, JWT_SECRET, etc.).

To restore it, move it back to `.github/workflows/ci.yml` (it was replaced by
the lean TypeScript-checks → Cloudflare Workers deploy pipeline).
