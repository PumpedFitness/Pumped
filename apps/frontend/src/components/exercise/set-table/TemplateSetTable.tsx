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
      onAddSet={props.onAddSet}
      onDuplicateSet={props.onDuplicateSet}
    />
  );
}
