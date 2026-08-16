import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@pumped/ui/clay/ScreenHeader';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';

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
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={testID}
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <View className="h-[52px] flex-row items-center px-4">
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
        >
          <ClayIcon name="back" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="px-5 pb-10 pt-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6">
          <ScreenHeader title={title} subtitle={subtitle} />
        </View>
        {children}
      </ScrollView>
    </View>
  );
}
