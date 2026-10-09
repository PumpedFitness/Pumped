import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { muscleGroups } from '@/data/local/schema';
import { useRepository } from '@/data/local/useRepository';
import type { SharedExercise } from '@/lib/share/shareTypes';
import { PreviewSection } from './PreviewSection';
import { ShareHero } from './ShareHero';

type ExercisePreviewProps = {
  exercise: SharedExercise;
};

export function ExercisePreview({ exercise }: ExercisePreviewProps) {
  const { t } = useTranslation();
  // Muscle groups travel as ids; the default ids exist on every device, so
  // their names come from the local table. Unknown ids are skipped.
  const groupRows = useRepository(muscleGroups).query();
  const groupNames = groupRows
    .filter(row => exercise.muscleGroupIds.includes(row.id))
    .map(row => row.name);

  return (
    <View className="gap-4">
      <ShareHero
        eyebrow={t('share.receive.kinds.exercise')}
        title={exercise.name}
        meta={exercise.typeName}
      />
      {exercise.description ? (
        <PreviewSection title={t('share.receive.description')}>
          <Text className="t-body">{exercise.description}</Text>
        </PreviewSection>
      ) : null}
      {groupNames.length > 0 ? (
        <PreviewSection title={t('share.receive.muscleGroups')}>
          <Text className="t-body">{groupNames.join(', ')}</Text>
        </PreviewSection>
      ) : null}
    </View>
  );
}
