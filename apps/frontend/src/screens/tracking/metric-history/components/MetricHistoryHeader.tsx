import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';

type MetricHistoryHeaderProps = {
  title: string;
  onBack: () => void;
  onAdd: () => void;
};

export function MetricHistoryHeader({
  title,
  onBack,
  onAdd,
}: MetricHistoryHeaderProps) {
  const { t } = useTranslation();
  return (
    <ScreenHeader
      title={title}
      onBack={onBack}
      backAccessibilityLabel={t('common.back')}
      right={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.add')}
          onPress={onAdd}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-card"
        >
          <ClayIcon name="plus" size={22} color={colors.accent} />
        </Pressable>
      }
    />
  );
}
