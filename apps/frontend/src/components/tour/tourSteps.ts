import type { MainTabParamList } from '@/navigation/MainTabs';

type StepId = 'home' | 'plan' | 'library' | 'history' | 'profile';

type TourTitleKey = `tour.steps.${StepId}.title`;
type TourDescriptionKey = `tour.steps.${StepId}.description`;

export type TourStep = {
  /** Tab to focus while this step is shown. */
  tab: keyof MainTabParamList;
  titleKey: TourTitleKey;
  descriptionKey: TourDescriptionKey;
};

// Walks the user through each main screen, in tab order, right after onboarding.
export const TOUR_STEPS: TourStep[] = [
  {
    tab: 'Home',
    titleKey: 'tour.steps.home.title',
    descriptionKey: 'tour.steps.home.description',
  },
  {
    tab: 'Schedule',
    titleKey: 'tour.steps.plan.title',
    descriptionKey: 'tour.steps.plan.description',
  },
  {
    tab: 'Library',
    titleKey: 'tour.steps.library.title',
    descriptionKey: 'tour.steps.library.description',
  },
  {
    tab: 'History',
    titleKey: 'tour.steps.history.title',
    descriptionKey: 'tour.steps.history.description',
  },
  {
    tab: 'Profile',
    titleKey: 'tour.steps.profile.title',
    descriptionKey: 'tour.steps.profile.description',
  },
];
