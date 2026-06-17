module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // Resolve the `@/*` alias (declared in tsconfig.json) at transform time, so
    // it works in every Babel-based bundler/runner: the bare `react-native
    // bundle` the iOS Release build runs, Expo CLI, and Jest.
    [
      'module-resolver',
      {
        alias: { '@': './src' },
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ts',
          '.ios.tsx',
          '.android.tsx',
          '.tsx',
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.json',
        ],
      },
    ],
    ['inline-import', { extensions: ['.sql'] }],
    // Auto-derive Maestro `testID`s from the visible text of interactive clay
    // primitives (see babel-plugins/auto-test-id.js). Explicit `testID`s win.
    [
      require.resolve('./babel-plugins/auto-test-id'),
      {
        components: [
          'Button',
          'CTAButton',
          'ListRow',
          'EditableRow',
          'SegmentedControl',
        ],
        labelProps: ['label'],
      },
    ],
    // react-native-reanimated/plugin must remain last.
    'react-native-reanimated/plugin',
  ],
};
