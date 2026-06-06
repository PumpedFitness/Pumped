import * as React from 'react';

export interface SegmentedControlProps {
  /** 2–4 short options — strings, or { value, label } objects. */
  options: Array<string | { value: string; label: string }>;
  /** Currently-selected value. */
  value: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}

/**
 * Pick-one control with a sliding accent thumb. Best for 2–4 short options
 * (density, units, time range). For longer lists use a native select.
 */
export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
