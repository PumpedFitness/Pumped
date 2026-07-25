import { useState } from 'react';
import { Pressable, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, shadows } from '../theme/tokens';

// Base play triangle authored on an 18-unit canvas: "M2 1.6 16 10 2 18.4Z".
// We scale it to a fraction of the circle so the glyph reads optically centered.
const GLYPH_PATH = 'M2 1.6 16 10 2 18.4Z';
const GLYPH_CANVAS = 18;
const GLYPH_RATIO = 0.42;

type PlayCircleProps = {
  size?: number;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
  className?: string;
};

export function PlayCircle({
  size = 64,
  onPress,
  accessibilityLabel,
  style,
  className = '',
}: PlayCircleProps) {
  const [pressed, setPressed] = useState(false);
  const glyphSize = size * GLYPH_RATIO;
  // Optical nudge right — a play triangle looks centered slightly off-center.
  const offsetX = glyphSize * 0.06;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={`items-center justify-center rounded-full ${className}`}
      style={[
        shadows.accent,
        {
          width: size,
          height: size,
          backgroundColor: pressed ? colors.accentHover : colors.accent,
        },
        style,
      ]}
    >
      <Svg
        width={glyphSize}
        height={glyphSize}
        viewBox={`0 0 ${GLYPH_CANVAS} ${GLYPH_CANVAS}`}
        style={{ marginLeft: offsetX }}
      >
        <Path d={GLYPH_PATH} fill={colors.onInk} />
      </Svg>
    </Pressable>
  );
}
