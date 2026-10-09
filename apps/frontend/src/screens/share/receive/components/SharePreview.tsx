import type { SharePayload } from '@/lib/share/shareTypes';
import { AchievementCard } from './AchievementCard';
import { ExercisePreview } from './ExercisePreview';
import { SetTypePreview } from './SetTypePreview';
import { TemplatePreview } from './TemplatePreview';
import { WorkoutPreview } from './WorkoutPreview';

type SharePreviewProps = {
  payload: SharePayload;
};

export function SharePreview({ payload }: SharePreviewProps) {
  switch (payload.kind) {
    case 'template':
      return (
        <TemplatePreview
          template={payload.template}
          exercises={payload.exercises}
        />
      );
    case 'workout':
      return (
        <WorkoutPreview
          workout={payload.workout}
          exercises={payload.exercises}
        />
      );
    case 'setType':
      return <SetTypePreview setType={payload.setType} />;
    case 'exercise':
      return <ExercisePreview exercise={payload.exercise} />;
    case 'achievement':
      return <AchievementCard achievement={payload.achievement} />;
  }
}
