import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Input } from 'heroui-native';
import { AppView } from '../components/AppView';
import { ClayIcon } from '../components/icons/ClayIcon';
import { WorkoutCalendar } from '../components/workout/WorkoutCalendar';
import { WorkoutTemplateCard } from '../components/workout/WorkoutTemplateCard';
import { WorkoutTemplateEditor } from '../components/workout/WorkoutTemplateEditor';
import type { WorkoutTemplateStatus } from '../data/local/enums';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { colors } from '../theme/tokens';
import type { WorkoutTemplate } from '../types/workout';

type TemplateFilter = 'ALL' | WorkoutTemplateStatus;

const TEMPLATE_FILTERS: { value: TemplateFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export function PlanScreen() {
  const {
    templates,
    sessions,
    exerciseOptions,
    saveTemplate,
    updateTemplateStatus,
    deleteTemplate,
    refresh,
  } = useWorkoutTemplates();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkoutTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TemplateFilter>('ALL');

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const exerciseNames = useMemo(
    () =>
      new Map(
        exerciseOptions.map(exercise => [exercise.id, exercise.name] as const),
      ),
    [exerciseOptions],
  );
  const filteredTemplates = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();

    return templates.filter(template => {
      if (filter !== 'ALL' && template.status !== filter) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [
        template.name,
        template.description ?? '',
        ...template.exercises.map(
          exercise => exerciseNames.get(exercise.exerciseId) ?? '',
        ),
      ]
        .join(' ')
        .toLocaleLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [exerciseNames, filter, searchQuery, templates]);

  const openCreate = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const openEdit = (template: WorkoutTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const requestDelete = (template: WorkoutTemplate) => {
    Alert.alert(
      `Delete ${template.name}?`,
      'This removes the template and its planned exercises. Completed workouts stay in your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            try {
              deleteTemplate(template.id);
              setIsEditorOpen(false);
              setSelectedTemplate(null);
            } catch (error) {
              Alert.alert(
                'Could not delete template',
                error instanceof Error ? error.message : 'Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const handleStatusChange = (
    template: WorkoutTemplate,
    status: WorkoutTemplateStatus,
  ) => {
    try {
      updateTemplateStatus(template.id, status);
    } catch (error) {
      Alert.alert(
        'Could not update template',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  const totalExercises = templates.reduce(
    (total, template) => total + template.exercises.length,
    0,
  );

  return (
    <AppView edges={[]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pb-32 pt-7"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text className="t-display">Plan</Text>
          <Text className="t-caption mt-1">
            Build reusable workouts for your next session.
          </Text>
        </View>

        <View className="gap-5 rounded-[34px] bg-moss p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="t-eyebrow text-cream-dim">Your library</Text>
              <Text className="mt-2 text-[27px] font-bold tracking-[-0.5px] text-cream">
                {templates.length}{' '}
                {templates.length === 1
                  ? 'workout template'
                  : 'workout templates'}
              </Text>
              <Text className="t-caption mt-2 text-cream-dim">
                {totalExercises} planned{' '}
                {totalExercises === 1 ? 'exercise' : 'exercises'} ready offline.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-moss-deep">
              <ClayIcon name="calendar" size={24} color={colors.cream} />
            </View>
          </View>

          <Button
            className="h-13 self-start rounded-full bg-accent px-5"
            feedbackVariant="scale"
            onPress={openCreate}
          >
            <ClayIcon name="plus" size={18} color={colors.accentInk} />
            <Button.Label className="font-bold text-accent-foreground">
              New template
            </Button.Label>
          </Button>
        </View>

        <WorkoutCalendar templates={templates} sessions={sessions} />

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="t-heading">Workout templates</Text>
            <Text className="t-caption">
              {filteredTemplates.length} of {templates.length}
            </Text>
          </View>

          <View className="relative">
            <Input
              accessibilityLabel="Search workout templates"
              className="h-[52px] rounded-full border-border-hairline bg-surface-card pl-12 pr-4 text-foreground"
              placeholder="Search templates or exercises"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View
              className="absolute left-4 top-0 h-[52px] items-center justify-center"
              pointerEvents="none"
            >
              <ClayIcon name="search" size={19} color={colors.muted} />
            </View>
          </View>

          <ScrollView
            horizontal
            contentContainerClassName="gap-2"
            showsHorizontalScrollIndicator={false}
          >
            {TEMPLATE_FILTERS.map(option => {
              const selected = filter === option.value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  className={`min-h-11 items-center justify-center rounded-full border px-4 ${
                    selected
                      ? 'border-moss bg-moss'
                      : 'border-border-hairline bg-surface-card'
                  }`}
                  onPress={() => setFilter(option.value)}
                >
                  <Text
                    className={`t-label ${
                      selected ? 'text-cream' : 'text-foreground-secondary'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {filteredTemplates.length > 0 ? (
            filteredTemplates.map(template => (
              <WorkoutTemplateCard
                key={template.id}
                template={template}
                exerciseOptions={exerciseOptions}
                onEdit={openEdit}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <View className="items-center gap-3 rounded-[24px] border border-dashed border-border-hairline bg-surface-card px-6 py-10">
              <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-accent-soft">
                <ClayIcon name="dumbbell" size={24} color={colors.accent} />
              </View>
              <Text className="t-heading text-center">
                {templates.length === 0
                  ? 'No templates yet'
                  : 'No matching templates'}
              </Text>
              <Text className="t-caption max-w-64 text-center">
                {templates.length === 0
                  ? 'Create one workout you can adjust and repeat whenever you train.'
                  : 'Try another search or choose a different status.'}
              </Text>
              {templates.length === 0 && (
                <Button
                  className="mt-1 rounded-full"
                  variant="secondary"
                  feedbackVariant="scale"
                  onPress={openCreate}
                >
                  <Button.Label>Create template</Button.Label>
                </Button>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <WorkoutTemplateEditor
        visible={isEditorOpen}
        template={selectedTemplate}
        exerciseOptions={exerciseOptions}
        onClose={() => setIsEditorOpen(false)}
        onSave={saveTemplate}
        onRequestDelete={requestDelete}
      />
    </AppView>
  );
}
