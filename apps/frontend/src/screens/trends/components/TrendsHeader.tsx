import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon, colors, shadows } from '@pumped/ui';

type TrendsHeaderProps = {
  onBack: () => void;
};

/** Trends header — back circle + title/window (README §2). */
export function TrendsHeader({ onBack }: TrendsHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-[12px]">
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        className="h-10 w-10 items-center justify-center rounded-full bg-surface-card active:bg-[#FFFFFF]"
        style={shadows.circle}
      >
        <ClayIcon name="back" size={20} color={colors.ink} />
      </Pressable>
      <View>
        <Text className="text-[15px] font-[700] text-foreground">
          {t('trends.title')}
        </Text>
        <Text className="t-caption">{t('trends.window')}</Text>
      </View>
    </View>
  );
}
