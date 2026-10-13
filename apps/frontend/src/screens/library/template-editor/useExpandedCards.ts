import { useCallback, useState } from 'react';

/**
 * Which superset blocks are unfolded. Tracks what is OPEN rather than what is
 * closed, so newly added groups default to folded without registration.
 */
export function useExpandedCards() {
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    () => new Set(),
  );

  const isExpanded = useCallback(
    (key: string) => expandedKeys.has(key),
    [expandedKeys],
  );

  const toggleExpanded = useCallback((key: string) => {
    setExpandedKeys(current => {
      const next = new Set(current);
      if (!next.delete(key)) {
        next.add(key);
      }
      return next;
    });
  }, []);

  return { isExpanded, toggleExpanded };
}
