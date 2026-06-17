import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SwipeTo,
  type SwipeActionHandler,
  type SwipeActionResult,
} from '@/components/clay/SwipeTo';

// Kept backward-compatible: these alias the generic <SwipeTo> action types so
// existing importers (ExerciseCard, exerciseSetTableModel) keep compiling.
export type DeleteResult = SwipeActionResult;
export type DeleteHandler = SwipeActionHandler;

type SwipeToDeleteProps = {
  children: ReactNode;
  /**
   * Removes the row. May delete synchronously (return void/true) or defer to a
   * confirmation and resolve `false` when cancelled — in which case the row
   * springs back instead of being removed.
   */
  onDelete: DeleteHandler;
  borderRadius?: number;
};

// Thin preset over <SwipeTo>: swipe-from-right, danger fill, trash icon,
// "Delete" subtitle. Commits the row removal via onDelete.
export function SwipeToDelete({
  children,
  onDelete,
  borderRadius = 0,
}: SwipeToDeleteProps) {
  const { t } = useTranslation();

  return (
    <SwipeTo
      right={{
        action: onDelete,
        color: 'danger',
        icon: 'trash',
        subtitle: t('common.delete'),
      }}
      borderRadius={borderRadius}
    >
      {children}
    </SwipeTo>
  );
}
