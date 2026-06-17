import { useCallback, useState } from 'react';

type LocalFavorites = {
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

// Visual-only favorite tracking for library rows. TODO: persist once the
// schema gains a favorite field on exercises / workout templates — until then
// the highlight lives in component state and resets on unmount.
export function useLocalFavorites(): LocalFavorites {
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds],
  );

  return { isFavorite, toggleFavorite };
}
