import { Input, TextArea } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { FormSection } from './FormSection';

type WorkoutTemplateDetailsSectionProps = {
  autoFocus: boolean;
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
};

export function WorkoutTemplateDetailsSection({
  autoFocus,
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: WorkoutTemplateDetailsSectionProps) {
  const { t } = useTranslation();

  return (
    <FormSection title={t('templateEditor.details.title')}>
      <Input
        autoFocus={autoFocus}
        className="h-[54px] rounded-[18px] border-border-hairline bg-surface-card px-4 text-foreground"
        placeholder={t('templateEditor.details.namePlaceholder')}
        value={name}
        onChangeText={onNameChange}
      />
      <TextArea
        className="min-h-[96px] rounded-[18px] border-border-hairline bg-surface-card px-4 py-3 text-foreground"
        placeholder={t('templateEditor.details.descriptionPlaceholder')}
        value={description}
        onChangeText={onDescriptionChange}
      />
    </FormSection>
  );
}
