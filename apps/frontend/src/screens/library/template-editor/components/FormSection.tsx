import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

type FormSectionProps = {
  title: string;
  children: ReactNode;
  description?: string;
  action?: ReactNode;
};

export function FormSection({
  title,
  children,
  description,
  action,
}: FormSectionProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1">
          <Text className="t-eyebrow">{title}</Text>
          {description && <Text className="t-caption mt-1">{description}</Text>}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}
