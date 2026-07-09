import { useState, useRef, useEffect } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  type TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { Button } from '@/components/clay/Button';
import { LibraryPicker } from '@/components/forms/LibraryPicker';
import { useHandover } from '@/hooks/useHandover';
import { LabeledField } from './LabeledField';
import { PickerRow } from './PickerRow';
import { useExerciseDraft, type ExerciseToEdit } from './useExerciseDraft';

type FormHeaderProps = {
  onCancel: () => void;
};

function FormHeader({ onCancel }: FormHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 h-14">
      <Pressable
        onPress={onCancel}
        className="w-11 h-11 rounded-full bg-surface-sunk items-center justify-center active:opacity-60"
      >
        <ClayIcon name="x" size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
}

type PictureSectionProps = {
  picture: string | null;
  isEditing: boolean;
  onPickImage: () => void;
};

function PictureSection({
  picture,
  isEditing,
  onPickImage,
}: PictureSectionProps) {
  const { t } = useTranslation();

  return (
    <View className="items-center mt-6">
      <Pressable onPress={onPickImage}>
        {picture ? (
          <Image source={{ uri: picture }} className="w-24 h-24 rounded-full" />
        ) : (
          <View className="w-24 h-24 rounded-full bg-surface-sunk items-center justify-center">
            <ClayIcon name="plus" size={28} color={colors.accent} />
          </View>
        )}
      </Pressable>
      <Text className="text-[12.5px] text-muted mt-2">
        {picture ? t('exerciseForm.tapToChange') : t('exerciseForm.addPhoto')}
      </Text>
      <Text className="text-[21px] font-bold text-foreground mt-2">
        {isEditing ? t('exerciseForm.editTitle') : t('exerciseForm.newTitle')}
      </Text>
    </View>
  );
}

type DeleteExerciseRowProps = {
  onPress: () => void;
};

function DeleteExerciseRow({ onPress }: DeleteExerciseRowProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-center gap-2 py-3.5 mt-2"
    >
      <ClayIcon name="trash" size={18} color={colors.danger} />
      <Text className="text-[15px] font-medium text-danger">
        {t('exerciseForm.deleteCta')}
      </Text>
    </Pressable>
  );
}

type FormFooterProps = {
  displayHandoverResult: { uuid: string; ttl: number } | null;
  isHandovering: boolean;
  onShare: () => void;
  saveDisabled: boolean;
  saveLabel: string;
  onSave: () => void;
};

function FormFooter({
  displayHandoverResult,
  isHandovering,
  onShare,
  saveDisabled,
  saveLabel,
  onSave,
}: FormFooterProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 flex-col gap-2 px-5 pt-3 border-t border-border-hairline bg-background"
      // Keep the save button clear of the system navigation bar — the screen
      // draws edge-to-edge, and a button under the (translucent) bar looks
      // tappable but the bar consumes the touches.
      style={{ paddingBottom: Math.max(insets.bottom + 8, 20) }}
    >
      {displayHandoverResult && (
        <Text>
          {t('exerciseForm.handoverResult', {
            uuid: displayHandoverResult.uuid,
            ttl: displayHandoverResult.ttl,
          })}
        </Text>
      )}

      <Button onPress={onShare} disabled={isHandovering}>
        {t('exerciseForm.share')}
      </Button>

      <Button
        variant="primary"
        size="lg"
        block
        disabled={saveDisabled}
        onPress={onSave}
      >
        {saveLabel}
      </Button>
    </View>
  );
}

type ExerciseFormProps = {
  exercise?: ExerciseToEdit;
  onCancel: () => void;
  onSaved: (exerciseId: string) => void;
};

export function ExerciseForm({
  exercise,
  onCancel,
  onSaved,
}: ExerciseFormProps) {
  const { t } = useTranslation();
  const isEditing = !!exercise;
  const {
    name,
    setName,
    description,
    setDescription,
    picture,
    typeId,
    setTypeId,
    muscleGroupIds,
    setMuscleGroupIds,
    allTypes,
    allMuscleGroups,
    selectedType,
    selectedMgNames,
    pickImage,
    handleCreateType,
    handleSave,
    handleDelete,
  } = useExerciseDraft(exercise, onSaved);

  const { create } = useHandover();

  const nameRef = useRef<TextInput>(null);

  const [isHandovering, setIsHandovering] = useState(false);
  const [displayHandoverResult, setDisplayHandoverResult] = useState<{
    uuid: string;
    ttl: number;
  } | null>(null);

  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [mgPickerVisible, setMgPickerVisible] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      const timer = setTimeout(() => nameRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handover = async () => {
    setIsHandovering(true);
    const result = await create({
      name,
      description,
      picture,
      typeId,
      muscleGroupIds,
    });
    setIsHandovering(false);

    if (result.status === 'success') {
      setDisplayHandoverResult(result.data);
    } else {
      console.error(result);
    }
  };

  return (
    <View className="flex-1">
      <FormHeader onCancel={onCancel} />

      <ScrollView
        contentContainerClassName="pb-28"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PictureSection
          picture={picture}
          isEditing={isEditing}
          onPickImage={() => void pickImage()}
        />

        {/* Form */}
        <View className="px-5 mt-7 gap-4">
          <LabeledField
            label={t('exerciseForm.nameLabel')}
            value={name}
            onChangeText={setName}
            placeholder={t('exerciseForm.namePlaceholder')}
            inputRef={nameRef}
          />

          <LabeledField
            label={t('exerciseForm.descriptionLabel')}
            value={description}
            onChangeText={setDescription}
            placeholder={t('exerciseForm.descriptionPlaceholder')}
            multiline
          />

          <PickerRow
            label={t('exerciseForm.typeLabel')}
            value={selectedType?.name}
            placeholder={t('exerciseForm.typePlaceholder')}
            onPress={() => setTypePickerVisible(true)}
          />

          <PickerRow
            label={t('exerciseForm.muscleGroupsLabel')}
            value={
              selectedMgNames.length > 0
                ? selectedMgNames.join(', ')
                : undefined
            }
            placeholder={t('exerciseForm.muscleGroupsPlaceholder')}
            numberOfLines={2}
            onPress={() => setMgPickerVisible(true)}
          />

          {isEditing && <DeleteExerciseRow onPress={handleDelete} />}
        </View>
      </ScrollView>

      <FormFooter
        displayHandoverResult={displayHandoverResult}
        isHandovering={isHandovering}
        onShare={() => void handover()}
        saveDisabled={!name.trim()}
        saveLabel={
          isEditing
            ? t('exerciseForm.saveChanges')
            : t('exerciseForm.addExercise')
        }
        onSave={handleSave}
      />

      {/* Pickers */}
      <LibraryPicker
        visible={typePickerVisible}
        title={t('exerciseForm.pickers.typeTitle')}
        items={allTypes}
        selectedIds={typeId ? [typeId] : []}
        onClose={() => setTypePickerVisible(false)}
        onChange={ids => setTypeId(ids[0] ?? null)}
        onCreate={handleCreateType}
      />

      <LibraryPicker
        visible={mgPickerVisible}
        title={t('exerciseForm.pickers.muscleGroupsTitle')}
        items={allMuscleGroups}
        selectedIds={muscleGroupIds}
        multiSelect
        onClose={() => setMgPickerVisible(false)}
        onChange={setMuscleGroupIds}
      />
    </View>
  );
}
