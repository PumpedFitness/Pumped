import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Input } from 'heroui-native';
import type { WorkoutTemplateStatus } from '../../data/local/enums';
import type { ExerciseOption } from '../../types/exercise';
import type { WorkoutTemplate } from '../../types/workout';
import { colors } from '../../theme/tokens';
import { OptionPill } from '../forms/OptionPill';
import { ClayIcon } from '../icons/ClayIcon';
import { WorkoutTemplateCard } from './WorkoutTemplateCard';

type TemplateFilter = 'ALL' | WorkoutTemplateStatus;

type WorkoutTemplateLibraryProps = {
  templates: WorkoutTemplate[];
  exerciseOptions: ExerciseOption[];
  onCreateTemplate: () => void;
  onBrowsePremadeWorkouts: () => void;
  onEditTemplate: (template: WorkoutTemplate) => void;
  onStatusChange: (
    template: WorkoutTemplate,
    status: WorkoutTemplateStatus,
  ) => void;
};

export function WorkoutTemplateLibrary({
  templates,
  exerciseOptions,
  onCreateTemplate,
  onBrowsePremadeWorkouts,
  onEditTemplate,
  onStatusChange,
}: WorkoutTemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TemplateFilter>('ACTIVE');
  const templateCounts = useMemo(
    () => ({
      ALL: templates.length,
      ACTIVE: templates.filter(template => template.status === 'ACTIVE').length,
      INACTIVE: templates.filter(template => template.status === 'INACTIVE')
        .length,
      ARCHIVED: templates.filter(template => template.status === 'ARCHIVED')
        .length,
    }),
    [templates],
  );
  const templateFilters: { value: TemplateFilter; label: string }[] = [
    { value: 'ACTIVE', label: `Active ${templateCounts.ACTIVE}` },
    { value: 'INACTIVE', label: `Inactive ${templateCounts.INACTIVE}` },
    { value: 'ARCHIVED', label: `Archived ${templateCounts.ARCHIVED}` },
    { value: 'ALL', label: `All ${templateCounts.ALL}` },
  ];
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

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="t-heading">Workout templates</Text>
        <Button
          className="h-10 rounded-full px-4"
          variant="ghost"
          feedbackVariant="scale"
          onPress={onBrowsePremadeWorkouts}
        >
          <Button.Label>Browse workouts</Button.Label>
        </Button>
      </View>

      <View className="flex-row gap-2">
        <View className="relative flex-1">
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
        <Button
          accessibilityLabel="Create workout template"
          className="h-[52px] w-[52px] rounded-full bg-accent p-0"
          feedbackVariant="scale"
          onPress={onCreateTemplate}
        >
          <ClayIcon name="plus" size={20} color={colors.accentInk} />
        </Button>
      </View>

      <ScrollView
        horizontal
        contentContainerClassName="gap-2"
        showsHorizontalScrollIndicator={false}
      >
        {templateFilters.map(option => {
          const selected = filter === option.value;
          return (
            <OptionPill
              key={option.value}
              label={option.label}
              selected={selected}
              selectedTone="moss"
              onPress={() => setFilter(option.value)}
            />
          );
        })}
      </ScrollView>

      {filteredTemplates.length > 0 ? (
        filteredTemplates.map(template => (
          <WorkoutTemplateCard
            key={template.id}
            template={template}
            exerciseOptions={exerciseOptions}
            onEdit={onEditTemplate}
            onStatusChange={onStatusChange}
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
              onPress={onCreateTemplate}
            >
              <Button.Label>Create template</Button.Label>
            </Button>
          )}
        </View>
      )}
    </View>
  );
}
