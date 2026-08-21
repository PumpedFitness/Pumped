// What still depends on a library item — the shared shape behind the
// "still in use" badges and the warning shown before a delete cascades.
//
// Pure aggregation only (no database imports) so it stays unit-testable.

/** Library items whose deletion strands something else. */
export type UsageKind = 'template' | 'exercise' | 'setType';

/** One reference: `itemId` is used by the record named `refName`. */
export type UsageRow = {
  itemId: string;
  refName: string;
  /** Name of the active schedule when this reference belongs to it. */
  activeScheduleName: string | null;
};

export type UsageInfo = {
  /** Distinct names of the records referencing the item, alphabetical. */
  names: string[];
  /** The active schedule depending on the item, if any. */
  activeScheduleName: string | null;
};

/** Item id → what references it. Missing key means "used by nothing". */
export type UsageMap = Map<string, UsageInfo>;

export function buildUsageMap(rows: UsageRow[]): UsageMap {
  const collected = new Map<
    string,
    { names: Set<string>; activeScheduleName: string | null }
  >();

  for (const row of rows) {
    let entry = collected.get(row.itemId);
    if (!entry) {
      entry = { names: new Set(), activeScheduleName: null };
      collected.set(row.itemId, entry);
    }
    entry.names.add(row.refName);
    // One active schedule exists at most, so the first hit is the answer.
    entry.activeScheduleName ??= row.activeScheduleName;
  }

  return new Map(
    [...collected].map(([itemId, entry]) => [
      itemId,
      {
        names: [...entry.names].sort((a, b) => a.localeCompare(b)),
        activeScheduleName: entry.activeScheduleName,
      },
    ]),
  );
}

/** How many names an alert spells out before falling back to "+N more". */
export const USAGE_NAME_LIMIT = 3;

/** Splits the reference names into a spelled-out list and a leftover count. */
export function usageNamePreview(names: string[]): {
  list: string;
  overflow: number;
} {
  return {
    list: names.slice(0, USAGE_NAME_LIMIT).join(', '),
    overflow: Math.max(names.length - USAGE_NAME_LIMIT, 0),
  };
}
