import { useCallback, useState } from 'react';

/**
 * Which editor cards are unfolded. Tracks what is OPEN rather than what is
 * closed, so cards default to folded and a newly added exercise is folded like
 * everything else instead of having to be registered first.
 *
 * Keys are the exercise id for a card, `superset:<id>` for a whole block.
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
