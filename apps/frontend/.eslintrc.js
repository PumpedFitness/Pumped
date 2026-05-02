module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: [
    'src/data/api/generated.ts',
    'src/data/local/schema.generated.ts',
    'src/data/local/schema.enums.generated.ts',
    'scripts/',
    'design_handoff_pumped*/',
  ],
};
