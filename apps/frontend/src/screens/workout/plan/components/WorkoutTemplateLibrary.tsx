import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Button } from 'heroui-native';
import type { WorkoutTemplateStatus } from '@/data/local/enums';
import type { ExerciseOption } from '@/types/exercise';
import type { WorkoutTemplate } from '@/types/workout';
import type { Schedule } from '@/types/schedule';
import { colors } from '@/theme/tokens';
import { EmptyState } from '@/components/clay/EmptyState';
import { OptionPill } from '@/components/forms/OptionPill';
import { SearchInput } from '@/components/forms/SearchInput';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { WorkoutTemplateCard } from './WorkoutTemplateCard';

type TemplateFilter = 'ALL' | WorkoutTemplateStatus;

type TemplateCounts = Record<TemplateFilter, number>;

function buildTemplateFilters(
  t: TFunction,
  counts: TemplateCounts,
): { value: TemplateFilter; label: string }[] {
  return [
    {
      value: 'ACTIVE',
      label: t('plan.filters.active', { count: counts.ACTIVE }),
    },
    {
      value: 'INACTIVE',
      label: t('plan.filters.inactive', { count: counts.INACTIVE }),
    },
    {
      value: 'ARCHIVED',
      label: t('plan.filters.archived', { count: counts.ARCHIVED }),
    },
    { value: 'ALL', label: t('plan.filters.all', { count: counts.ALL }) },
  ];
}

const emptyStateIcon = (
  <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-accent-soft">
    <ClayIcon name="dumbbell" size={24} color={colors.accent} />
  </View>
);

type WorkoutTemplateLibraryProps = {
  templates: WorkoutTemplate[];
  basicSchedules: Map<string, Schedule>;
  exerciseOptions: ExerciseOption[];
  onCreateTemplate: () => void;
  onBrowsePremadeWorkouts: () => void;
  onStartTemplate: (template: WorkoutTemplate) => void;
  onEditTemplate: (template: WorkoutTemplate) => void;
  onStatusChange: (
    template: WorkoutTemplate,
    status: WorkoutTemplateStatus,
  ) => void;
};

export function WorkoutTemplateLibrary({
  templates,
  basicSchedules,
  exerciseOptions,
  onCreateTemplate,
  onBrowsePremadeWorkouts,
  onStartTemplate,
  onEditTemplate,
  onStatusChange,
}: WorkoutTemplateLibraryProps) {
  const { t } = useTranslation();
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
  const templateFilters = buildTemplateFilters(t, templateCounts);
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
        <Text className="t-heading">{t('plan.title')}</Text>
        <Button
          className="h-10 rounded-full px-4"
          variant="ghost"
          feedbackVariant="scale"
          onPress={onBrowsePremadeWorkouts}
        >
          <Button.Label>{t('plan.browseWorkouts')}</Button.Label>
        </Button>
      </View>

      <View className="flex-row gap-2">
        <View className="flex-1">
          <SearchInput
            accessibilityLabel={t('plan.searchA11y')}
            placeholder={t('plan.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Button
          accessibilityLabel={t('plan.createA11y')}
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
            schedule={basicSchedules.get(template.id) ?? null}
            exerciseNames={exerciseNames}
            onStart={onStartTemplate}
            onEdit={onEditTemplate}
            onStatusChange={onStatusChange}
          />
        ))
      ) : (
        <EmptyState
          icon={emptyStateIcon}
          className="bg-surface-card"
          titleClassName="text-center"
          bodyClassName="max-w-64"
          title={
            templates.length === 0
              ? t('plan.empty.noneTitle')
              : t('plan.empty.noMatchTitle')
          }
          body={
            templates.length === 0
              ? t('plan.empty.noneBody')
              : t('plan.empty.noMatchBody')
          }
          action={
            templates.length === 0 ? (
              <Button
                className="mt-1 rounded-full"
                variant="secondary"
                feedbackVariant="scale"
                onPress={onCreateTemplate}
              >
                <Button.Label>{t('plan.empty.createCta')}</Button.Label>
              </Button>
            ) : undefined
          }
        />
      )}
    </View>
  );
}
