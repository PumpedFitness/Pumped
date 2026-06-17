import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * AppShell — the screen-level wrapper for every Pumped screen.
 *
 * Props:
 *  - `showTabBar` (default true): the screen lives inside the native bottom-tab
 *    navigator. Its content runs full-height *under* the translucent tab bar so
 *    content blurs through the glass while scrolling; the screen's scroll
 *    content adds a `<TabBarInsetSpacer/>` at the end so the last item still
 *    clears the bar. Pass false for fullscreen flows (modals, the active
 *    session) that own the full height and clear the home-indicator inset here.
 *  - `padTop` (default false): apply the safe-area top inset.
 *  - `padHorizontal` (default 0): screen-gutter; design default is 20,
 *    but many screens manage their own horizontal padding per-section.
 *  - `style`: additional style overrides on the content container.
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
  // Tab screens run under the bar and clear it via <TabBarInsetSpacer/>;
  // standalone screens clear the home-indicator inset here.
  const bottomPadding = showTabBar ? 0 : insets.bottom;

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
