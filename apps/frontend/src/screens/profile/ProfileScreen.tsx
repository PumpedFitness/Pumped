import { Text, ScrollView } from 'react-native';
import { AppShell } from '../../components/AppShell';
import { UserSettings } from '../../components/settings/UserSettings';
import { AppSettings } from '../../components/settings/AppSettings';
import { colors, typography } from '../../theme/tokens';

export function ProfileScreen() {
  return (
    <AppShell showTabBar>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 32,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontSize: typography.display,
            fontWeight: '700',
            color: colors.ink,
            letterSpacing: -0.6,
            marginBottom: 24,
          }}
        >
          Settings
        </Text>

        <UserSettings />
        <AppSettings />
      </ScrollView>
    </AppShell>
  );
}
