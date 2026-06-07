import { View, Text, ScrollView } from 'react-native';
import { SegmentedControl } from '../clay/SegmentedControl';
import { ProfileField } from '../forms/ProfileField';
import { colors } from '../../theme/tokens';

export type ProfileFields = {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  bodyFat: string;
};

type ProfileContentProps = {
  fields: ProfileFields;
  setField: <K extends keyof ProfileFields>(key: K, value: string) => void;
};

export function ProfileContent({ fields, setField }: ProfileContentProps) {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces
    >
      <Text
        style={{
          fontSize: 30,
          fontWeight: '700',
          color: colors.ink,
          letterSpacing: -0.6,
          marginBottom: 4,
        }}
      >
        About you
      </Text>

      <Text
        style={{
          fontSize: 15,
          color: colors.muted,
          marginBottom: 28,
        }}
      >
        Optional — you can always set this later.
      </Text>

      <View style={{ gap: 18 }}>
        <ProfileField
          label="Name"
          value={fields.name}
          onChangeText={v => setField('name', v)}
          placeholder="What should we call you?"
        />
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12.5, fontWeight: '600', color: colors.muted }}>
            Gender
          </Text>
          <SegmentedControl
            options={['Male', 'Female', 'Other']}
            value={fields.gender}
            onChange={v => setField('gender', v)}
          />
        </View>
        <ProfileField
          label="Age"
          value={fields.age}
          onChangeText={v => setField('age', v)}
          placeholder="e.g. 25"
          keyboardType="numeric"
        />
        <ProfileField
          label="Height"
          value={fields.height}
          onChangeText={v => setField('height', v)}
          placeholder="e.g. 180 cm"
          keyboardType="decimal-pad"
        />
        <ProfileField
          label="Weight"
          value={fields.weight}
          onChangeText={v => setField('weight', v)}
          placeholder="e.g. 80 kg"
          keyboardType="decimal-pad"
        />
        <ProfileField
          label="Estimated body fat %"
          value={fields.bodyFat}
          onChangeText={v => setField('bodyFat', v)}
          placeholder="e.g. 15"
          keyboardType="decimal-pad"
        />
      </View>
    </ScrollView>
  );
}
