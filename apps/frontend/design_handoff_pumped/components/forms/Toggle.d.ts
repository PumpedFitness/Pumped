import * as React from 'react';

export interface ToggleProps {
  /** On/off state. */
  checked?: boolean;
  onChange?: (next: boolean) => void;
  style?: React.CSSProperties;
}

/**
 * On/off switch — accent track when on. Pair with a ListRow via `trailing`.
 */
export function Toggle(props: ToggleProps): JSX.Element;
