import { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { randomUUID } from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { asc } from 'drizzle-orm';
import { colors, radii, typography } from '../../theme/tokens';
import { ClayIcon } from '../icons/ClayIcon';
import { Button } from '../clay/Button';
import { Card } from '../clay/Card';
import { LibraryPicker } from '../forms/LibraryPicker';
import { useRepository } from '../../data/local/useRepository';
import { exercises, exerciseTypes, muscleGroups } from '../../data/local/schema';

type ExerciseToEdit = {
  id: string;
  name: string;
  description: string | null;
  typeId: string | null;
  picture: string | null;
  muscleGroups: string[];
};

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
  const isEditing = !!exercise;
  const exerciseRepo = useRepository(exercises);
  const typeRepo = useRepository(exerciseTypes);
  const mgRepo = useRepository(muscleGroups);

  const nameRef = useRef<TextInput>(null);

  const [name, setName] = useState(exercise?.name ?? '');
  const [description, setDescription] = useState(exercise?.description ?? '');
  const [picture, setPicture] = useState<string | null>(exercise?.picture ?? null);
  const [typeId, setTypeId] = useState<string | null>(exercise?.typeId ?? null);
  const [muscleGroupIds, setMuscleGroupIds] = useState<string[]>(
    exercise?.muscleGroups ?? [],
  );

  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [mgPickerVisible, setMgPickerVisible] = useState(false);

  const allTypes = typeRepo.query({ orderBy: asc(exerciseTypes.name) });
  const allMuscleGroups = mgRepo.query({ orderBy: asc(muscleGroups.name) });

  const selectedType = allTypes.find(t => t.id === typeId);
  const selectedMgNames = muscleGroupIds
    .map(id => allMuscleGroups.find(mg => mg.id === id)?.name)
    .filter((n): n is string => n != null);

  useEffect(() => {
    if (!isEditing) {
      setTimeout(() => nameRef.current?.focus(), 400);
    }
  }, [isEditing]);

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
    if (isEditing) {
      exerciseRepo.update(exercise.id, {
        name: name.trim(),
        description: description.trim() || null,
        typeId,
        picture,
        muscleGroups: muscleGroupIds,
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
    Alert.alert('Delete exercise', `Are you sure you want to delete "${exercise.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          exerciseRepo.deleteById(exercise.id);
          onCancel();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          height: 56,
        }}
      >
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: radii.pill,
            backgroundColor: colors.cardSunk,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ClayIcon name="x" size={20} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="pb-28"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Picture + Title */}
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Pressable onPress={pickImage}>
            {picture ? (
              <Image
                source={{ uri: picture }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: radii.pill,
                }}
              />
            ) : (
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: radii.pill,
                  backgroundColor: colors.cardSunk,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ClayIcon name="plus" size={28} color={colors.accent} />
              </View>
            )}
          </Pressable>
          <Text
            style={{
              fontSize: typography.caption,
              color: colors.muted,
              marginTop: 8,
            }}
          >
            {picture ? 'Tap to change' : 'Add photo'}
          </Text>
          <Text
            style={{
              fontSize: typography.title,
              fontWeight: '700',
              color: colors.ink,
              marginTop: 8,
            }}
          >
            {isEditing ? 'Edit Exercise' : 'New Exercise'}
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 20, marginTop: 28, gap: 16 }}>
          {/* Name */}
          <Card variant="card" radius="xl" pad={0}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text
                style={{
                  fontSize: typography.caption,
                  color: colors.muted,
                  marginBottom: 2,
                }}
              >
                Name
              </Text>
              <TextInput
                ref={nameRef}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Barbell Bench Press"
                placeholderTextColor={colors.muted}
                style={{
                  height: 40,
                  fontSize: typography.body,
                  fontWeight: '500',
                  color: colors.ink,
                }}
              />
            </View>
          </Card>

          {/* Description */}
          <Card variant="card" radius="xl" pad={0}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text
                style={{
                  fontSize: typography.caption,
                  color: colors.muted,
                  marginBottom: 2,
                }}
              >
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional"
                placeholderTextColor={colors.muted}
                multiline
                style={{
                  minHeight: 40,
                  fontSize: typography.body,
                  color: colors.ink,
                }}
              />
            </View>
          </Card>

          {/* Type */}
          <Card variant="card" radius="xl" pad={0}>
            <Pressable
              onPress={() => setTypePickerVisible(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: typography.caption,
                    color: colors.muted,
                  }}
                >
                  Type
                </Text>
                <Text
                  style={{
                    fontSize: typography.body,
                    fontWeight: '500',
                    color: selectedType ? colors.ink : colors.muted,
                    marginTop: 2,
                  }}
                >
                  {selectedType?.name ?? 'Select type'}
                </Text>
              </View>
              <ClayIcon name="chevron" size={16} color={colors.muted} />
            </Pressable>
          </Card>

          {/* Muscle Groups */}
          <Card variant="card" radius="xl" pad={0}>
            <Pressable
              onPress={() => setMgPickerVisible(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: typography.caption,
                    color: colors.muted,
                  }}
                >
                  Muscle Groups
                </Text>
                <Text
                  style={{
                    fontSize: typography.body,
                    fontWeight: '500',
                    color:
                      selectedMgNames.length > 0 ? colors.ink : colors.muted,
                    marginTop: 2,
                  }}
                  numberOfLines={2}
                >
                  {selectedMgNames.length > 0
                    ? selectedMgNames.join(', ')
                    : 'Select muscle groups'}
                </Text>
              </View>
              <ClayIcon name="chevron" size={16} color={colors.muted} />
            </Pressable>
          </Card>

          {isEditing && (
            <Pressable
              onPress={handleDelete}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 14,
                marginTop: 8,
              }}
            >
              <ClayIcon name="trash" size={18} color={colors.danger} />
              <Text
                style={{
                  fontSize: typography.body,
                  fontWeight: '500',
                  color: colors.danger,
                }}
              >
                Delete Exercise
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {/* Save button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: 20,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          backgroundColor: colors.bg,
        }}
      >
        <Button
          variant="primary"
          size="lg"
          block
          disabled={!name.trim()}
          onPress={handleSave}
        >
          {isEditing ? 'Save Changes' : 'Add Exercise'}
        </Button>
      </View>

      {/* Pickers */}
      <LibraryPicker
        visible={typePickerVisible}
        title="Exercise Type"
        items={allTypes}
        selectedIds={typeId ? [typeId] : []}
        onClose={() => setTypePickerVisible(false)}
        onChange={ids => setTypeId(ids[0] ?? null)}
        onCreate={handleCreateType}
      />

      <LibraryPicker
        visible={mgPickerVisible}
        title="Muscle Groups"
        items={allMuscleGroups}
        selectedIds={muscleGroupIds}
        multiSelect
        onClose={() => setMgPickerVisible(false)}
        onChange={setMuscleGroupIds}
        onCreate={handleCreateMuscleGroup}
      />
    </View>
  );
}
