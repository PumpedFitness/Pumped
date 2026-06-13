import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/theme/tokens';

type RingGaugeProps = {
  value?: number;
  size?: number;
  thickness?: number;
  trackColor?: string;
  fillColor?: string;
  centerColor?: string;
  children?: ReactNode;
  style?: ViewStyle;
  className?: string;
};

export function RingGauge({
  value = 0,
  size = 84,
  thickness = 11,
  trackColor = 'rgba(243, 238, 226, 0.2)',
  fillColor = colors.cream,
  centerColor = colors.moss,
  children,
  style,
  className = '',
}: RingGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <View
      className={`items-center justify-center ${className}`}
      style={[{ width: size, height: size }, style]}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={thickness}
          fill="none"
        />
        {/* Fill */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={fillColor}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Center */}
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: size - thickness * 2,
          height: size - thickness * 2,
          backgroundColor: centerColor,
        }}
      >
        {children}
      </View>
    </View>
  );
}
