/**
 * Pre-flight guard for the e2e scripts: verifies the Metro / Expo dev server is
 * running before Maestro launches the app. A debug build loads its JS bundle
 * from Metro, so without it the app red-screens and the e2e fails with a
 * confusing, unrelated error — this fails fast with an actionable message.
 *
 * Skip it (e.g. when e2e-ing a release build with an embedded bundle) with
 * SKIP_METRO_CHECK=1. Override the port with RCT_METRO_PORT.
 *
 * Run: invoked automatically by `bun run e2e` / `bun run e2e:android`.
 */

if (process.env.SKIP_METRO_CHECK) {
  console.log('• Skipping Metro check (SKIP_METRO_CHECK set)');
  process.exit(0);
}

const port = process.env.RCT_METRO_PORT ?? process.env.METRO_PORT ?? '8081';
const url = `http://localhost:${port}/status`;

try {
  const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
  const body = await res.text();
  if (res.ok && body.includes('packager-status:running')) {
    console.log(`✓ Metro is running on port ${port}`);
    process.exit(0);
  }
  throw new Error(`unexpected response (${res.status}): "${body.trim()}"`);
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  console.error(
    [
      `✗ Metro bundler is not reachable on port ${port} (${reason}).`,
      '',
      '  The e2e debug build loads its JS from Metro. Start it in another',
      '  terminal, then re-run the e2e:',
      '',
      '      bun run frontend',
      '',
      '  Running a release build with an embedded bundle? Re-run with',
      '  SKIP_METRO_CHECK=1 to bypass this guard.',
    ].join('\n'),
  );
  process.exit(1);
}
