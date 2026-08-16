import { useEffect, useId, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { alpha } from '../theme/palette';
import { colors } from '../theme/tokens';

type SkeletonProps = {
  height: number;
  radius?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Tinted ink rather than a surface token.
 *
 * The sunken-surface token is `#DFDCD8` and the ground it sits on is `#E8E6E2`
 * — nine values apart per channel, which is invisible on a phone in daylight.
 * Ink at low alpha darkens against whatever it is over, so the block reads on
 * the warm ground and on a card alike.
 */
const FILL = alpha(colors.ink, 0.11);

/** One pass of the highlight, edge to edge. */
const SWEEP_MS = 1150;

/** Band width as a share of the block — wide enough to feel like light. */
const BAND_RATIO = 0.65;

/** A narrow block still needs a band big enough to see travel. */
const MIN_BAND = 72;

const HIGHLIGHT = '#FFFFFF';
const HIGHLIGHT_STRENGTH = 0.55;

/**
 * A placeholder block with a highlight travelling across it.
 *
 * Was a plain opacity pulse, on the reasoning that a sweep costs a masked layer
 * per block. Two things overruled that. The sweep is what people read as
 * "loading" — a pulse at a legible contrast just looks like a block that cannot
 * decide how dark it is. And the pulse was very likely never running: it was
 * issued on mount, and these mount in the first commit of the screen, which is
 * exactly when reanimated drops an animation before it reaches the UI thread —
 * the same race that once froze the widget grid at its fallback row height.
 *
 * So the animation starts from `onLayout` instead. By then the view has been
 * through a layout pass and the UI thread is live, and the measurement is
 * needed for the travel distance anyway. If it somehow never fires, the block
 * still shows at full contrast — a static placeholder, not an invisible one.
 */
export function Skeleton({
  height,
  radius = 22,
  className = '',
  style,
}: SkeletonProps) {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);
  // react-native-svg resolves `url(#id)` per rendered tree; two blocks sharing
  // a gradient id can resolve to the same node and leave one of them unpainted.
  const gradientId = `skeleton-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  useEffect(() => {
    if (width === 0) return;
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: SWEEP_MS, easing: Easing.linear }),
      -1,
      false,
    );
  }, [progress, width]);

  const bandWidth = Math.max(MIN_BAND, width * BAND_RATIO);

  const sweep = useAnimatedStyle(() => ({
    // Starts fully off the left edge and leaves fully off the right, so there
    // is no moment where the highlight is clipped mid-band.
    transform: [
      { translateX: -bandWidth + progress.value * (width + bandWidth) },
    ],
  }));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className={className}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={[
        {
          height,
          borderRadius: radius,
          backgroundColor: FILL,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {width > 0 ? (
        <Animated.View
          style={[
            { position: 'absolute', top: 0, bottom: 0, width: bandWidth },
            sweep,
          ]}
        >
          <Svg width={bandWidth} height={height}>
            <Defs>
              <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={HIGHLIGHT} stopOpacity={0} />
                <Stop
                  offset="0.5"
                  stopColor={HIGHLIGHT}
                  stopOpacity={HIGHLIGHT_STRENGTH}
                />
                <Stop offset="1" stopColor={HIGHLIGHT} stopOpacity={0} />
              </SvgLinearGradient>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={bandWidth}
              height={height}
              fill={`url(#${gradientId})`}
            />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}
