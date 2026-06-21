import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SwipeTo, type SwipeActionHandler } from '@/components/clay/SwipeTo';
import { FavoriteHighlight } from '@/components/clay/SwipeToFavorize';

type LibrarySwipeRowProps = {
  children: ReactNode;
  favorited: boolean;
  onToggleFavorite: () => void;
  onDelete: SwipeActionHandler;
  borderRadius?: number;
};

// A library row that exposes both edges in a single gesture: swipe right to
// favorite (toggles a highlight, row stays), swipe left to delete. Shared by
// the exercise and workout lists so the behaviour stays identical.
export function LibrarySwipeRow({
  children,
  favorited,
  onToggleFavorite,
  onDelete,
  borderRadius = 0,
}: LibrarySwipeRowProps) {
  const { t } = useTranslation();

  return (
    <SwipeTo
      borderRadius={borderRadius}
      left={{
        action: () => {
          onToggleFavorite();
          return false;
        },
        color: 'warning',
        icon: 'star',
        subtitle: t('common.favorite'),
      }}
      right={{
        action: onDelete,
        color: 'danger',
        icon: 'trash',
        subtitle: t('common.delete'),
      }}
    >
      <FavoriteHighlight favorited={favorited} borderRadius={borderRadius}>
        {children}
      </FavoriteHighlight>
    </SwipeTo>
  );
}
