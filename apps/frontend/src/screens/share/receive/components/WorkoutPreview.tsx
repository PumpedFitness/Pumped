import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WorkoutAvatar } from '@/components/workout/WorkoutAvatar';
import type { SharedExercise, SharedWorkout } from '@/lib/share/shareTypes';
import { exerciseNameMap, workoutExerciseRows } from '../receiveShareModel';
import { PreviewExerciseList, PreviewSection } from './PreviewSection';
import { ShareHero } from './ShareHero';

type WorkoutPreviewProps = {
  workout: SharedWorkout;
  exercises: SharedExercise[];
};

export function WorkoutPreview({ workout, exercises }: WorkoutPreviewProps) {
  const { t, i18n } = useTranslation();
  const rows = workoutExerciseRows(workout.sets, exerciseNameMap(exercises));
  const minutes = Math.max(
    1,
    Math.round(
      ((workout.endedAt ?? workout.startedAt) - workout.startedAt) / 60_000,
    ),
  );
  const date = new Date(workout.startedAt).toLocaleDateString(i18n.language, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View className="gap-4">
      <ShareHero
        eyebrow={t('share.receive.kinds.workout')}
        title={workout.name}
        meta={t('share.receive.workoutMeta', {
          date,
          duration: t('common.minutesShort', { count: minutes }),
        })}
        leading={
          <WorkoutAvatar
            picture={null}
            icon={workout.icon}
            color={workout.color}
            size={52}
          />
        }
      />
      <PreviewSection title={t('share.receive.exercises')}>
        <PreviewExerciseList rows={rows} />
      </PreviewSection>
    </View>
  );
}
