// Pure evaluator for user-authored computed-field expressions.
//
// The formula builder emits a flat list of string tokens (see
// `computedFieldsStore`). This module turns that token list into a number by:
//   1. mapping metric identifiers (sets, reps, load, …) to sample values,
//   2. shunting the infix token stream into RPN (shunting-yard), and
//   3. evaluating the RPN with parenthesis / arity validation.
//
// It is intentionally self-contained and side-effect free so the preview panel
// and the rendered module can both call it, and so it is trivially unit-testable.
// Real per-user data wiring can later replace `SAMPLE_METRICS` without touching
// the parser.

// The fixed metric vocabulary the builder exposes as chips. Values are
// realistic single-athlete placeholders (one training block) so the preview and
// module render a believable number until real aggregates are wired in.
// Σ reads as "sum of" — in this basic grammar the sample metrics are already
// weekly sums, so Σ is an ignorable prefix (stripped before parsing) rather than
// a value. It still renders in the expression panel.
const SUM_TOKEN = 'Σ';

export const METRIC_VALUES: Record<string, number> = {
  sets: 18,
  reps: 8,
  load: 82.5,
  bodyweight: 84.2,
  sessions: 4,
  e1RM: 182.5,
  HRV: 62,
  sleep: 7.4,
  // Window multipliers — "7d" / "28d" scale a per-day figure to a window. Kept
  // as literal factors so `load × 7d` reads naturally in the panel.
  '7d': 7,
  '28d': 28,
};

const OPERATORS: Record<string, { precedence: number; apply: (a: number, b: number) => number }> = {
  '+': { precedence: 1, apply: (a, b) => a + b },
  '−': { precedence: 1, apply: (a, b) => a - b },
  '-': { precedence: 1, apply: (a, b) => a - b },
  '×': { precedence: 2, apply: (a, b) => a * b },
  '*': { precedence: 2, apply: (a, b) => a * b },
  '÷': { precedence: 2, apply: (a, b) => (b === 0 ? NaN : a / b) },
  '/': { precedence: 2, apply: (a, b) => (b === 0 ? NaN : a / b) },
};

function isOperator(token: string): boolean {
  return token in OPERATORS;
}

function isValue(token: string): boolean {
  return token in METRIC_VALUES || /^-?\d+(\.\d+)?$/.test(token);
}

function tokenValue(token: string): number {
  if (token in METRIC_VALUES) return METRIC_VALUES[token];
  return Number(token);
}

// Parser state threaded through the per-token shunting-yard steps. `expectValue`
// is the grammar guard that forces value / operator to alternate.
type ShuntState = {
  output: string[];
  ops: string[];
  expectValue: boolean;
};

/** Pop the top operator from `ops` onto the RPN output. False if malformed. */
function flushOperator(state: ShuntState): boolean {
  const op = state.ops.pop();
  if (op === undefined || op === '(') return false;
  state.output.push(op);
  return true;
}

/** Handle one incoming operator token. False if it breaks the grammar. */
function shuntOperator(state: ShuntState, token: string): boolean {
  if (state.expectValue) return false;
  while (
    state.ops.length > 0 &&
    state.ops[state.ops.length - 1] !== '(' &&
    OPERATORS[state.ops[state.ops.length - 1]].precedence >=
      OPERATORS[token].precedence
  ) {
    if (!flushOperator(state)) return false;
  }
  state.ops.push(token);
  state.expectValue = true;
  return true;
}

/** Handle a closing paren: flush until the matching '(' is popped. */
function shuntCloseParen(state: ShuntState): boolean {
  if (state.expectValue) return false;
  while (state.ops.length > 0 && state.ops[state.ops.length - 1] !== '(') {
    if (!flushOperator(state)) return false;
  }
  return state.ops.pop() === '('; // false when unbalanced
}

/** Route a single token through the shunting-yard. False if malformed. */
function shuntToken(state: ShuntState, token: string): boolean {
  if (isValue(token)) {
    if (!state.expectValue) return false;
    state.output.push(token);
    state.expectValue = false;
    return true;
  }
  if (isOperator(token)) return shuntOperator(state, token);
  if (token === '(') {
    if (!state.expectValue) return false;
    state.ops.push('(');
    return true;
  }
  if (token === ')') return shuntCloseParen(state);
  return false; // unknown token
}

/** Shunting-yard: infix token list → RPN token list, or null if malformed. */
function toRpn(tokens: string[]): string[] | null {
  const state: ShuntState = { output: [], ops: [], expectValue: true };
  for (const token of tokens) {
    if (!shuntToken(state, token)) return null;
  }
  if (state.expectValue) return null; // trailing operator
  while (state.ops.length > 0) {
    if (state.ops[state.ops.length - 1] === '(') return null; // unbalanced
    if (!flushOperator(state)) return null;
  }
  return state.output;
}

/** Evaluate an RPN token list to a finite number, or null on any failure. */
function evalRpn(rpn: string[]): number | null {
  const stack: number[] = [];
  for (const token of rpn) {
    if (isValue(token)) {
      stack.push(tokenValue(token));
      continue;
    }
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) return null;
    stack.push(OPERATORS[token].apply(a, b));
  }
  if (stack.length !== 1) return null;
  return Number.isFinite(stack[0]) ? stack[0] : null;
}

/**
 * Evaluate a token list to a number, or return null when the expression is
 * empty, malformed (unbalanced parens, bad arity) or divides by zero.
 */
export function evaluateExpression(tokens: string[]): number | null {
  const trimmed = tokens.filter(
    token => token.trim().length > 0 && token !== SUM_TOKEN,
  );
  if (trimmed.length === 0) return null;

  const rpn = toRpn(trimmed);
  if (rpn === null) return null;
  return evalRpn(rpn);
}

/** Human-readable expression string for the ink panel / stored module. */
export function formatExpression(tokens: string[]): string {
  return tokens.join(' ').replace(/\s+/g, ' ').trim();
}

/** Round to one decimal for display, dropping a trailing ".0". */
export function formatValue(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
