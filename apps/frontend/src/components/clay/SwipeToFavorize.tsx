import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SwipeTo } from '@/components/clay/SwipeTo';
import { colors } from '@/theme/tokens';

// Soft warm wash applied behind a favorited row.
const FAVORITE_WASH = 'rgba(194, 151, 76, 0.12)';

type FavoriteHighlightProps = {
  children: ReactNode;
  favorited: boolean;
  borderRadius?: number;
};

// The favorited visual: a warm border + soft wash. Extracted so rows that pair
// favoriting with another swipe action (e.g. delete) can reuse the highlight
// without nesting swipe gestures.
export function FavoriteHighlight({
  children,
  favorited,
  borderRadius = 0,
}: FavoriteHighlightProps) {
  return (
    <View
      className="overflow-hidden"
      style={
        favorited
          ? {
              borderRadius,
              borderWidth: 1,
              borderColor: colors.warning,
              backgroundColor: FAVORITE_WASH,
            }
          : { borderRadius }
      }
    >
      {children}
    </View>
  );
}

type SwipeToFavorizeProps = {
  children: ReactNode;
  /**
   * Toggles the favorited state. Unlike delete, this never removes the row — it
   * just flips the highlight.
   */
  onToggleFavorite: () => void;
  /** When true the row renders its highlighted (favorited) state. */
  favorited?: boolean;
  borderRadius?: number;
};

// Thin preset over <SwipeTo>: swipe-from-left, warm fill, star icon, "Favorite"
// subtitle. Toggles a highlight without removing the row — its action returns
// `false` so the row always springs back after firing.
export function SwipeToFavorize({
  children,
  onToggleFavorite,
  favorited = false,
  borderRadius = 0,
}: SwipeToFavorizeProps) {
  const { t } = useTranslation();

  return (
    <SwipeTo
      left={{
        action: () => {
          onToggleFavorite();
          // Resolve false so the row springs back every time; the visual change
          // comes from `favorited`, not from the row staying open.
          return false;
        },
        color: 'warning',
        icon: 'star',
        subtitle: t('common.favorite'),
      }}
      borderRadius={borderRadius}
    >
      <FavoriteHighlight favorited={favorited} borderRadius={borderRadius}>
        {children}
      </FavoriteHighlight>
    </SwipeTo>
  );
}
