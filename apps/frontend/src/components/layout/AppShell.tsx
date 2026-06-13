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
 *  - `showTabBar` (default true): when true, adds bottom padding to
 *    clear the floating nav (64 + 8 gutter + inset). Pass false for
 *    fullscreen flows like the active session.
 *  - `padTop` (default true): apply safe-area top inset as padding.
 *  - `padHorizontal` (default 0): screen-gutter; design default is 20,
 *    but many screens manage their own horizontal padding per-section.
 *  - `style`: additional style overrides on the inner content container.
 */

const TAB_BAR_HEIGHT = 64;
const TAB_BAR_GUTTER = 8;

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
  padTop = true,
  padHorizontal = 0,
  style,
}: AppShellProps) {
  const insets = useSafeAreaInsets();

  const topPadding = padTop ? insets.top : 0;
  const bottomPadding = showTabBar
    ? insets.bottom + TAB_BAR_HEIGHT + TAB_BAR_GUTTER + 16 // 16 extra breathing room
    : insets.bottom;

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
