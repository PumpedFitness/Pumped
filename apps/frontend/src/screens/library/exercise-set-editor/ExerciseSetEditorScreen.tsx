import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { randomUUID } from 'expo-crypto';
import { Input } from 'heroui-native';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { EditableExercise } from '@/types/exercise';
import type { ProgressionMode } from '@/types/workout';
import { AppView } from '@/components/layout/AppView';
import { ModalHeader } from '@/components/layout/ModalHeader';
import { PickerRow } from '@/components/exercise/PickerRow';
import { LibraryPicker } from '@/components/forms/LibraryPicker';
import { OptionSelectorSheet } from '@/components/forms/OptionSelectorSheet';
import {
  SetSheetHost,
  TemplateSetTable,
} from '@/components/exercise/set-table';
import { useSetTypeLibrary } from '@/hooks/useSetTypeLibrary';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWorkoutExerciseTypes } from '@/hooks/useWorkoutExerciseTypes';
import {
  createDraftSet,
  duplicateLastSet,
} from '@/screens/library/template-editor/useWorkoutTemplateEditorDraft';
import { useDiscardGuard } from '@/screens/library/template-editor/useDiscardGuard';

type ExerciseSetEditorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ExerciseSetEditor'
>;

export function ExerciseSetEditorScreen({
  navigation,
  route,
}: ExerciseSetEditorScreenProps) {
  const { t } = useTranslation();
  const { exercise: initialExercise, name, returnRouteKey } = route.params;

  const [draft, setDraft] = useState<EditableExercise>(initialExercise);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [progressionPickerVisible, setProgressionPickerVisible] =
    useState(false);

  const initialFingerprint = useRef(JSON.stringify(initialExercise));
  const isDirty = JSON.stringify(draft) !== initialFingerprint.current;
  const bypassGuard = useRef(false);
  const { goBack } = useDiscardGuard(isDirty, bypassGuard);

  const {
    options: setTypeOptions,
    byId: setTypesById,
    createSetType,
  } = useSetTypeLibrary();
  const { profile } = useUserProfile();
  const exerciseTypes = useWorkoutExerciseTypes();

  const typeName = draft.typeId
    ? exerciseTypes.items.find(item => item.id === draft.typeId)?.name
    : undefined;
  const progressionMode =
    draft.progressionMode === 'auto'
      ? 'manual'
      : draft.progressionMode ?? 'none';
  const progressionOptions: Array<{
    value: Exclude<ProgressionMode, 'auto'>;
    label: string;
  }> = [
    { value: 'none', label: t('progression.modes.none') },
    { value: 'manual', label: t('progression.modes.manual') },
  ];

  const setSets = (sets: EditableExercise['sets']) =>
    setDraft(current => ({ ...current, sets }));

  const done = () => {
    bypassGuard.current = true;
    navigation.dispatch({
      ...CommonActions.setParams({
        exerciseEdit: { id: randomUUID(), exercise: draft },
      }),
      source: returnRouteKey,
    });
    navigation.goBack();
  };

  return (
    <AppView edges={['top', 'bottom']}>
      <SetSheetHost
        setTypeOptions={setTypeOptions}
        onCreateSetType={createSetType}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ModalHeader
            title={name}
            rightLabel={t('templateEditor.setEditor.done')}
            onLeftPress={goBack}
            onRightPress={done}
          />

          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-5 px-5 pb-10 pt-5"
            keyboardShouldPersistTaps="handled"
          >
            <PickerRow
              label={t('templateEditor.exercises.typeLabel')}
              value={typeName}
              placeholder={t('templateEditor.exercises.typePlaceholder')}
              onPress={() => setTypePickerVisible(true)}
            />

            <Input
              className="h-[50px] rounded-[16px] border-border-hairline bg-surface-sunk px-4 text-foreground"
              placeholder={t('templateEditor.exercises.goalPlaceholder')}
              value={draft.goal}
              onChangeText={goal => setDraft(current => ({ ...current, goal }))}
            />

            <PickerRow
              label={t('progression.title')}
              value={t(`progression.modes.${progressionMode}`)}
              placeholder={t('progression.modes.none')}
              onPress={() => setProgressionPickerVisible(true)}
            />
            <Text className="t-caption -mt-3 text-muted">
              {t(`progression.helper.${progressionMode}`)}
            </Text>

            <TemplateSetTable
              sets={draft.sets}
              setTypeOptions={setTypeOptions}
              setTypesById={setTypesById}
              weightUnit={profile.weightUnit}
              onCreateSetType={createSetType}
              onAddSet={() => setSets([...draft.sets, createDraftSet()])}
              onDuplicateSet={() => setSets(duplicateLastSet(draft.sets))}
              onChangeSet={(index, set) =>
                setSets(
                  draft.sets.map((current, i) => (i === index ? set : current)),
                )
              }
              onRemoveSet={index =>
                setSets(
                  draft.sets.length > 1
                    ? draft.sets.filter((_, i) => i !== index)
                    : draft.sets,
                )
              }
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <LibraryPicker
          visible={typePickerVisible}
          title={t('templateEditor.exercises.typePickerTitle')}
          items={exerciseTypes.items}
          selectedIds={draft.typeId ? [draft.typeId] : []}
          onClose={() => setTypePickerVisible(false)}
          onChange={ids =>
            setDraft(current => ({ ...current, typeId: ids[0] ?? null }))
          }
          onCreate={exerciseTypes.createType}
        />
        <OptionSelectorSheet
          visible={progressionPickerVisible}
          title={t('progression.title')}
          value={progressionMode}
          options={progressionOptions}
          onClose={() => setProgressionPickerVisible(false)}
          onChange={progressionMode =>
            setDraft(current => ({ ...current, progressionMode }))
          }
        />
      </SetSheetHost>
    </AppView>
  );
}
