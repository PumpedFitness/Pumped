import {defineConfig} from 'orval';

export default defineConfig({
  dumbbell: {
    input: './openapi.json',
    output: {
      target: './src/data/api/generated.ts',
      client: 'fetch',
      baseUrl: false,
      override: {
        mutator: {
          path: './src/data/api/fetchClient.ts',
          name: 'fetchClient',
        },
      },
    },
  },
});
