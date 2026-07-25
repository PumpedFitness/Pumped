import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, {
  Defs,
  G,
  Mask,
  Path,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '@pumped/ui/theme/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// A vertical zig-zag that sweeps left→right; a thick stroke makes the overlapping
// passes read as a solid pencil fill once it's drawn on. Masked to the "P" glyph,
// it looks like the letter is being shaded in by a pencil. Length precomputed.
const SKETCH_PATH =
  'M14 14L14 86L21 86L21 14L28 14L28 86L35 86L35 14L42 14L42 86L49 86L49 14L56 14L56 86L63 86L63 14L70 14L70 86L77 86L77 14L84 14L84 86';
const SKETCH_LENGTH = 862;

type PumpedLogoMarkProps = {
  /** Overall tile size, in px. */
  size?: number;
  /** Rounded-tile background color. */
  tileColor?: string;
  /** Color the "P" is drawn in. */
  inkColor?: string;
  /** Delay before the pencil starts, ms. */
  delay?: number;
  /** Draw duration, ms. */
  duration?: number;
};

/**
 * The Pumped logo: a rounded app-icon tile with a "P" — the real font glyph,
 * used as a mask — that draws itself on like a pencil sketch.
 */
export function PumpedLogoMark({
  size = 128,
  tileColor = colors.accent,
  inkColor = colors.cream,
  delay = 0,
  duration = 1300,
}: PumpedLogoMarkProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
    );
  }, [progress, delay, duration]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: SKETCH_LENGTH * (1 - progress.value),
  }));

  const glyphSize = size * 0.64;

  return (
    <View
      className="self-center items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.235,
        backgroundColor: tileColor,
        shadowColor: colors.ink,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 22,
        elevation: 8,
      }}
    >
      <Svg width={glyphSize} height={glyphSize} viewBox="0 0 100 100">
        <Defs>
          <Mask id="p-glyph">
            <SvgText
              x={50}
              y={78}
              fill="#fff"
              fontSize={80}
              fontWeight="700"
              textAnchor="middle"
            >
              P
            </SvgText>
          </Mask>
        </Defs>

        {/* Faint guide so the shape is hinted before the pencil fills it. */}
        <SvgText
          x={50}
          y={78}
          fill={inkColor}
          fillOpacity={0.16}
          fontSize={80}
          fontWeight="700"
          textAnchor="middle"
        >
          P
        </SvgText>

        {/* Pencil sketch-fill, clipped to the glyph. */}
        <G mask="url(#p-glyph)">
          <AnimatedPath
            d={SKETCH_PATH}
            stroke={inkColor}
            strokeWidth={8.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={SKETCH_LENGTH}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
    </View>
  );
}
