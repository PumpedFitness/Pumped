import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * AppShell — the screen-level wrapper for every Pumped screen.
 *
 * Handles safe-area insets and reserves bottom space for the floating
 * tab bar so content never renders behind it.
 *
 * Props:
 *  - `showTabBar` (default true): when true, the screen lives inside the
 *    native bottom-tab navigator, which already reserves its own space below
 *    the content — so no extra bottom padding is added. Pass false for
 *    fullscreen flows (modals, the active session) that own the full height
 *    and must clear the home-indicator inset themselves.
 *  - `padTop` (default true): apply safe-area top inset as padding.
 *  - `padHorizontal` (default 0): screen-gutter; design default is 20,
 *    but many screens manage their own horizontal padding per-section.
 *  - `style`: additional style overrides on the inner content container.
 */

type AppShellProps = {
  children: ReactNode;
  showTabBar?: boolean;
  padTop?: boolean;
  padHorizontal?: number;
  style?: ViewStyle;
};

export function AppShell({
  children,
  showTabBar = true,
  padTop = false,
  padHorizontal = 0,
  style,
}: AppShellProps) {
  const insets = useSafeAreaInsets();

  const topPadding = padTop ? insets.top : 0;
  // The native tab bar reserves its own space below tab screens, so they add no
  // bottom padding; standalone screens still clear the home-indicator inset.
  const bottomPadding = 65;

  return (
    <View
      className="flex-1 bg-background"
      style={[
        {
          paddingTop: topPadding,
          paddingBottom: bottomPadding,
          paddingHorizontal: padHorizontal,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
