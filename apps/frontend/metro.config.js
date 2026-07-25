const {getDefaultConfig} = require('expo/metro-config');
const {withUniwindConfig} = require('uniwind/metro');
const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config');
const path = require('path');

// eslint-disable-next-line no-undef
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Pin projectRoot to the app, but watch the whole workspace so Metro picks up
// source changes in sibling packages (e.g. @pumped/ui) and uniwind scans their
// classNames. Resolve modules from both the app and the hoisted root store.
config.projectRoot = projectRoot;
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

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
