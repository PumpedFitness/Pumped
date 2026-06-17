import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/AppShell';
import { SegmentedControl } from '@/components/clay/SegmentedControl';
import { WorkoutsLibrary } from './components/WorkoutsLibrary';
import { ExerciseLibrary } from './components/ExerciseLibrary';

type LibrarySegment = 'workouts' | 'exercises';

export function LibraryScreen() {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<LibrarySegment>('workouts');

  return (
    <AppShell showTabBar>
      <View className="px-5 pt-7">
        <SegmentedControl
          options={[
            { value: 'workouts', label: t('library.segments.workouts') },
            { value: 'exercises', label: t('library.segments.exercises') },
          ]}
          value={segment}
          onChange={value => setSegment(value as LibrarySegment)}
        />
      </View>

      {segment === 'workouts' ? <WorkoutsLibrary /> : <ExerciseLibrary />}
    </AppShell>
  );
}
