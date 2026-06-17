import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { randomUUID } from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { asc } from 'drizzle-orm';
import { useRepository } from '@/data/local/useRepository';
import { exercises, exerciseTypes, muscleGroups } from '@/data/local/schema';

export type ExerciseToEdit = {
  id: string;
  name: string;
  description: string | null;
  typeId: string | null;
  picture: string | null;
  muscleGroups: string[];
  importId?: number | null;
  importEditedAt?: number | null;
};

export function useExerciseDraft(
  exercise: ExerciseToEdit | undefined,
  onSaved: (exerciseId: string) => void,
) {
  const { t } = useTranslation();
  const exerciseRepo = useRepository(exercises);
  const typeRepo = useRepository(exerciseTypes);
  const mgRepo = useRepository(muscleGroups);

  const [name, setName] = useState(exercise?.name ?? '');
  const [description, setDescription] = useState(exercise?.description ?? '');
  const [picture, setPicture] = useState<string | null>(
    exercise?.picture ?? null,
  );
  const [typeId, setTypeId] = useState<string | null>(exercise?.typeId ?? null);
  const [muscleGroupIds, setMuscleGroupIds] = useState<string[]>(
    exercise?.muscleGroups ?? [],
  );

  const allTypes = typeRepo.query({ orderBy: asc(exerciseTypes.name) });
  const allMuscleGroups = mgRepo.query({ orderBy: asc(muscleGroups.name) });

  const selectedType = allTypes.find(t => t.id === typeId);
  const selectedMgNames = muscleGroupIds
    .map(id => allMuscleGroups.find(mg => mg.id === id)?.name)
    .filter((n): n is string => n != null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPicture(result.assets[0].uri);
    }
  };

  const handleCreateType = (typeName: string): string => {
    const id = randomUUID();
    typeRepo.create({ id, name: typeName, createdAt: Date.now() });
    return id;
  };

  const handleCreateMuscleGroup = (mgName: string): string => {
    const id = randomUUID();
    mgRepo.create({ id, name: mgName, createdAt: Date.now() });
    return id;
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (exercise) {
      exerciseRepo.update(exercise.id, {
        name: name.trim(),
        description: description.trim() || null,
        typeId,
        picture,
        muscleGroups: muscleGroupIds,
        importEditedAt:
          exercise.importId !== null && exercise.importId !== undefined
            ? Date.now()
            : exercise.importEditedAt,
      });
      onSaved(exercise.id);
    } else {
      const id = randomUUID();
      exerciseRepo.create({
        id,
        name: name.trim(),
        description: description.trim() || null,
        typeId,
        picture,
        muscleGroups: muscleGroupIds,
        createdAt: Date.now(),
      });
      onSaved(id);
    }
  };

  const handleDelete = () => {
    if (!exercise) return;
    Alert.alert(
      t('exerciseForm.deleteAlertTitle'),
      t('exerciseForm.deleteAlertBody', { name: exercise.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            // The repository write re-renders the owning screen reactively;
            // the screen notices the exercise is gone and performs the single
            // goBack itself.
            exerciseRepo.deleteById(exercise.id);
          },
        },
      ],
    );
  };

  return {
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
    handleCreateMuscleGroup,
    handleSave,
    handleDelete,
  };
}
