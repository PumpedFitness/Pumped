import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Card } from './Card';
import { colors, typography } from '../../theme/tokens';

type SettingsSectionProps = {
  label: string;
  children: ReactNode;
};

export function SettingsSection({ label, children }: SettingsSectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: typography.caption,
          fontWeight: '600',
          color: colors.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 8,
          marginLeft: 4,
        }}
      >
        {label}
      </Text>
      <Card variant="card" radius="xl" pad={0}>
        {children}
      </Card>
    </View>
  );
}
