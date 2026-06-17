// Stable testIDs for the bottom tab bar and tab screens, consumed by the
// Maestro e2e flows (apps/frontend/.maestro/*.yaml).
//
// They are DERIVED from the navigator's screen names rather than hand-written,
// so adding a tab in MainTabs/AppBar needs no extra wiring — the button and the
// screen container both pick up matching ids automatically.
//
// Why testIDs instead of asserting on visible text: several titles render with
// `text-transform: uppercase`, so the on-screen glyphs differ from the
// accessibility node's text value. UIAutomator2 (Android) then only matches via
// a slow, flaky case-insensitive regex over the whole tree. A testID maps to a
// stable Android `resource-id` and matches exactly and fast.

import type { MainTabParamList } from './MainTabs';

type TabName = keyof MainTabParamList;

export const tabTestID = (name: TabName): string => `tab-${name.toLowerCase()}`;

export const screenTestID = (name: TabName): string =>
  `screen-${name.toLowerCase()}`;
