import { useTranslation } from 'react-i18next';
import {
  buildTemplateSetCards,
  type TemplateSetTableProps,
} from './exerciseSetTableModel';
import { ExerciseSetTableContent } from './ExerciseSetTableContent';

export function TemplateSetTable(props: TemplateSetTableProps) {
  const { t } = useTranslation();
  const cards = buildTemplateSetCards(t, props);

  return (
    <ExerciseSetTableContent
      cards={cards}
      addSetLabel={props.addSetLabel ?? t('setTable.addSet')}
      duplicateSetLabel={t('setTable.duplicateSet')}
      onAddSet={props.lockSetCount ? undefined : props.onAddSet}
      onDuplicateSet={props.lockSetCount ? undefined : props.onDuplicateSet}
    />
  );
}
