import * as React from 'react';

export interface ListRowProps {
  /** Leading icon (rendered in a soft accent tile). Typically <Icon …/>. */
  icon?: React.ReactNode;
  /** Primary row label. */
  label: React.ReactNode;
  /** Right-aligned muted detail text (e.g. "90 sec"). */
  detail?: React.ReactNode;
  /** Right-aligned control — a <Toggle/>, chevron <Icon/>, etc. */
  trailing?: React.ReactNode;
  /** Hairline separator on top — set on every row except the first in a group. */
  divider?: boolean;
  onClick?: () => void;
}

/**
 * A grouped-list row. Stack several inside a `<Card pad={0}>` to build a
 * settings group; give every row except the first `divider`.
 */
export function ListRow(props: ListRowProps): JSX.Element;
