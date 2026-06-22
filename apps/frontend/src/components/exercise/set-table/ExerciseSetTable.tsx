import { useTranslation } from 'react-i18next';
import {
  buildReadOnlySetCards,
  buildWorkoutSetCards,
  type ExerciseSetTableProps,
} from './exerciseSetTableModel';
import { ExerciseSetTableContent } from './ExerciseSetTableContent';

export function ExerciseSetTable(props: ExerciseSetTableProps) {
  const { t } = useTranslation();
  const cards = props.readOnly
    ? buildReadOnlySetCards(t, props)
    : buildWorkoutSetCards(t, props);

  return (
    <ExerciseSetTableContent
      cards={cards}
      addSetLabel={props.readOnly ? undefined : props.addSetLabel}
      onAddSet={props.readOnly ? undefined : props.onAddSet}
      animateLayout={props.readOnly ? false : props.animateLayout ?? true}
    />
  );
}
