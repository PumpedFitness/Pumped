import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppShell } from '@/components/layout/AppShell';
import { SegmentedControl } from '@pumped/ui/clay/SegmentedControl';
import { motion } from '@pumped/ui/theme/tokens';
import { ScreenHeader } from '@pumped/ui/clay/ScreenHeader';
import { ProfileAvatarButton } from '@/components/layout/ProfileAvatarButton';
import { useWorkoutTemplates } from '@/hooks/useWorkoutTemplates';
import { useExerciseOptions } from '@/hooks/useExerciseOptions';
import { WorkoutsLibrary } from './components/WorkoutsLibrary';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { SetTypeLibrary } from './set-type-library/SetTypeLibrary';

type LibrarySegment = 'workouts' | 'exercises' | 'setTypes';

export function LibraryScreen() {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<LibrarySegment>('workouts');
  const { templates } = useWorkoutTemplates();
  const exercises = useExerciseOptions();

  const segmentedControl = (
    <SegmentedControl
      options={[
        { value: 'workouts', label: t('library.segments.workouts') },
        { value: 'exercises', label: t('library.segments.exercises') },
        { value: 'setTypes', label: t('library.segments.setTypes') },
      ]}
      value={segment}
      onChange={value => setSegment(value as LibrarySegment)}
    />
  );

  return (
    <AppShell showTabBar>
      <View className="bg-background px-5 pt-4 gap-5">
        <ScreenHeader
          title={t('library.title')}
          subtitle={t('library.headerState', {
            workouts: templates.length,
            exercises: exercises.length,
          })}
          trailing={<ProfileAvatarButton />}
        />
        {segmentedControl}
      </View>
      <Animated.View
        key={segment}
        className="flex-1"
        entering={FadeIn.duration(motion.fast)}
        exiting={FadeOut.duration(motion.fast)}
      >
        {segment === 'workouts' ? (
          <WorkoutsLibrary />
        ) : segment === 'exercises' ? (
          <ExerciseLibrary />
        ) : (
          <SetTypeLibrary />
        )}
      </Animated.View>
    </AppShell>
  );
}
