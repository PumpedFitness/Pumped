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
    // react-native-reanimated/plugin must remain last.
    'react-native-reanimated/plugin',
  ],
};
