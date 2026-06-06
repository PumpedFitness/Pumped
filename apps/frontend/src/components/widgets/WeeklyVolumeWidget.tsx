import { View, Text } from 'react-native';
import { Card } from '../clay/Card';
import { colors, typography } from '../../theme/tokens';

type WeeklyVolumeWidgetProps = {
  colSpan: number;
  width: number;
};

export function WeeklyVolumeWidget(_props: WeeklyVolumeWidgetProps) {
  return (
    <Card variant="raised" radius="lg" pad={15}>
      <Text style={{ fontSize: typography.caption, fontWeight: '600', color: colors.creamDim }}>
        This week
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
        <Text
          style={{
            fontSize: typography.stat,
            fontWeight: '700',
            color: colors.cream,
            fontVariant: ['tabular-nums'],
            letterSpacing: -0.3,
          }}
        >
          24.8k
        </Text>
        <Text style={{ fontSize: typography.label, fontWeight: '500', color: colors.creamDim, marginLeft: 4 }}>
          kg
        </Text>
      </View>
    </Card>
  );
}
