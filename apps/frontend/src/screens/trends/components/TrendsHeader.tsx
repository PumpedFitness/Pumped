import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

export function TrendsHeader() {
  const { t } = useTranslation();

  return (
    <View>
      <Text className="t-display">{t('trends.title')}</Text>
      <Text className="t-caption mt-1">{t('trends.window')}</Text>
    </View>
  );
}
