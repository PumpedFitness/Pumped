/**
 * Generates SQL migrations from the local Drizzle schema and bundles them
 * into a TypeScript module for the Expo SQLite migrator.
 *
 * Run: bun run migrations:generate
 */

import {execSync} from 'child_process';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {resolve} from 'path';

type MigrationJournalEntry = {
  breakpoints: boolean;
  idx: number;
  tag: string;
  version: string;
  when: number;
};

type MigrationJournal = {
  dialect: string;
  entries: MigrationJournalEntry[];
  version: string;
};

const frontendRoot = resolve(__dirname, '..');
const drizzleOutDir = resolve(frontendRoot, 'src/data/local/drizzle');
const journalPath = resolve(drizzleOutDir, 'meta/_journal.json');
const bundleOutput = resolve(frontendRoot, 'src/data/local/migrations.generated.ts');

function runDrizzleKitGenerate() {
  try {
    execSync('bunx drizzle-kit generate --config drizzle.config.ts', {
      cwd: frontendRoot,
      stdio: 'pipe',
    });
  } catch (error: unknown) {
    console.error('Failed to generate Drizzle SQL migrations.');
    printErrorOutput(error);
    process.exit(1);
  }
}

function readJournal(): MigrationJournal {
  if (!existsSync(journalPath)) {
    throw new Error(`Missing Drizzle journal at ${journalPath}`);
  }

  return JSON.parse(readFileSync(journalPath, 'utf-8')) as MigrationJournal;
}

function readMigrationSql(journal: MigrationJournal): Record<string, string> {
  const migrations: Record<string, string> = {};

  for (const entry of journal.entries) {
    const migrationKey = `m${entry.idx.toString().padStart(4, '0')}`;
    const migrationPath = resolve(drizzleOutDir, `${entry.tag}.sql`);

    if (!existsSync(migrationPath)) {
      throw new Error(`Missing Drizzle migration SQL at ${migrationPath}`);
    }

    migrations[migrationKey] = readFileSync(migrationPath, 'utf-8');
  }

  return migrations;
}

function writeMigrationBundle(
  journal: MigrationJournal,
  migrations: Record<string, string>,
) {
  const migrationBundle = {
    journal,
    migrations,
  };

  const content = [
    '// @generated — do not edit manually.',
    '// Source: drizzle-kit generate output in src/data/local/drizzle.',
    '// Regenerate with: bun run migrations:generate',
    '',
    `const migrations = ${JSON.stringify(migrationBundle, null, 2)};`,
    '',
    'export default migrations;',
    '',
  ].join('\n');

  writeFileSync(bundleOutput, content);
}

function printErrorOutput(error: unknown) {
  if (!(error instanceof Error)) {
    console.error(String(error));
    return;
  }

  const commandError = error as Error & {
    stderr?: Buffer;
    stdout?: Buffer;
  };

  const output = commandError.stdout?.toString().trim()
    || commandError.stderr?.toString().trim()
    || commandError.message;

  for (const line of output.split('\n').slice(0, 8)) {
    console.error(`  ${line}`);
  }
}

console.log('1. Generating SQL migrations from schema.ts...');
runDrizzleKitGenerate();

console.log('2. Bundling migrations for expo-sqlite...');
const journal = readJournal();
const migrations = readMigrationSql(journal);
writeMigrationBundle(journal, migrations);

console.log('Done!');
console.log(`  SQL:    ${drizzleOutDir}`);
console.log(`  Bundle: ${bundleOutput}`);
