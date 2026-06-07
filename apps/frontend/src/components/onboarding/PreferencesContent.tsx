import { View, Text } from 'react-native';
import { SegmentedControl } from '../clay/SegmentedControl';
import { colors } from '../../theme/tokens';

type PreferencesContentProps = {
  weightUnit: string;
  setWeightUnit: (v: string) => void;
};

export function PreferencesContent({ weightUnit, setWeightUnit }: PreferencesContentProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
      <Text
        style={{
          fontSize: 30,
          fontWeight: '700',
          color: colors.ink,
          letterSpacing: -0.6,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Configure your{'\n'}experience
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: colors.muted,
          textAlign: 'center',
          marginBottom: 40,
        }}
      >
        You can change this later in settings.
      </Text>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.muted }}>
          Weight unit
        </Text>
        <SegmentedControl
          options={[
            { value: 'kg', label: 'Kilograms' },
            { value: 'lbs', label: 'Pounds' },
          ]}
          value={weightUnit}
          onChange={setWeightUnit}
        />
      </View>
    </View>
  );
}
