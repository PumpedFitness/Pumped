import { useTableQuery } from '@/data/local/tableVersions';
import { listUsage, USAGE_TABLES } from '@/data/local/usage';
import type { UsageKind, UsageMap } from '@/data/local/usageModel';

/**
 * Reactive "what still uses this" map for one library kind, keyed by item id.
 * Feeds the in-use badges and the warning shown before a delete cascades.
 */
export function useUsage(kind: UsageKind): UsageMap {
  return useTableQuery(USAGE_TABLES[kind], () => listUsage(kind), [kind]);
}
