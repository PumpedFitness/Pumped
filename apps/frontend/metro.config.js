const {getDefaultConfig} = require('expo/metro-config');
const {withUniwindConfig} = require('uniwind/metro');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

// eslint-disable-next-line no-undef
const config = getDefaultConfig(__dirname);

// Ensure projectRoot is absolute so Metro doesn't resolve to the monorepo root
config.projectRoot = __dirname;

// Allow importing .sql files as raw text (used by Drizzle migrations)
config.resolver.sourceExts.push('sql');

// NOTE: the `@/*` path alias is resolved at transform time by
// babel-plugin-module-resolver (see babel.config.js), so no Metro alias needed.
module.exports = withUniwindConfig(
  wrapWithReanimatedMetroConfig(config),
  {
    cssEntryFile: './global.css',
    dtsFile: './src/uniwind.d.ts',
  },
);
