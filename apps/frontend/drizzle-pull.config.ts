import {defineConfig} from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  out: './src/data/local/pulled',
  dbCredentials: {
    url: './temp-introspect.db',
  },
});
