import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TrackIllnessSheet } from '@/components/health/TrackIllnessSheet';
import { useStartSession } from '@/hooks/useStartSession';
import { QuickActions } from './QuickActions';
import { useQuickActions } from './useQuickActions';

type WidgetProps = { colSpan: number; width: number; editing: boolean };

/**
 * The instant-action circles as a grid widget.
 *
 * Deliberately card-less: the circles carry their own surface and shadow, and
 * nesting them in a card of the same paper would erase them. What makes it a
 * widget is that it can be moved, removed and re-added — not that it grew a
 * frame.
 *
 * Editing shows the unplaced catalog inline, so the row has two edit layers at
 * once: the grid's own remove badge for the whole widget, and per-circle
 * add/remove inside it.
 */
export function QuickActionsWidget({ editing }: WidgetProps) {
  const { t } = useTranslation();
  const startSession = useStartSession();
  const [illnessSheet, setIllnessSheet] = useState(false);
  const quick = useQuickActions(startSession, () => setIllnessSheet(true));

  if (quick.actions.length === 0 && !editing) {
    // Everything removed and nothing to edit — the widget keeps its slot in
    // the layout but must not leave a tall gap in the grid.
    return <View className="h-[1px]" />;
  }

  return (
    <>
      <QuickActions
        actions={quick.actions}
        available={quick.available}
        editing={editing}
        onAdd={quick.add}
        onRemove={quick.remove}
        addLabel={label => t('home.quick.addA11y', { label })}
        removeLabel={label => t('home.quick.removeA11y', { label })}
      />
      {/* Mounted regardless of the sheet's state: heroui does not reliably
          present a sheet that is only mounted once it is opened. */}
      <TrackIllnessSheet
        visible={illnessSheet}
        onClose={() => setIllnessSheet(false)}
      />
    </>
  );
}
