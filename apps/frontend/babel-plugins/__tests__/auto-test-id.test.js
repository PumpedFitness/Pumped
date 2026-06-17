const { transformSync } = require('@babel/core');
const autoTestId = require('../auto-test-id');

const PLUGIN_OPTIONS = {
  components: [
    'Button',
    'CTAButton',
    'ListRow',
    'EditableRow',
    'SegmentedControl',
  ],
  labelProps: ['label'],
};

function transform(code) {
  const result = transformSync(code, {
    babelrc: false,
    configFile: false,
    plugins: [
      ['@babel/plugin-syntax-jsx'],
      [autoTestId, PLUGIN_OPTIONS],
    ],
  });
  return result.code;
}

// Pull the value of the FIRST `testID="..."` in the output, or null.
function firstTestID(code) {
  const match = code.match(/testID="([^"]*)"/);
  return match ? match[1] : null;
}

describe('auto-test-id babel plugin', () => {
  it('derives from direct text children', () => {
    const out = transform('<Button>Test Button</Button>;');
    expect(firstTestID(out)).toBe('test_button');
  });

  it('derives from text nested inside child elements', () => {
    const out = transform('<Button><Text>Test Text</Text></Button>;');
    expect(firstTestID(out)).toBe('test_text');
  });

  it('never overwrites an explicit testID', () => {
    const out = transform('<Button testID="explicit">x</Button>;');
    expect(firstTestID(out)).toBe('explicit');
  });

  it('derives from a static label prop', () => {
    const out = transform('<CTAButton label="Save Profile" />;');
    expect(firstTestID(out)).toBe('save_profile');
  });

  it('leaves dynamic children untouched', () => {
    const out = transform('<Button>{label}</Button>;');
    expect(firstTestID(out)).toBeNull();
  });

  it('ignores components outside the allowlist', () => {
    const out = transform('<RandomThing>Hello World</RandomThing>;');
    expect(firstTestID(out)).toBeNull();
  });

  it('strips punctuation and collapses to snake_case', () => {
    const out = transform("<Button>Don't Save (now)!</Button>;");
    expect(firstTestID(out)).toBe('don_t_save_now');
  });

  it('snakeCase helper is exported', () => {
    expect(autoTestId.snakeCase('Hello World')).toBe('hello_world');
  });
});
