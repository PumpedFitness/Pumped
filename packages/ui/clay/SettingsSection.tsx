import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Card } from './Card';

type SettingsSectionProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function SettingsSection({
  label,
  children,
  className = '',
}: SettingsSectionProps) {
  return (
    <View className={`mb-6 ${className}`}>
      <Text className="text-[12.5px] font-semibold text-muted uppercase tracking-[0.5px] mb-2 ml-1">
        {label}
      </Text>
      <Card variant="card" radius="xl" pad={0}>
        {children}
      </Card>
    </View>
  );
}
