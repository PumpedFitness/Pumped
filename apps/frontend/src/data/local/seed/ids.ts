export const LOCAL_USER_ID = 'local';

export const MUSCLE_GROUP_IDS = {
  chest: 'default-mg-chest',
  back: 'default-mg-back',
  shoulders: 'default-mg-shoulders',
  biceps: 'default-mg-biceps',
  triceps: 'default-mg-triceps',
  abs: 'default-mg-abs',
  quads: 'default-mg-quads',
  hamstrings: 'default-mg-hamstrings',
  glutes: 'default-mg-glutes',
  calves: 'default-mg-calves',
  forearms: 'default-mg-forearms',
  traps: 'default-mg-traps',
} as const;

export const EXERCISE_TYPE_IDS = {
  machine: 'default-et-machine',
  band: 'default-et-band',
  bodyweight: 'default-et-bodyweight',
} as const;

export const EXERCISE_IDS = {
  benchPress: 'sample-exercise-bench-press',
  overheadPress: 'sample-exercise-overhead-press',
  inclineDumbbellPress: 'sample-exercise-incline-dumbbell-press',
  lateralRaise: 'sample-exercise-lateral-raise',
  tricepsPushdown: 'sample-exercise-triceps-pushdown',
  barbellRow: 'sample-exercise-barbell-row',
  deadlift: 'sample-exercise-deadlift',
  latPulldown: 'sample-exercise-lat-pulldown',
  pullUp: 'sample-exercise-pull-up',
  dumbbellCurl: 'sample-exercise-dumbbell-curl',
  backSquat: 'sample-exercise-back-squat',
  romanianDeadlift: 'sample-exercise-romanian-deadlift',
  legPress: 'sample-exercise-leg-press',
  calfRaise: 'sample-exercise-calf-raise',
  plank: 'sample-exercise-plank',
} as const;

export const TEMPLATE_IDS = {
  push: 'sample:template-push',
  fullBody: 'sample:template-full-body',
  pull: 'sample:template-pull',
  lower: 'sample:template-lower',
  upperExpress: 'sample:template-upper-express',
} as const;

export function sampleId(entity: string): string {
  return `sample:${entity}`;
}
