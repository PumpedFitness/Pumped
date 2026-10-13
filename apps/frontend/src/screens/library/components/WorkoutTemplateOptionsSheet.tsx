import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from 'heroui-native';
import { AppBottomSheet } from '@pumped/ui/forms/AppBottomSheet';
import { ListRow } from '@pumped/ui/clay/ListRow';
import { Button } from '@pumped/ui/clay/Button';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';

export type TemplateAction = 'edit' | 'share' | 'delete';
type WorkoutTemplateOptionsSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSelect: (action: TemplateAction) => void;
};

export function WorkoutTemplateOptionsSheet({
  open,
  title,
  onClose,
  onSelect,
}: WorkoutTemplateOptionsSheetProps) {
  const { t } = useTranslation();
  const choose = (action: TemplateAction) => {
    onClose();
    onSelect(action);
  };
  return (
    <AppBottomSheet open={open} onClose={onClose}>
      <BottomSheet.Overlay />
      <AppBottomSheet.Content backgroundClassName="bg-background">
        <BottomSheet.Title className="t-title">{title}</BottomSheet.Title>
        <BottomSheet.Description className="t-caption mt-1">
          {t('plan.card.optionsBody')}
        </BottomSheet.Description>
        <View className="mt-5 overflow-hidden rounded-[20px] bg-surface-card">
          <ListRow
            testID="template-menu-edit"
            label={t('plan.card.edit')}
            icon={<ClayIcon name="edit" size={18} color={colors.ink} />}
            onPress={() => choose('edit')}
          />
          <ListRow
            testID="template-menu-share"
            divider
            label={t('share.send.templateCta')}
            icon={<ClayIcon name="arrowUp" size={18} color={colors.ink} />}
            onPress={() => choose('share')}
          />
          <ListRow
            testID="template-menu-delete"
            divider
            label={<Text className="text-danger">{t('common.delete')}</Text>}
            icon={<ClayIcon name="trash" size={18} color={colors.danger} />}
            onPress={() => choose('delete')}
          />
        </View>
        <View className="mt-3">
          <Button variant="ghost" block onPress={onClose}>
            {t('common.cancel')}
          </Button>
        </View>
      </AppBottomSheet.Content>
    </AppBottomSheet>
  );
}
