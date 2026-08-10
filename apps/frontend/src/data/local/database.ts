import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';
import migrations from './drizzle';
import { seedDevelopmentData } from './seed';
import { seedBuiltInTags } from './seed/builtinTags';
import { seedExerciseCatalog } from './seed/exerciseCatalog';

const DB_NAME = 'pumped.db';

const expoDb = openDatabaseSync(DB_NAME, { enableChangeListener: false });

export const db = drizzle(expoDb, { schema });

export async function initDatabase(): Promise<void> {
  expoDb.execSync('PRAGMA journal_mode = WAL;');
  expoDb.execSync('PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  // Built-in set types / fields and the starter exercise catalog are app
  // constants — seed them in every build (both idempotent). The catalog is what
  // the onboarding wizard builds a first program from.
  seedBuiltInTags(db, Date.now());
  seedExerciseCatalog(db, Date.now());
  if (__DEV__) {
    seedDevelopmentData(db);
  }
}
