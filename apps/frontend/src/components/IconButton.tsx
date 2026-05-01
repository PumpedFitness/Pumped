import {Pressable} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {colors} from '../theme/tokens';

type IconButtonProps = {
  icon: string;
  onPress?: () => void;
  label: string;
  bordered?: boolean;
  size?: number;
};

export function IconButton({icon, onPress, label, bordered, size = 20}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      className={`w-11 h-11 items-center justify-center rounded-sm active:bg-surface-hover ${
        bordered ? 'border border-border' : ''
      }`}>
      <SvgIcon d={icon} size={size} color={colors.textSecondary} />
    </Pressable>
  );
}

type SvgIconProps = {
  d: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function SvgIcon({d, size = 20, color = 'currentColor', strokeWidth = 2}: SvgIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d={d} />
    </Svg>
  );
}

export const Icons = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  search: 'M11 11m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M20 20l-3.5-3.5',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z',
  dumbbell: 'M2 12h2M20 12h2M6 6v12M9 6v12M15 6v12M18 6v12M6 12h12',
  flame: 'M12 2c1 4 5 5 5 10a5 5 0 11-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',
  filter: 'M3 4h18l-7 9v6l-4 2v-8L3 4z',
  more: 'M12 5m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M12 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M12 19m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0',
} as const;
