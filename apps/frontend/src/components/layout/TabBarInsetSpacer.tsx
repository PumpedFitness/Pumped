import type { ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

/**
 * Transparent spacer sized to the bottom safe area — which, inside the native
 * bottom-tab navigator, includes the floating tab bar's height (read natively,
 * not hardcoded).
 *
 * Place it as the last child of a tab screen's scroll content. The screen's
 * ScrollView runs full-height under the translucent bar (so content blurs
 * through the glass as it scrolls past), while this spacer ensures the last item
 * still scrolls clear of the bar.
 */
export function TabBarInsetSpacer() {
  return <SafeAreaView edges={EDGES} style={SPACER_STYLE} />;
}

const EDGES = { bottom: true } as const;
const SPACER_STYLE: ViewStyle = { flex: 0 };
