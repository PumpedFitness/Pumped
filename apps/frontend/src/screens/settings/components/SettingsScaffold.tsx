import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/layout/ScreenHeader';

type SettingsScaffoldProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  testID?: string;
};

/**
 * The chrome every settings screen shares: safe area, a back button, the
 * title, and a scroller.
 *
 * Settings are pushed rather than shown as a tab — iOS folds a sixth tab into
 * a "More" menu and hides two destinations — so each of these screens has to
 * bring its own top inset and its own way back.
 */
export function SettingsScaffold({
  title,
  subtitle,
  children,
  testID,
}: SettingsScaffoldProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerClassName="px-5 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}
