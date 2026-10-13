import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type SupersetCardHeaderProps = {
  memberCount: number;
  dragHandle?: ReactNode;
};

export function SupersetCardHeader({
  memberCount,
  dragHandle,
}: SupersetCardHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-2 pb-1">
      <View className="flex-1">
        <Text className="t-eyebrow text-accent">
          {t('templateEditor.superset.eyebrow')}
        </Text>
        <Text className="t-caption mt-0.5">
          {t('templateEditor.superset.summary', { count: memberCount })}
        </Text>
      </View>
      {dragHandle}
    </View>
  );
}
