import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/AppShell';
import { SegmentedControl } from '@/components/clay/SegmentedControl';
import { WorkoutsLibrary } from './components/WorkoutsLibrary';
import { ExerciseLibrary } from './components/ExerciseLibrary';

type LibrarySegment = 'workouts' | 'exercises';

export function LibraryScreen() {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<LibrarySegment>('workouts');

  // Rendered as the library's pinned `leadingHeader` (inside the list's
  // ScrollView) so the ScrollView stays the screen's first descendant — which is
  // what the native tab bar tracks to inset content and minimize on scroll.
  const segmentedControl = (
    <SegmentedControl
      options={[
        { value: 'workouts', label: t('library.segments.workouts') },
        { value: 'exercises', label: t('library.segments.exercises') },
      ]}
      value={segment}
      onChange={value => setSegment(value as LibrarySegment)}
    />
  );

  return (
    <AppShell showTabBar>
      {segment === 'workouts' ? (
        <WorkoutsLibrary leadingHeader={segmentedControl} />
      ) : (
        <ExerciseLibrary leadingHeader={segmentedControl} />
      )}
    </AppShell>
  );
}
