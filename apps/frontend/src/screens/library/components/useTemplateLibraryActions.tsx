import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OptionPopup } from '@pumped/ui/clay/option-popup';
import { ShareSheet } from '@/components/share/ShareSheet';
import { usageAlertBody } from '@/components/feedback/confirmUsageDelete';
import { buildTemplateShare } from '@/data/local/share/exportShare';
import type { UsageMap } from '@/data/local/usageModel';
import type { WorkoutTemplate } from '@/types/workout';

import {
  WorkoutOptionsSheet,
  type WorkoutAction,
} from '@/components/workout/WorkoutOptionsSheet';
type PendingDelete = {
  template: WorkoutTemplate;
  resolve: (deleted: boolean) => void;
};
type UseTemplateLibraryActionsOptions = {
  usage: UsageMap;
  currentWorkoutName: string | null;
  onEdit: (template: WorkoutTemplate) => void;
  onDelete: (template: WorkoutTemplate) => void;
  onOpenWorkout: () => void;
};

export function useTemplateLibraryActions({
  usage,
  currentWorkoutName,
  onEdit,
  onDelete,
  onOpenWorkout,
}: UseTemplateLibraryActionsOptions) {
  const { t } = useTranslation();
  const [menuTemplate, setMenuTemplate] = useState<WorkoutTemplate | null>(
    null,
  );
  const [shareTemplate, setShareTemplate] = useState<WorkoutTemplate | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [workoutWarning, setWorkoutWarning] = useState(false);
  useEffect(() => () => pendingDelete?.resolve(false), [pendingDelete]);

  const requestDelete = (template: WorkoutTemplate) =>
    new Promise<boolean>(resolve => {
      pendingDelete?.resolve(false);
      setPendingDelete({ template, resolve });
    });
  const closeDelete = () => {
    pendingDelete?.resolve(false);
    setPendingDelete(null);
  };
  const chooseAction = (action: WorkoutAction) => {
    if (!menuTemplate) return;
    if (action === 'edit') onEdit(menuTemplate);
    if (action === 'share') {
      setShareTemplate(menuTemplate);
      setShareVisible(true);
    }
    if (action === 'delete') void requestDelete(menuTemplate);
  };
  const templateUsage = pendingDelete
    ? usage.get(pendingDelete.template.id)
    : undefined;
  const deleteText =
    templateUsage && templateUsage.names.length > 0
      ? usageAlertBody(t, 'template', templateUsage)
      : t('templateEditor.alerts.deleteBody');

  const popups = (
    <>
      <WorkoutOptionsSheet
        open={menuVisible}
        title={menuTemplate?.name ?? ''}
        editLabel={t('plan.card.edit')}
        shareLabel={t('share.send.templateCta')}
        testIDPrefix="template-menu"
        onSelect={chooseAction}
        onClose={() => setMenuVisible(false)}
      />
      <OptionPopup
        visible={pendingDelete !== null}
        title={t('usage.alert.title', {
          name: pendingDelete?.template.name ?? '',
        })}
        text={deleteText}
        options={[]}
        selectedValue="delete"
        needsConfirmation
        confirmLabel={t('common.delete')}
        onClose={closeDelete}
        onSelect={() => {
          if (!pendingDelete) return;
          onDelete(pendingDelete.template);
          pendingDelete.resolve(true);
          setPendingDelete(null);
        }}
      />
      <OptionPopup
        visible={workoutWarning && currentWorkoutName !== null}
        title={t('plan.alerts.inProgressTitle')}
        text={t('plan.alerts.inProgressBody', {
          name: currentWorkoutName ?? '',
        })}
        options={[{ value: 'open', label: t('plan.alerts.openWorkout') }]}
        onSelect={onOpenWorkout}
        onClose={() => setWorkoutWarning(false)}
      />
      <ShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        title={shareTemplate?.name ?? ''}
        kindLabel={t('share.send.kinds.template')}
        buildEnvelope={() => buildTemplateShare(shareTemplate?.id ?? '')}
      />
    </>
  );
  return {
    popups,
    openOptions: (template: WorkoutTemplate) => {
      setMenuTemplate(template);
      setMenuVisible(true);
    },
    requestDelete,
    warnWorkoutInProgress: () => setWorkoutWarning(true),
  };
}
