import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'src/data/api/generated.ts',
      'src/data/local/drizzle/',
      'src/data/local/schema.generated.ts',
      'src/data/local/schema.enums.generated.ts',
      'scripts/',
      'design_handoff_pumped*/',
      'node_modules/',
      'android/',
      'ios/',
      'coverage/',
      '*.config.js',
      '*.config.mjs',
      '.prettierrc.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ...tseslint.configs.disableTypeChecked,
    files: ['**/*.{js,mjs,cjs}'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      complexity: ['error', 15],
      'max-lines': [
        'error',
        {
          max: 400,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-lines-per-function': [
        'error',
        {
          IIFEs: true,
          max: 150,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': ['error', { includeExports: true }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/database', '@/data/local/database'],
              message:
                'Use useRepository or a domain hook instead of accessing the database directly.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message:
            'Use named exports. Default exports are reserved for framework-required files.',
        },
        {
          selector: 'TSInterfaceDeclaration',
          message: 'Use a type alias instead of an interface.',
        },
      ],
      'prefer-const': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: false,
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
  {
    files: ['src/**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      // React Navigation's RootParamList augmentation is an empty interface
      // by design.
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['src/data/local/useRepository.ts'],
    rules: {
      // Drizzle's generic table/query builder types require casts at this boundary.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['src/data/local/**/*.ts'],
    rules: {
      // The data layer itself is the sanctioned home of direct db access.
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['src/i18n/resources.ts'],
    rules: {
      // The complete en+de translation dictionary lives in one file so the
      // typed t() resource shape stays a single `as const` literal.
      'max-lines': 'off',
    },
  },
  {
    files: ['src/screens/workout/plan/components/WorkoutTemplateCard.tsx'],
    rules: {
      complexity: ['error', 18],
    },
  },
  {
    files: [
      'src/screens/workout/template-editor/useWorkoutTemplateEditorDraft.ts',
    ],
    rules: {
      complexity: ['error', 20],
    },
  },
  {
    files: ['src/screens/home/widget-picker/components/WidgetPickerCard.tsx'],
    rules: {
      // Existing UI debt: keep this component from growing while it is split up.
      'max-lines-per-function': [
        'error',
        {
          IIFEs: true,
          max: 210,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },
];
