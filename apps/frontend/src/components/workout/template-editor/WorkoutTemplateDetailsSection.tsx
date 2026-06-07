import { Input, TextArea } from 'heroui-native';
import { FormSection } from '../../forms/FormSection';

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
  return (
    <FormSection title="Template details">
      <Input
        autoFocus={autoFocus}
        className="h-[54px] rounded-[18px] border-border-hairline bg-surface-card px-4 text-foreground"
        placeholder="Template name"
        value={name}
        onChangeText={onNameChange}
      />
      <TextArea
        className="min-h-[96px] rounded-[18px] border-border-hairline bg-surface-card px-4 py-3 text-foreground"
        placeholder="A short description"
        value={description}
        onChangeText={onDescriptionChange}
      />
    </FormSection>
  );
}
