import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OptionPopup } from '@pumped/ui/clay/option-popup';
import {
  ItemOptionsSheet,
  type ItemAction,
} from '@/components/layout/ItemOptionsSheet';
import { ShareSheet } from '@/components/share/ShareSheet';
import { usageAlertBody } from '@/components/feedback/confirmUsageDelete';
import type { ExerciseToEdit } from '@/components/exercise/useExerciseDraft';
import { buildExerciseShare } from '@/data/local/share/exportShare';
import { useRepository } from '@/data/local/useRepository';
import { exercises } from '@/data/local/schema';
import { useUsage } from '@/hooks/useUsage';

export function useExerciseActions(
  exercise: ExerciseToEdit | null | undefined,
  onEdit: () => void,
) {
  const { t } = useTranslation();
  const repo = useRepository(exercises);
  const usage = useUsage('exercise');
  const [menuVisible, setMenuVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const references = exercise ? usage.get(exercise.id) : undefined;
  const chooseAction = (action: ItemAction) => {
    if (action === 'edit') onEdit();
    else if (action === 'share') setShareVisible(true);
    else if (action === 'delete') setDeleteVisible(true);
  };

  const actions = (
    <>
      <ItemOptionsSheet
        open={menuVisible && !!exercise}
        title={exercise?.name ?? ''}
        description={t('exerciseOverview.optionsBody')}
        editLabel={t('exerciseOverview.editA11y')}
        shareLabel={t('share.send.exerciseCta')}
        testIDPrefix="exercise-menu"
        onClose={() => setMenuVisible(false)}
        onSelect={chooseAction}
      />
      <ShareSheet
        visible={shareVisible && !!exercise}
        onClose={() => setShareVisible(false)}
        title={exercise?.name ?? ''}
        kindLabel={t('share.send.kinds.exercise')}
        buildEnvelope={() => buildExerciseShare(exercise?.id ?? '')}
      />
      <OptionPopup
        visible={deleteVisible && !!exercise}
        title={t('usage.alert.title', { name: exercise?.name ?? '' })}
        text={
          references && references.names.length > 0
            ? usageAlertBody(t, 'exercise', references)
            : t('exerciseForm.deleteAlertBody', { name: exercise?.name ?? '' })
        }
        options={[]}
        selectedValue="delete"
        needsConfirmation
        confirmLabel={t('common.delete')}
        onClose={() => setDeleteVisible(false)}
        onSelect={() => {
          if (exercise) repo.deleteById(exercise.id);
          setDeleteVisible(false);
        }}
      />
    </>
  );
  return { actions, openOptions: () => setMenuVisible(true) };
}
