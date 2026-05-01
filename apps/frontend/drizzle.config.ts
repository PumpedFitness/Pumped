import type {Config} from 'drizzle-kit';

export default {
  schema: './src/data/local/schema.ts',
  out: './src/data/local/drizzle',
  dialect: 'sqlite',
} satisfies Config;
