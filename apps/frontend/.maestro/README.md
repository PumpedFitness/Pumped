# E2E tests — Maestro flows via maestro-runner

Mobile end-to-end tests for the Pumped app, written as
[Maestro](https://maestro.mobile.dev) flows and executed with
[`maestro-runner`](https://github.com/devicelab-dev/maestro-runner) — a fast,
standalone (Go, **no JVM**) runner that runs Maestro YAML flows unchanged.

## Flows

| File | What it covers |
|------|----------------|
| `smoke.yaml`          | App launches and the Home tab renders. |
| `tab-navigation.yaml` | Walks the bottom tab bar (Home · Plan · Library · History · You) and asserts each screen's title. |

Assertions match real on-screen strings (the `en` values in
`src/i18n/resources.ts`) and the tab buttons' accessibility labels.

## The `appId` is parameterized

The iOS and Android builds use different bundle identifiers, so each flow
declares `appId: ${APP_ID}` and the value is passed at run time:

- **iOS** → `org.reactjs.native.example.PumpedApp` — what the native iOS
  project (`ios/PumpedApp.xcodeproj`) actually installs (the RN template
  default; `app.json` *intends* `com.pumpedapp`).
- **Android** → `com.pumpedapp` (from `app.json`).

The `bun run e2e` / `e2e:android` scripts pass the right one. If the iOS bundle
id is ever realigned to `com.pumpedapp`, both become identical.

## Prerequisites

1. **maestro-runner CLI** (single binary, no Java):
   ```sh
   curl -fsSL https://open.devicelab.dev/install/maestro-runner | bash
   # add to PATH (the installer prints this): export PATH="$HOME/.maestro-runner/bin:$PATH"
   ```
2. **A booted simulator/emulator with the app installed** — e.g. `bun run ios`
   (or `bun run android`) once to build/install. For local debug builds, keep
   Metro (`bun run start`) running; the flows `launchApp` an already-installed
   build, they don't build it.
3. The device should be **past onboarding** (flows don't clear state, so a
   persisted `hasOnboarded` opens the app on Home).

## Running (from `apps/frontend/`)

```sh
bun run e2e            # iOS simulator
bun run e2e:android    # Android emulator/device

# a single flow:
maestro-runner --platform ios test -e APP_ID=org.reactjs.native.example.PumpedApp .maestro/smoke.yaml
```

Reports (HTML · JSON · JUnit · Allure) are written to `./reports/<timestamp>/`
(gitignored). Pass `--output <dir> --flatten` to control the location (CI uses
this to collect the JUnit report).

## In CI

`.github/workflows/e2e.yml` runs these flows on GitHub Actions — Android on
`ubuntu-latest` (build APK → emulator), iOS on `macos-latest` (build → simulator).

## Adding a flow

Create `.maestro/<name>.yaml` starting with `appId: ${APP_ID}`, then `---`, then
the steps. Prefer asserting/tapping by accessibility label or stable copy.
