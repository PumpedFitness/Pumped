declare module 'react-native/Libraries/Components/ScrollView/ScrollViewContext' {
  import type { Context } from 'react';
  /**
   * RN's ScrollView publishes this context to descendants; `VirtualizedList`
   * reads it ONLY to emit the "VirtualizedLists should never be nested inside
   * plain ScrollViews" dev warning (it's not used functionally). Providing
   * `null` around an intentionally-nested list — here react-native-reorderable-
   * list's `NestedReorderableList` inside its `ScrollViewContainer` — silences
   * the warning without affecting behaviour (the library coordinates scroll via
   * its own `ScrollViewContainerContext` + gestures).
   */
  const ScrollViewContext: Context<{ horizontal: boolean } | null>;
  export default ScrollViewContext;
}
