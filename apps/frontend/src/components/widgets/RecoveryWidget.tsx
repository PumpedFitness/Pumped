import { View, Text } from 'react-native';
import { Card } from '../clay/Card';
import { RingGauge } from '../clay/RingGauge';
import { Button } from '../clay/Button';
import { ClayIcon } from '../icons/ClayIcon';
import { colors, typography } from '../../theme/tokens';

type RecoveryWidgetProps = {
  colSpan: number;
  width: number;
};

export function RecoveryWidget(_props: RecoveryWidgetProps) {
  return (
    <Card variant="raised" radius="2xl" pad={20}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <RingGauge value={86} size={84} thickness={11}>
          <Text
            style={{
              fontSize: typography.title,
              fontWeight: '700',
              color: colors.cream,
              letterSpacing: -0.3,
            }}
          >
            86
          </Text>
          <Text
            style={{
              fontSize: typography.micro,
              fontWeight: '700',
              color: colors.creamDim,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              marginTop: -2,
            }}
          >
            READY
          </Text>
        </RingGauge>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: typography.micro,
              fontWeight: '700',
              color: colors.creamDim,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              marginBottom: 4,
            }}
          >
            RECOVERY
          </Text>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.cream,
              lineHeight: 26,
            }}
          >
            You're primed{'\n'}for Push Day
          </Text>
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: colors.lineOnMoss,
          marginTop: 16,
          marginBottom: 14,
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row', gap: 20 }}>
          <View>
            <Text style={{ fontSize: typography.title, fontWeight: '700', color: colors.cream }}>
              6
            </Text>
            <Text style={{ fontSize: typography.micro, color: colors.creamDim, marginTop: 2 }}>
              movements
            </Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={{ fontSize: typography.title, fontWeight: '700', color: colors.cream }}>
                48
              </Text>
              <Text style={{ fontSize: typography.caption, fontWeight: '500', color: colors.creamDim, marginLeft: 2 }}>
                m
              </Text>
            </View>
            <Text style={{ fontSize: typography.micro, color: colors.creamDim, marginTop: 2 }}>
              est. time
            </Text>
          </View>
        </View>

        <Button
          variant="primary"
          size="sm"
          iconRight={<ClayIcon name="play" size={16} color={colors.accentInk} />}
        >
          Start
        </Button>
      </View>
    </Card>
  );
}
