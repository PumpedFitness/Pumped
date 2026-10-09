import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WorkoutAvatar } from '@/components/workout/WorkoutAvatar';
import type { SharedExercise, SharedTemplate } from '@/lib/share/shareTypes';
import { exerciseNameMap } from '../receiveShareModel';
import { PreviewExerciseList, PreviewSection } from './PreviewSection';
import { ShareHero } from './ShareHero';

type TemplatePreviewProps = {
  template: SharedTemplate;
  exercises: SharedExercise[];
};

export function TemplatePreview({ template, exercises }: TemplatePreviewProps) {
  const { t } = useTranslation();
  const names = exerciseNameMap(exercises);
  const rows = [...template.exercises].map((exercise, index) => ({
    key: `${index}:${exercise.exerciseId}`,
    name: names.get(exercise.exerciseId) ?? null,
    setCount: exercise.sets.length,
  }));

  return (
    <View className="gap-4">
      <ShareHero
        eyebrow={t('share.receive.kinds.template')}
        title={template.name}
        meta={t('share.receive.exerciseCount', { count: rows.length })}
        leading={
          <WorkoutAvatar
            picture={null}
            icon={template.icon}
            color={template.color}
            size={52}
          />
        }
      />
      {template.description ? (
        <PreviewSection title={t('share.receive.description')}>
          <Text className="t-body">{template.description}</Text>
        </PreviewSection>
      ) : null}
      <PreviewSection title={t('share.receive.exercises')}>
        <PreviewExerciseList rows={rows} />
      </PreviewSection>
    </View>
  );
}
