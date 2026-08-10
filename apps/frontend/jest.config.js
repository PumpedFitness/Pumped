module.exports = {
  preset: '@react-native/jest-preset',

  // Bun workspaces hoist deps into an isolated store at the repo root, so real
  // paths look like:
  //   <root>/node_modules/.bun/@react-native+jest-preset@x.y.z+hash/node_modules/@react-native/jest-preset/...
  // The preset's default pattern decides at the FIRST "node_modules/", which is
  // now Bun's ".bun/" wrapper rather than the package name — so React Native's
  // own ESM sources were skipped by the transformer and failed to parse. The
  // extra "(?!\.bun/)" makes the wrapper segment fall through so the decision is
  // made at the inner "node_modules/", where the package name actually is.
  transformIgnorePatterns: [
    'node_modules/(?!\\.bun/)(?!((jest-)?react-native|@react-native(-community)?|@pumped/ui)/)',
  ],
};
