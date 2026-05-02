/**
 * Schema generator — uses drizzle-kit to introspect a SQLite DB
 * populated with Flyway migrations. Enums come from openapi.json.
 *
 * Run: bun run schema:generate
 */

import {Database} from 'bun:sqlite';
import {readFileSync, writeFileSync, readdirSync, existsSync, rmSync, mkdirSync} from 'fs';
import {resolve} from 'path';
import {execSync} from 'child_process';
import {Parser} from 'node-sql-parser';

const frontendRoot = resolve(__dirname, '..');
const migrationsDir = resolve(frontendRoot, '../backend/src/main/resources/db/migration');
const tempDbPath = resolve(frontendRoot, 'temp-introspect.db');
const pullOutDir = resolve(frontendRoot, 'src/data/local/pulled');
const schemaOutput = resolve(frontendRoot, 'src/data/local/schema.generated.ts');
const enumOutput = resolve(frontendRoot, 'src/data/local/schema.enums.generated.ts');
const openApiPath = resolve(frontendRoot, 'openapi.json');

// ─── Config ──────────────────────────────────────────────────────────────────

const EXCLUDE_TABLES = ['user', 'flyway_schema_history'];

const MERGE_AS_JSON: Record<string, {into: string; asColumn: string}> = {
  exercise_muscle_group: {into: 'exercise', asColumn: 'muscle_groups'},
  exercise_equipment: {into: 'exercise', asColumn: 'equipment'},
};

const INDEXES: Record<string, {name: string; columns: string[]}[]> = {
  workout_session: [
    {name: 'idx_sessions_user_date', columns: ['user_id', 'started_at']},
  ],
  workout_session_set: [
    {name: 'idx_sets_session', columns: ['workout_session_id', 'set_index']},
    {name: 'idx_sets_exercise', columns: ['exercise_id', 'performed_at']},
  ],
};

// ─── Step 1: Convert Flyway SQL → SQLite and populate temp DB ────────────────

const parser = new Parser();

function mariaToSqlite(sql: string): string {
  let result: string;
  try {
    const ast = parser.astify(sql, {database: 'MariaDB'});
    result = parser.sqlify(ast, {database: 'SQLite'});
  } catch {
    result = sql;
  }

  // Always apply SQLite type conversion (parser doesn't convert types)
  result = result
    .replace(/\bUUID\b/gi, 'TEXT')
    .replace(/\bVARCHAR\(\d+\)/gi, 'TEXT')
    .replace(/\bLONGTEXT\b/gi, 'TEXT')
    .replace(/\bBIGINT\b/gi, 'INTEGER')
    .replace(/\bDOUBLE\b/gi, 'REAL')
    .replace(/\bFLOAT\b/gi, 'REAL')
    .replace(/\bINT\b/gi, 'INTEGER');

  // Split multi-column ALTER TABLE (SQLite only allows one ADD COLUMN per statement)
  result = result.replace(
    /ALTER\s+TABLE\s+["`]?(\w+)["`]?\s+(ADD\s+COLUMN\s+[^;]+)/gi,
    (_, table, addCols) => {
      return addCols
        .split(/,\s*ADD\s+COLUMN\s+/i)
        .map((part: string) => `ALTER TABLE ${table} ADD COLUMN ${part.replace(/^ADD\s+COLUMN\s+/i, '')}`)
        .join(';\n');
    },
  );

  return result;
}

function createTempDb() {
  if (existsSync(tempDbPath)) rmSync(tempDbPath);

  const db = new Database(tempDbPath);
  db.run('PRAGMA foreign_keys = OFF;');

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const raw = readFileSync(resolve(migrationsDir, file), 'utf-8');

    // Split into statements first, then convert each one
    const rawStatements = raw.split(';').map((s) => s.trim()).filter(Boolean);
    for (const rawStmt of rawStatements) {
      const converted = mariaToSqlite(rawStmt);
      const subStatements = converted.split(';').map((s) => s.trim()).filter(Boolean);
      for (const stmt of subStatements) {
        try {
          db.run(stmt);
        } catch (e: any) {
          console.warn(`Warning (${file}): ${e.message}`);
        }
      }
    }
  }

  db.close();
}

// ─── Step 2: Run drizzle-kit pull ────────────────────────────────────────────

function runDrizzleKitPull() {
  if (existsSync(pullOutDir)) rmSync(pullOutDir, {recursive: true});
  mkdirSync(pullOutDir, {recursive: true});

  execSync('npx drizzle-kit pull --config drizzle-pull.config.ts', {
    cwd: frontendRoot,
    stdio: 'pipe',
  });
}

// ─── Step 3: Post-process drizzle-kit output ─────────────────────────────────

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function postProcess() {
  // Find the generated schema file from drizzle-kit
  const files = readdirSync(pullOutDir).filter((f) => f.endsWith('.ts'));
  if (files.length === 0) throw new Error('drizzle-kit pull produced no output');

  let content = readFileSync(resolve(pullOutDir, files[0]), 'utf-8');

  // Remove excluded tables
  const allExcluded = [...EXCLUDE_TABLES, ...Object.keys(MERGE_AS_JSON)];
  for (const table of allExcluded) {
    // Remove the entire export const block for this table
    const regex = new RegExp(
      `export const ${snakeToCamel(table)} = sqliteTable\\([\\s\\S]*?\\);\\n?\\n?`,
      'g',
    );
    content = content.replace(regex, '');
  }

  // Remove FK references to excluded tables
  for (const table of allExcluded) {
    const camel = snakeToCamel(table);
    content = content.replace(
      new RegExp(`\\.references\\(\\(\\) => ${camel}\\.\\w+.*?\\)`, 'g'),
      '',
    );
  }

  // Add JSON array columns to parent tables
  for (const [, rule] of Object.entries(MERGE_AS_JSON)) {
    const tableProp = snakeToCamel(rule.into);
    const colProp = snakeToCamel(rule.asColumn);
    // Insert before the closing }); of the target table
    const tableRegex = new RegExp(
      `(export const ${tableProp} = sqliteTable\\([\\s\\S]*?)(\\}\\))`,
    );
    content = content.replace(tableRegex, (match, before, closing) => {
      return `${before}\t${colProp}: text("${rule.asColumn}").notNull(), // JSON array\n${closing}`;
    });
  }

  // Add indexes
  for (const [table, indexes] of Object.entries(INDEXES)) {
    const tableProp = snakeToCamel(table);
    // Find the table definition and add index callback
    const tableRegex = new RegExp(
      `(export const ${tableProp} = sqliteTable\\("${table}",\\s*\\{)([\\s\\S]*?)(\\}\\))`,
    );
    const indexLines = indexes
      .map((idx) => {
        const cols = idx.columns.map((c) => `table.${snakeToCamel(c)}`).join(', ');
        return `\t\tindex("${idx.name}").on(${cols})`;
      })
      .join(',\n');

    content = content.replace(tableRegex, (_, start, cols, end) => {
      return `${start}${cols}}, (table) => [\n${indexLines},\n])`;
    });
  }

  // Ensure index import exists
  if (content.includes('index(') && !content.includes('index,') && !content.includes('index }')) {
    content = content.replace(
      /from "drizzle-orm\/sqlite-core"/,
      (match) => match.replace('"drizzle-orm/sqlite-core"', '"drizzle-orm/sqlite-core"'),
    );
    // Add index to imports
    content = content.replace(
      /import \{ ([^}]+) \} from "drizzle-orm\/sqlite-core"/,
      (_, imports) => {
        if (!imports.includes('index')) {
          return `import { ${imports}, index } from "drizzle-orm/sqlite-core"`;
        }
        return `import { ${imports} } from "drizzle-orm/sqlite-core"`;
      },
    );
  }

  // Add generated header
  content = '// @generated — do not edit manually.\n'
    + '// Source: Flyway migrations → drizzle-kit pull.\n'
    + '// Regenerate with: bun run schema:generate\n\n'
    + content;

  writeFileSync(schemaOutput, content);
}

