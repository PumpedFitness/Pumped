import {drizzle} from 'drizzle-orm/expo-sqlite';
import {openDatabaseSync} from 'expo-sqlite';
import * as schema from './schema';

const DB_NAME = 'pumped.db';

const expoDb = openDatabaseSync(DB_NAME, {enableChangeListener: false});

export const db = drizzle(expoDb, {schema});

export function initDatabase(): void {
  // Enable WAL mode and foreign keys
  expoDb.execSync('PRAGMA journal_mode = WAL;');
  expoDb.execSync('PRAGMA foreign_keys = ON;');

  // Run migrations inline (Drizzle push from schema)
  // Create all tables if they don't exist
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS exercises (
      id                TEXT PRIMARY KEY,
      name              TEXT NOT NULL,
      description       TEXT,
      exercise_category TEXT NOT NULL,
      muscle_groups     TEXT NOT NULL,
      equipment         TEXT NOT NULL,
      created_at        INTEGER NOT NULL
    );
  `);

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS workout_templates (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      name        TEXT NOT NULL,
      description TEXT,
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );
  `);

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS workout_template_exercises (
      id            TEXT PRIMARY KEY,
      template_id   TEXT NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
      exercise_id   TEXT NOT NULL REFERENCES exercises(id),
      order_index   INTEGER NOT NULL,
      sets          INTEGER NOT NULL,
      target_reps   TEXT NOT NULL,
      target_weight REAL,
      rest_seconds  INTEGER,
      notes         TEXT,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL
    );
  `);

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL,
      template_id TEXT REFERENCES workout_templates(id),
      name        TEXT NOT NULL,
      started_at  INTEGER NOT NULL,
      ended_at    INTEGER,
      notes       TEXT
    );
  `);

  expoDb.execSync(
    'CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON workout_sessions(user_id, started_at DESC);',
  );

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS workout_session_sets (
      id               TEXT PRIMARY KEY,
      session_id       TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
      exercise_id      TEXT NOT NULL REFERENCES exercises(id),
      set_index        INTEGER NOT NULL,
      reps             INTEGER NOT NULL,
      weight           REAL,
      rest_seconds     INTEGER,
      duration_seconds INTEGER,
      notes            TEXT,
      performed_at     INTEGER NOT NULL
    );
  `);

  expoDb.execSync(
    'CREATE INDEX IF NOT EXISTS idx_sets_session ON workout_session_sets(session_id, set_index);',
  );
  expoDb.execSync(
    'CREATE INDEX IF NOT EXISTS idx_sets_exercise ON workout_session_sets(exercise_id, performed_at DESC);',
  );

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      entity     TEXT NOT NULL,
      entity_id  TEXT NOT NULL,
      action     TEXT NOT NULL,
      payload    TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      retries    INTEGER NOT NULL DEFAULT 0,
      last_error TEXT
    );
  `);

  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS sync_metadata (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}
