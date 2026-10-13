import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from 'heroui-native';
import type { WorkoutTemplate } from '@/types/workout';
import { WorkoutAvatar } from '@/components/workout/WorkoutAvatar';
import { shadows, colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';

type WorkoutTemplateCardProps = {
  template: WorkoutTemplate;
  onEdit: (template: WorkoutTemplate) => void;
  onStart: (template: WorkoutTemplate) => void;
  onOptions: (template: WorkoutTemplate) => void;
};

export function WorkoutTemplateCard({
  template,
  onEdit,
  onStart,
  onOptions,
}: WorkoutTemplateCardProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      testID={`template-edit-${template.id}`}
      accessibilityRole="button"
      accessibilityLabel={t('plan.card.editA11y', { name: template.name })}
      className="flex-row items-center gap-2.5 rounded-[24px] bg-surface-card p-3 active:bg-surface-sunk"
      style={shadows.row}
      onPress={() => onEdit(template)}
    >
      <WorkoutAvatar
        picture={template.picture}
        icon={template.icon}
        color={template.color}
        size={36}
        radius={12}
      />
      <View className="flex-1 gap-1.5">
        <Text className="text-[16px] font-bold leading-[1.25] text-foreground">
          {template.name}
        </Text>
        {template.description ? (
          <Text className="text-[12px] font-medium leading-[1.4] text-muted">
            {template.description}
          </Text>
        ) : null}
      </View>
      <View className="shrink-0 gap-2">
        <Button
          testID={`template-options-${template.id}`}
          accessibilityLabel={t('plan.card.optionsA11y', {
            name: template.name,
          })}
          className="h-9 w-9 min-w-9 rounded-full p-0"
          variant="ghost"
          hitSlop={4}
          feedbackVariant="scale"
          onPress={event => {
            event.stopPropagation();
            onOptions(template);
          }}
        >
          <ClayIcon name="more" size={18} color={colors.ink} />
        </Button>
        <Button
          testID={`template-start-${template.id}`}
          accessibilityLabel={t('plan.card.startA11y', { name: template.name })}
          className="h-9 w-9 min-w-9 rounded-full bg-accent p-0"
          hitSlop={4}
          feedbackVariant="scale"
          onPress={event => {
            event.stopPropagation();
            onStart(template);
          }}
        >
          <ClayIcon name="play" size={16} color={colors.onInk} />
        </Button>
      </View>
    </Pressable>
  );
}
