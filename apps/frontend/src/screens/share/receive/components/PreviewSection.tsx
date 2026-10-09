import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { PreviewExerciseRow } from '../receiveShareModel';

type PreviewSectionProps = {
  title: string;
  children: ReactNode;
};

type PreviewExerciseListProps = {
  rows: readonly PreviewExerciseRow[];
};

/** A titled hairline card, the building block of every preview. */
export function PreviewSection({ title, children }: PreviewSectionProps) {
  return (
    <View className="rounded-[22px] border border-border-hairline bg-surface-card p-4">
      <Text className="t-eyebrow">{title}</Text>
      <View className="mt-2">{children}</View>
    </View>
  );
}

export function PreviewExerciseList({ rows }: PreviewExerciseListProps) {
  const { t } = useTranslation();

  return (
    <View className="divide-y divide-border-hairline">
      {rows.map((row, index) => (
        <View key={row.key} className="flex-row items-center gap-3 py-2.5">
          <Text className="t-caption w-5">{index + 1}</Text>
          <Text className="t-body flex-1" numberOfLines={1}>
            {row.name ?? t('share.receive.unknownExercise')}
          </Text>
          <Text className="t-caption">
            {t('share.receive.setCount', { count: row.setCount })}
          </Text>
        </View>
      ))}
    </View>
  );
}
