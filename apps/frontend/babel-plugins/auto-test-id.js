// Auto-inject `testID` props onto a curated set of interactive clay components
// for Maestro E2E tests. Runs at compile time (registered in babel.config.js).
//
// Goal: an author writes `<Button>Save Profile</Button>` (or even
// `<Button><Text>Save Profile</Text></Button>`) and gets a deterministic,
// stable Maestro target without hand-writing `testID="save_profile"`.
//
// Behaviour:
//   - Only touches JSX elements whose name is in the `components` allowlist
//     (passed via plugin options).
//   - Idempotent: if the element already has an explicit `testID`, leave it.
//   - Derives the id from the element's STATIC visible text:
//       * recurse into nested JSX children / JSXText (so text inside a nested
//         <Text> still counts), and
//       * for components that render a string prop instead of children, read
//         that prop too (configurable via `labelProps`, e.g. `label` on
//         CTAButton).
//   - snake_case the collected text: lowercase, non-alphanumerics -> `_`,
//     collapse/trim underscores.
//   - If no static text can be derived (fully dynamic children/props), do
//     nothing — leave it to a manual testID rather than guessing.
//
// CommonJS on purpose: Babel plugins load before TS/ESM transforms.

const DEFAULT_LABEL_PROPS = ['label'];

function snakeCase(raw) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

// Resolve a JSX element's name to a plain string, e.g. `Button` or
// `Foo.Bar` -> `Foo.Bar`. Returns null for unusual node shapes.
function elementName(nameNode) {
  if (!nameNode) return null;
  if (nameNode.type === 'JSXIdentifier') return nameNode.name;
  if (nameNode.type === 'JSXMemberExpression') {
    const object = elementName(nameNode.object);
    const property = nameNode.property && nameNode.property.name;
    if (object && property) return `${object}.${property}`;
  }
  return null;
}

// Collect static string fragments from a list of JSX children, recursing into
// nested JSX elements/fragments. Returns null if a non-static (dynamic
// expression) child is encountered that we can't statically resolve — callers
// treat "any dynamic part" as "leave it alone".
function collectStaticText(children, fragments) {
  for (const child of children) {
    switch (child.type) {
      case 'JSXText': {
        const trimmed = child.value.trim();
        if (trimmed) fragments.push(trimmed);
        break;
      }
      case 'JSXElement': {
        const ok = collectStaticText(child.children, fragments);
        if (!ok) return false;
        break;
      }
      case 'JSXFragment': {
        const ok = collectStaticText(child.children, fragments);
        if (!ok) return false;
        break;
      }
      case 'JSXExpressionContainer': {
        const expr = child.expression;
        // `{' '}` style whitespace and `{/* comment */}` are harmless.
        if (expr.type === 'JSXEmptyExpression') break;
        if (expr.type === 'StringLiteral') {
          const trimmed = expr.value.trim();
          if (trimmed) fragments.push(trimmed);
          break;
        }
        if (
          expr.type === 'TemplateLiteral' &&
          expr.expressions.length === 0 &&
          expr.quasis.length === 1
        ) {
          const trimmed = expr.quasis[0].value.cooked.trim();
          if (trimmed) fragments.push(trimmed);
          break;
        }
        // Anything else is dynamic (a variable, t(), conditional, etc.).
        return false;
      }
      case 'JSXSpreadChild':
        return false;
      default:
        break;
    }
  }
  return true;
}

// Read a static string from a JSX attribute value (used for `label`-style
// props). Returns the string, or null if absent / dynamic.
function staticAttributeText(attributeValue) {
  if (!attributeValue) return null; // boolean shorthand `<X label />`
  if (attributeValue.type === 'StringLiteral') return attributeValue.value;
  if (attributeValue.type === 'JSXExpressionContainer') {
    const expr = attributeValue.expression;
    if (expr.type === 'StringLiteral') return expr.value;
    if (
      expr.type === 'TemplateLiteral' &&
      expr.expressions.length === 0 &&
      expr.quasis.length === 1
    ) {
      return expr.quasis[0].value.cooked;
    }
  }
  return null;
}

module.exports = function autoTestId(babel) {
  const { types: t } = babel;

  return {
    name: 'auto-test-id',
    visitor: {
      JSXOpeningElement(path, state) {
        const opts = state.opts || {};
        const allowlist = opts.components || [];
        if (allowlist.length === 0) return;

        const name = elementName(path.node.name);
        if (!name || !allowlist.includes(name)) return;

        // Idempotent: never overwrite an explicit testID.
        const hasTestID = path.node.attributes.some(
          attr =>
            attr.type === 'JSXAttribute' &&
            attr.name &&
            attr.name.name === 'testID',
        );
        if (hasTestID) return;

        const labelProps = opts.labelProps || DEFAULT_LABEL_PROPS;
        const fragments = [];

        // 1) Static text from a `label`-style string prop.
        for (const attr of path.node.attributes) {
          if (
            attr.type === 'JSXAttribute' &&
            attr.name &&
            labelProps.includes(attr.name.name)
          ) {
            const text = staticAttributeText(attr.value);
            if (text && text.trim()) fragments.push(text.trim());
          }
        }

        // 2) Static text from children (recursing into nested JSX). A dynamic
        // child aborts derivation entirely — better no id than a wrong one.
        const parent = path.parent;
        if (parent && parent.type === 'JSXElement') {
          const ok = collectStaticText(parent.children, fragments);
          if (!ok) return;
        }

        if (fragments.length === 0) return;

        const derived = snakeCase(fragments.join(' '));
        if (!derived) return;

        path.node.attributes.push(
          t.jsxAttribute(t.jsxIdentifier('testID'), t.stringLiteral(derived)),
        );
      },
    },
  };
};

// Exposed for unit tests.
module.exports.snakeCase = snakeCase;
