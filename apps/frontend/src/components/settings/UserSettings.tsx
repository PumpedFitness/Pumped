import { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';
import { desc } from 'drizzle-orm';
import { SettingsSection } from '../clay/SettingsSection';
import { EditableRow } from '../clay/EditableRow';
import { ListRow } from '../clay/ListRow';
import { ClayIcon } from '../icons/ClayIcon';
import { BottomSheetFrame } from '../forms/BottomSheetFrame';
import { OptionSelectorSheet } from '../forms/OptionSelectorSheet';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useRepository } from '../../data/local/useRepository';
import type { Gender } from '../../data/local/schema/userProfile';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '../../data/local/schema/bodyMetrics';
import { formatWeight } from '../../utils/units';
import { colors, radii, typography } from '../../theme/tokens';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

function formatBirthdate(iso: string | null): string {
  if (!iso) return 'Not set';
  const d = new Date(iso + 'T00:00:00');
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatGender(g: Gender | null): string {
  if (!g) return 'Not set';
  return g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other';
}

const chevron = <ClayIcon name="chevron" size={16} color={colors.muted} />;

export function UserSettings() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { profile, set } = useUserProfile();

  const weightRepo = useRepository(bodyWeightEntries);
  const fatRepo = useRepository(bodyFatEntries);

  const latestWeight = weightRepo.query({
    orderBy: desc(bodyWeightEntries.recordedAt),
    limit: 1,
  });
  const latestFat = fatRepo.query({
    orderBy: desc(bodyFatEntries.recordedAt),
    limit: 1,
  });

  const [genderSheet, setGenderSheet] = useState(false);
  const [birthdateSheet, setBirthdateSheet] = useState(false);
  const [birthdateDate, setBirthdateDate] = useState(
    profile.birthdate
      ? new Date(profile.birthdate + 'T00:00:00')
      : new Date(2000, 0, 1),
  );

  return (
    <>
      {/* ── Profile ──────────────────────────── */}
      <SettingsSection label="Profile">
        <EditableRow
          icon={<ClayIcon name="user" size={18} color={colors.accent} />}
          label="Name"
          value={profile.name}
          placeholder="Your name"
          onSave={v => set({ name: v })}
        />
        <ListRow
          icon={<ClayIcon name="user" size={18} color={colors.accent} />}
          label="Gender"
          detail={formatGender(profile.gender)}
          trailing={chevron}
          divider
          onPress={() => setGenderSheet(true)}
        />
        <ListRow
          icon={<ClayIcon name="calendar" size={18} color={colors.accent} />}
          label="Birthdate"
          detail={formatBirthdate(profile.birthdate)}
          trailing={chevron}
          divider
          onPress={() => {
            setBirthdateDate(
              profile.birthdate
                ? new Date(profile.birthdate + 'T00:00:00')
                : new Date(2000, 0, 1),
            );
            setBirthdateSheet(true);
          }}
        />
        <EditableRow
          icon={<ClayIcon name="ruler" size={18} color={colors.accent} />}
          label="Height"
          value={profile.heightCm ? String(profile.heightCm) : ''}
          placeholder="cm"
          keyboardType="decimal-pad"
          divider
          onSave={v => {
            const n = parseFloat(v);
            if (!isNaN(n) && n > 0) set({ heightCm: n });
          }}
        />
      </SettingsSection>

      {/* ── Body Tracking ────────────────────── */}
      <SettingsSection label="Body Tracking">
        <ListRow
          icon={<ClayIcon name="scale" size={18} color={colors.accent} />}
          label="Weight"
          detail={
            latestWeight.length > 0
              ? formatWeight(latestWeight[0].value, profile.weightUnit)
              : 'No entries'
          }
          trailing={chevron}
          onPress={() => navigation.navigate('WeightHistory')}
        />
        <ListRow
          icon={<ClayIcon name="percent" size={18} color={colors.accent} />}
          label="Body Fat"
          detail={
            latestFat.length > 0
              ? `${latestFat[0].value.toFixed(1)}%`
              : 'No entries'
          }
          trailing={chevron}
          divider
          onPress={() => navigation.navigate('BodyFatHistory')}
        />
      </SettingsSection>

      {/* ── Sheets ───────────────────────────── */}
      <OptionSelectorSheet
        visible={genderSheet}
        title="Gender"
        value={profile.gender ?? ''}
        options={GENDER_OPTIONS}
        onClose={() => setGenderSheet(false)}
        onChange={v => set({ gender: v as Gender })}
      />

      <BottomSheetFrame
        visible={birthdateSheet}
        accessibilityLabel="Close birthdate editor"
        onClose={() => setBirthdateSheet(false)}
      >
        <View
          style={{
            gap: 16,
            paddingHorizontal: 20,
            paddingBottom: 32,
            paddingTop: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.line,
              alignSelf: 'center',
            }}
          />
          <Text
            style={{
              fontSize: typography.title,
              fontWeight: '700',
              color: colors.ink,
              textAlign: 'center',
            }}
          >
            Birthdate
          </Text>

          <DateTimePicker
            value={birthdateDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onChange={(_, selected) => {
              if (selected) setBirthdateDate(selected);
            }}
            style={{ alignSelf: 'center' }}
          />

          <Pressable
            onPress={() => {
              const y = birthdateDate.getFullYear();
              const m = String(birthdateDate.getMonth() + 1).padStart(2, '0');
              const d = String(birthdateDate.getDate()).padStart(2, '0');
              set({ birthdate: `${y}-${m}-${d}` });
              setBirthdateSheet(false);
            }}
            style={({ pressed }) => ({
              backgroundColor: pressed ? '#B06A42' : colors.accent,
              paddingVertical: 16,
              borderRadius: radii.pill,
              alignItems: 'center',
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.accentInk,
              }}
            >
              Save
            </Text>
          </Pressable>
        </View>
      </BottomSheetFrame>
    </>
  );
}
