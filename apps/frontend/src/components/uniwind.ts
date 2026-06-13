import Animated from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { withUniwind } from 'uniwind';

export const AnimatedView = withUniwind(Animated.View);
export const StyledWebView = withUniwind(WebView);
