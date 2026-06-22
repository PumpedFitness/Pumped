# E2E tests — Maestro flows via maestro-runner

Mobile end-to-end tests for the Pumped app, written as
[Maestro](https://maestro.mobile.dev) flows and executed with
[`maestro-runner`](https://github.com/devicelab-dev/maestro-runner) — a fast,
standalone (Go, **no JVM**) runner that runs Maestro YAML flows unchanged.

## Flows

| File | What it covers |
|------|----------------|
| `smoke.yaml`          | App launches and the Home tab renders. |
| `tab-navigation.yaml` | Walks the bottom tab bar (Home · Schedule · Library · History · User) and asserts each screen renders. |
| `full_workout_flow.yaml` | Full lifecycle: create an exercise → build a template using it → create + activate a (1-day-cycle) schedule → start today's workout → log a set → end the session. |

> **`full_workout_flow.yaml` runs on Android.** The iOS build uses the OS-native
> bottom tab bar (`@react-navigation/bottom-tabs/unstable`), whose items don't
> respond to XCUITest/WDA synthetic taps on recent iOS simulators (this also
> affects `tab-navigation.yaml` locally) — so a tab-driven flow can't be driven
> on iOS locally. Android uses a JS tab bar that taps fine. After `clearState`,
> a local dev build cold-loads the JS bundle from Metro (~20s), so the flow waits
> for onboarding via `extendedWaitUntil` (a no-op against CI's baked bundle).

Navigation is driven by **testIDs** (Android `resource-id` / iOS accessibility
id), not visible text: tab buttons are `tab-<name>` and each tab's screen
container is `screen-<name>` (home · schedule · library · history · profile). These
are auto-generated from the navigator's screen names in
[`src/navigation/testIDs.ts`](../src/navigation/testIDs.ts) and applied in
`AppBar` / `MainTabs`, so adding a tab needs no e2e wiring.

Why not assert on visible text: several titles render with
`text-transform: uppercase`, so the on-screen glyphs differ from the
accessibility node's text value — UIAutomator2 then only matches via a slow,
flaky case-insensitive regex. A testID matches the exact `resource-id` fast.
In-screen content (form fields, buttons) is still matched by its real copy.

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
