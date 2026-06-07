import { useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { SettingsSection } from '../clay/SettingsSection';
import { ListRow } from '../clay/ListRow';
import { SegmentedControl } from '../clay/SegmentedControl';
import { ClayIcon } from '../icons/ClayIcon';
import { useUserProfile } from '../../hooks/useUserProfile';
import type { WeightUnit } from '../../data/local/schema/userProfile';
import { useAuthStore } from '../../stores/authStore';
import { db } from '../../data/local/database';
import {
  bodyWeightEntries,
  bodyFatEntries,
} from '../../data/local/schema/bodyMetrics';
import {
  exercises,
  workoutTemplates,
  workoutTemplateExercises,
  workoutTemplateSets,
  workoutTemplateScheduleWeekdays,
  workoutSessions,
  performedSets,
  userProfile,
} from '../../data/local/schema';
import { colors, radii } from '../../theme/tokens';

const chevron = <ClayIcon name="chevron" size={16} color={colors.muted} />;

export function AppSettings() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { profile, set, resetProfile } = useUserProfile();
  const resetOnboarding = useAuthStore(s => s.resetOnboarding);

  const handleResetAll = useCallback(() => {
    Alert.alert(
      'Reset All Data?',
      'This will permanently delete all your workout data, templates, and profile information. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All workout history, templates, and personal data will be permanently erased.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset Everything',
                  style: 'destructive',
                  onPress: () => {
                    db.delete(performedSets).run();
                    db.delete(workoutSessions).run();
                    db.delete(workoutTemplateSets).run();
                    db.delete(workoutTemplateScheduleWeekdays).run();
                    db.delete(workoutTemplateExercises).run();
                    db.delete(workoutTemplates).run();
                    db.delete(exercises).run();
                    db.delete(bodyWeightEntries).run();
                    db.delete(bodyFatEntries).run();
                    db.delete(userProfile).run();

                    resetOnboarding();

                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{ name: 'Onboarding' }],
                      }),
                    );
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }, [resetOnboarding, navigation]);

  return (
    <>
      {/* ── Preferences ──────────────────────── */}
      <SettingsSection label="Preferences">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 13,
            paddingVertical: 10,
            paddingHorizontal: 16,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: radii.sm,
              backgroundColor: colors.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ClayIcon name="settings" size={18} color={colors.accent} />
          </View>
          <Text
            style={{
              flex: 1,
              fontSize: 15,
              fontWeight: '500',
              color: colors.ink,
            }}
          >
            Units
          </Text>
          <View style={{ width: 160 }}>
            <SegmentedControl
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'lbs', label: 'lbs' },
              ]}
              value={profile.weightUnit}
              onChange={v => set({ weightUnit: v as WeightUnit })}
            />
          </View>
        </View>
      </SettingsSection>

      {/* ── Data ─────────────────────────────── */}
      <SettingsSection label="Data">
        <ListRow
          icon={<ClayIcon name="warning" size={18} color={colors.danger} />}
          label={
            <Text
              style={{
                fontSize: 15,
                fontWeight: '500',
                color: colors.danger,
              }}
            >
              Reset all data
            </Text>
          }
          trailing={chevron}
          onPress={handleResetAll}
        />
      </SettingsSection>
    </>
  );
}
