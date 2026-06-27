import { Image, View } from 'react-native';
import type { WorkoutTemplateColor } from '@/data/local/enums';
import { ClayIcon, type IconName } from '@/components/icons/ClayIcon';
import { getWorkoutTemplateColor } from './workoutTemplatePresentation';

type WorkoutAvatarProps = {
  picture: string | null;
  icon: IconName | null;
  /** Snapshotted/template color; null falls back to the default accent. */
  color: WorkoutTemplateColor | null;
  size: number;
  radius?: number;
};

function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// A workout's visual identity: its photo if set, otherwise a color-tinted tile
// with its logo glyph (or the default dumbbell). Shared by history + schedule.
export function WorkoutAvatar({
  picture,
  icon,
  color,
  size,
  radius,
}: WorkoutAvatarProps) {
  const borderRadius = radius ?? Math.round(size * 0.34);

  if (picture) {
    return (
      <Image source={{ uri: picture }} style={{ width: size, height: size, borderRadius }} />
    );
  }

  const hex = getWorkoutTemplateColor(color ?? 'TERRACOTTA').hex;
  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size, borderRadius, backgroundColor: withAlpha(hex, 0.16) }}
    >
      <ClayIcon name={icon ?? 'dumbbell'} size={Math.round(size * 0.46)} color={hex} />
    </View>
  );
}
