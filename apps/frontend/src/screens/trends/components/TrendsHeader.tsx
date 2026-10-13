import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon, colors } from '@pumped/ui';
import { ScreenHeader } from '@pumped/ui/clay/ScreenHeader';

type TrendsHeaderProps = {
  onBack: () => void;
};

export function TrendsHeader({ onBack }: TrendsHeaderProps) {
  const { t } = useTranslation();
  return (
    <View className="gap-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
        onPress={onBack}
        className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-card"
      >
        <ClayIcon name="back" size={20} color={colors.ink} />
      </Pressable>
      <ScreenHeader title={t('trends.title')} subtitle={t('trends.window')} />
    </View>
  );
}
