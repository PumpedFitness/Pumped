import type {Config} from 'drizzle-kit';

export default {
  schema: './src/data/local/schema',
  out: './src/data/local/drizzle',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
