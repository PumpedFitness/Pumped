import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppShell } from '@/components/layout/AppShell';
import { SegmentedControl } from '@pumped/ui/clay/SegmentedControl';
import { motion } from '@pumped/ui/theme/tokens';
import { ActiveScheduleTab } from './components/ActiveScheduleTab';
import { ScheduleLibraryTab } from './components/ScheduleLibraryTab';

type ScheduleSegment = 'active' | 'library';

export function ScheduleScreen() {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<ScheduleSegment>('active');

  return (
    <AppShell showTabBar>
      <View className="bg-background px-5 pt-4">
        <SegmentedControl
          options={[
            { value: 'active', label: t('schedule.segments.active') },
            { value: 'library', label: t('schedule.segments.library') },
          ]}
          value={segment}
          onChange={value => setSegment(value as ScheduleSegment)}
        />
      </View>
      <Animated.View
        key={segment}
        className="flex-1"
        entering={FadeIn.duration(motion.fast)}
        exiting={FadeOut.duration(motion.fast)}
      >
        {segment === 'active' ? (
          <ActiveScheduleTab onGoToLibrary={() => setSegment('library')} />
        ) : (
          <ScheduleLibraryTab />
        )}
      </Animated.View>
    </AppShell>
  );
}