// ─── Step 4: Generate enums from OpenAPI ─────────────────────────────────────

function generateEnums() {
  const spec = JSON.parse(readFileSync(openApiPath, 'utf-8'));
  const schemas = spec.components?.schemas || {};
  const enums: {name: string; values: string[]}[] = [];
  const seen = new Set<string>();

  for (const schema of Object.values(schemas) as any[]) {
    if (!schema.properties) continue;
    for (const [prop, def] of Object.entries(schema.properties) as any[]) {
      if (def.enum && !seen.has(prop)) {
        seen.add(prop);
        enums.push({name: typeName(prop), values: def.enum});
      }
      if (def.type === 'array' && def.items?.enum && !seen.has(prop)) {
        seen.add(prop);
        enums.push({name: typeName(prop), values: def.items.enum});
      }
    }
  }

  enums.sort((a, b) => a.name.localeCompare(b.name));

  const lines = [
    '// @generated — do not edit manually.',
    '// Source: OpenAPI spec (openapi.json).',
    '// Regenerate with: bun run schema:generate',
    '',
  ];

  for (const e of enums) {
    lines.push(`export type ${e.name} = ${e.values.map((v: string) => `'${v}'`).join(' | ')};`);
    lines.push('');
    const arrName = e.name.charAt(0).toLowerCase() + e.name.slice(1) + 'Values';
    lines.push(`export const ${arrName} = [${e.values.map((v: string) => `'${v}'`).join(', ')}] as const;`);
    lines.push('');
  }

  writeFileSync(enumOutput, lines.join('\n'));
}

function typeName(prop: string): string {
  const map: Record<string, string> = {equipment: 'ExerciseEquipment'};
  if (map[prop]) return map[prop];
  return prop.charAt(0).toUpperCase() + prop.slice(1);
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log('1. Creating temp SQLite DB from Flyway migrations...');
createTempDb();

console.log('2. Running drizzle-kit pull...');
runDrizzleKitPull();

console.log('3. Post-processing schema...');
postProcess();

console.log('4. Generating enums from OpenAPI...');
generateEnums();

// Cleanup
rmSync(tempDbPath, {force: true});
rmSync(pullOutDir, {recursive: true, force: true});

console.log('Done!');
console.log(`  Schema: ${schemaOutput}`);
console.log(`  Enums:  ${enumOutput}`);
