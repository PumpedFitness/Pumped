import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Input, TextArea } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { FormSection } from './FormSection';

type WorkoutTemplateDetailsSectionProps = {
  autoFocus: boolean;
  name: string;
  description: string;
  appearanceControl: ReactNode;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
};

export function WorkoutTemplateDetailsSection({
  autoFocus,
  name,
  description,
  appearanceControl,
  onNameChange,
  onDescriptionChange,
}: WorkoutTemplateDetailsSectionProps) {
  const { t } = useTranslation();

  return (
    <FormSection title={t('templateEditor.details.title')}>
      <View className="flex-row items-center gap-2">
        <Input
          autoFocus={autoFocus}
          className="h-[54px] flex-1 rounded-[18px] border-border-hairline bg-surface-card px-4 text-foreground"
          placeholder={t('templateEditor.details.namePlaceholder')}
          value={name}
          onChangeText={onNameChange}
        />
        {appearanceControl}
      </View>
      <TextArea
        className="min-h-[96px] rounded-[18px] border-border-hairline bg-surface-card px-4 py-3 text-foreground"
        placeholder={t('templateEditor.details.descriptionPlaceholder')}
        value={description}
        onChangeText={onDescriptionChange}
      />
    </FormSection>
  );
}
