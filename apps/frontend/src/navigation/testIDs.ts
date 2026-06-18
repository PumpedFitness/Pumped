// Stable testIDs for the tab screens, consumed by the Maestro e2e flows
// (apps/frontend/.maestro/*.yaml).
//
// The bottom bar is the OS-native tab bar on iOS (@react-navigation/bottom-tabs/
// unstable) and a JS bar on Android; tab items expose no RN testID, so e2e taps
// tabs by their visible label text. Each tab SCREEN is still wrapped (see
// mainTabsShared) with a derived id so it picks up a matching `resource-id`.
//
// Why testIDs instead of asserting on visible text for screens: several titles
// render with `text-transform: uppercase`, so the on-screen glyphs differ from
// the accessibility node's text value. UIAutomator2 (Android) then only matches
// via a slow, flaky case-insensitive regex over the whole tree. A testID maps to
// a stable Android `resource-id` and matches exactly and fast.

import type { MainTabParamList } from './mainTabsShared';

type TabName = keyof MainTabParamList;

export const screenTestID = (name: TabName): string =>
  `screen-${name.toLowerCase()}`;
