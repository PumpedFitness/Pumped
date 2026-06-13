# Handover

A small [Cloudflare Worker](https://workers.cloudflare.com) (Hono + Workers KV)
that backs the Pumped app's **device-to-device handover** feature: one device
stores a payload and gets a short-lived UUID; another device fetches it back.
The mobile app talks to it through the `useHandover` hook.

## Endpoints

| Method | Path     | Description |
|--------|----------|-------------|
| `POST` | `/`      | Body `{ "value": "<string>" }` → stores it (compressed) in KV with a 30-minute TTL → `201 { "uuid", "ttl": 1800 }`. `422` on an invalid body. |
| `GET`  | `/:uuid` | Returns the stored value, or `404` once it has expired. |

## Develop & deploy

```bash
bun install
bun run dev          # wrangler dev (local)
bun run deploy       # wrangler deploy (needs CLOUDFLARE_API_TOKEN)
bun run test         # vitest (@cloudflare/vitest-pool-workers)
bun run cf-typegen   # regenerate worker-configuration.d.ts after binding changes
```

Config lives in `wrangler.jsonc` (Worker name `handover`, KV binding
`HANDOVER_STORE`). CI deploys on push to `main` via the repo's
[`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).
