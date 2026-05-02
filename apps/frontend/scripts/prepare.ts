/**
 * Prepares the frontend for development.
 * Ensures backend is running, fetches OpenAPI spec, generates all contracts.
 *
 * Run: bun run prepare
 */

import {execSync} from 'child_process';
import {existsSync} from 'fs';
import {resolve} from 'path';

const frontendRoot = resolve(__dirname, '..');

function run(cmd: string, label: string) {
  try {
    execSync(cmd, {cwd: frontendRoot, stdio: 'pipe'});
    console.log(`  ✓ ${label}`);
  } catch (e: any) {
    console.error(`  ✗ ${label}`);
    const output = e.stdout?.toString().trim() || e.stderr?.toString().trim() || e.message;
    for (const line of output.split('\n').slice(0, 5)) {
      console.error(`    ${line}`);
    }
    process.exit(1);
  }
}

function checkBackend(): boolean {
  try {
    execSync('curl -sf http://localhost:8080/actuator/health', {stdio: 'pipe'});
    return true;
  } catch {
    return false;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log('\nPreparing frontend...\n');

// 1. Check backend
console.log('[1/5] Checking backend...');
if (!checkBackend()) {
  console.error('  ✗ Backend is not running on localhost:8080');
  console.error('    Start it with: bun run backend');
  process.exit(1);
}
console.log('  ✓ Backend is running');

// 2. Fetch OpenAPI spec
console.log('[2/5] Fetching OpenAPI spec...');
run('curl -sf -u admin:admin http://localhost:8080/v3/api-docs -o openapi.json', 'openapi.json');

// 3. Generate API client
console.log('[3/5] Generating API client...');
run('bun run api:generate', 'src/data/api/generated.ts');

// 4. Generate DB schema
console.log('[4/5] Generating DB schema...');
run('bun run schema:generate', 'src/data/local/schema.generated.ts');

// 5. Generate local DB migrations
console.log('[5/5] Generating DB migrations...');
run('bun run migrations:generate', 'src/data/local/migrations.generated.ts');

console.log('\nFrontend is ready!\n');
