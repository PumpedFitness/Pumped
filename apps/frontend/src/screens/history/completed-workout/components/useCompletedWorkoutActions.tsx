import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { randomUUID } from 'expo-crypto';
import { OptionPopup } from '@pumped/ui/clay/option-popup';
import {
  ItemOptionsSheet,
  type ItemAction,
} from '@/components/layout/ItemOptionsSheet';
import { ShareSheet } from '@/components/share/ShareSheet';
import { buildWorkoutShare } from '@/data/local/share/exportShare';
import { setWorkoutSessionTemplate } from '@/data/local/workouts/sessions';
import { workoutSessionToTemplateInput } from '@/data/local/workouts/workoutTemplateConversion';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import type { WorkoutHistoryItem } from '@/hooks/useWorkoutHistory';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type UseCompletedWorkoutActionsOptions = {
  workout: WorkoutHistoryItem | null;
  onDelete: () => void;
  onDeleted: () => void;
};

export function useCompletedWorkoutActions({
  workout,
  onDelete,
  onDeleted,
}: UseCompletedWorkoutActionsOptions) {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { saveTemplate } = useWorkoutTemplates();
  const [menuVisible, setMenuVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const openTemplate = (createNew: boolean) => {
    if (!workout) return;
    if (!createNew && workout.workoutTemplateId) {
      navigation.navigate('WorkoutTemplateEditor', {
        templateId: workout.workoutTemplateId,
      });
      return;
    }
    try {
      const template = saveTemplate(
        workoutSessionToTemplateInput(workout, randomUUID),
      );
      if (!workout.workoutTemplateId)
        setWorkoutSessionTemplate(workout.id, template.id);
      navigation.navigate('WorkoutTemplateEditor', { templateId: template.id });
    } catch {
      Alert.alert(
        t('completedWorkout.templateErrorTitle'),
        t('completedWorkout.templateErrorBody'),
      );
    }
  };
  const chooseAction = (action: ItemAction) => {
    if (action === 'delete') setDeleteVisible(true);
    else if (action === 'share') setShareVisible(true);
    else openTemplate(action === 'template');
  };
  const actions = (
    <>
      <ItemOptionsSheet
        description={t('plan.card.optionsBody')}
        open={menuVisible && workout !== null}
        title={workout?.name ?? ''}
        editLabel={t('completedWorkout.editTemplate')}
        templateLabel={t('completedWorkout.createTemplate')}
        shareLabel={t('share.send.workoutCta')}
        onClose={() => setMenuVisible(false)}
        onSelect={chooseAction}
      />
      <OptionPopup
        visible={deleteVisible && workout !== null}
        title={t('history.alerts.deleteTitle', { name: workout?.name ?? '' })}
        text={t('history.alerts.deleteBody')}
        options={[]}
        selectedValue="delete"
        needsConfirmation
        confirmLabel={t('common.delete')}
        onClose={() => setDeleteVisible(false)}
        onSelect={() => {
          onDelete();
          setDeleteVisible(false);
          onDeleted();
        }}
      />
      <ShareSheet
        visible={shareVisible && workout !== null}
        onClose={() => setShareVisible(false)}
        title={workout?.name ?? ''}
        kindLabel={t('share.send.kinds.workout')}
        buildEnvelope={() => buildWorkoutShare(workout?.id ?? '')}
      />
    </>
  );
  return { actions, openOptions: () => setMenuVisible(true) };
}
