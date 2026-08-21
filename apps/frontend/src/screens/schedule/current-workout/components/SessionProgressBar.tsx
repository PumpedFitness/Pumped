import { View } from 'react-native';
import { colors } from '@pumped/ui/theme/tokens';
import { alpha } from '@pumped/ui/theme/palette';

type SessionProgressBarProps = {
  completedSets: number;
  totalSets: number;
  percentage: number;
};

// Past this many sets the ticks are thinner than the gaps between them and stop
// reading as anything, so the bar goes continuous instead.
const MAX_TICKS = 24;

/**
 * Workout progress as one tick per set rather than a single filled rail.
 *
 * A percentage bar answers "how far", which you can already read off the number
 * next to it. The ticks answer "how many are left", which is the question you
 * actually ask mid-session — and they give the header something to be.
 */
export function SessionProgressBar({
  completedSets,
  totalSets,
  percentage,
}: SessionProgressBarProps) {
  if (totalSets === 0) {
    return <View className="mt-2 h-1.5 rounded-full bg-surface-sunk" />;
  }

  if (totalSets > MAX_TICKS) {
    return (
      <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-sunk">
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${percentage}%` }}
        />
      </View>
    );
  }

  return (
    <View className="mt-2 h-1.5 flex-row gap-[3px]">
      {Array.from({ length: totalSets }, (_, index) => (
        <View
          key={index}
          className="h-full flex-1 rounded-full"
          style={{ backgroundColor: tickColor(index, completedSets) }}
        />
      ))}
    </View>
  );
}

// The set you are about to log is half-lit, so the bar shows where you are and
// not only what you have banked.
function tickColor(index: number, completedSets: number): string {
  if (index < completedSets) {
    return colors.accent;
  }
  return index === completedSets ? alpha(colors.accent, 0.3) : colors.cardSunk;
}
