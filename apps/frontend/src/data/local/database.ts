import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';
import migrations from './drizzle';
import { seedDevelopmentData } from './seed';

const DB_NAME = 'pumped.db';

const expoDb = openDatabaseSync(DB_NAME, { enableChangeListener: false });

export const db = drizzle(expoDb, { schema });

export async function initDatabase(userId: string): Promise<void> {
  expoDb.execSync('PRAGMA journal_mode = WAL;');
  expoDb.execSync('PRAGMA foreign_keys = ON;');
  await migrate(db, migrations);
  if (__DEV__) {
    seedDevelopmentData(db, userId);
  }
}
