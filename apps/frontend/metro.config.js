const {getDefaultConfig} = require('expo/metro-config');
const {withUniwindConfig} = require('uniwind/metro');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

// Allow importing .sql files as raw text (used by Drizzle migrations)
config.resolver.sourceExts.push('sql');

module.exports = withUniwindConfig(
  wrapWithReanimatedMetroConfig(config),
  {
    cssEntryFile: './global.css',
    dtsFile: './src/uniwind.d.ts',
  },
);
