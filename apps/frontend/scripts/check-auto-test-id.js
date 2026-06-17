// Standalone proof that the auto-test-id babel plugin derives the right ids.
// Run: `node scripts/check-auto-test-id.js` (from apps/frontend).
const { transformSync } = require('@babel/core');
const autoTestId = require('../babel-plugins/auto-test-id');

const PLUGIN_OPTIONS = {
  components: ['Button', 'CTAButton', 'ListRow', 'EditableRow', 'SegmentedControl'],
  labelProps: ['label'],
};

function transform(code) {
  return transformSync(code, {
    babelrc: false,
    configFile: false,
    plugins: [['@babel/plugin-syntax-jsx'], [autoTestId, PLUGIN_OPTIONS]],
  }).code;
}

const cases = [
  ['<Button>Test Button</Button>', 'test_button'],
  ['<Button><Text>Test Text</Text></Button>', 'test_text'],
  ['<Button testID="explicit">x</Button>', 'explicit'],
  ['<CTAButton label="Save Profile" />', 'save_profile'],
  ['<Button>{label}</Button>', null /* untouched */],
];

let failed = 0;
for (const [src, expected] of cases) {
  const out = transform(src);
  const m = out.match(/testID="([^"]*)"/);
  const actual = m ? m[1] : null;
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${src}`);
  console.log(`      -> ${out.replace(/\n/g, ' ').trim()}`);
  console.log(`      testID = ${JSON.stringify(actual)} (expected ${JSON.stringify(expected)})`);
}

if (failed > 0) {
  console.error(`\n${failed} case(s) failed`);
  process.exit(1);
}
console.log('\nAll cases passed.');
