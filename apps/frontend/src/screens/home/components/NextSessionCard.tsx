import { Text, View } from 'react-native';
import { Card, PlayCircle, colors, shadows } from '@pumped/ui';

type NextSessionCardProps = {
  focusLine: string | null;
  metaLine: string;
  progressLabel: string;
  progressCount: string | null;
  progressPercent: number;
  startA11y: string;
  onStart: () => void;
};

/**
 * Next-session hero card — focus, meta line, block-progress track, and the
 * accent play button that starts the session. README §1.3.
 *
 * The session name is intentionally absent: the display headline directly
 * above already renders it at 34px, and repeating it here was the single
 * biggest source of noise at the top of the screen.
 */
export function NextSessionCard({
  focusLine,
  metaLine,
  progressLabel,
  progressCount,
  progressPercent,
  startA11y,
  onStart,
}: NextSessionCardProps) {
  const pct = Math.max(0, Math.min(100, progressPercent));

  return (
    <Card radius="xl" pad={20} style={shadows.hero}>
      <View className="flex-row items-center">
        <View className="flex-1 pr-[12px]">
          {focusLine ? (
            <Text
              className="text-[15px] font-[700] leading-[1.3] text-foreground"
              numberOfLines={2}
            >
              {focusLine}
            </Text>
          ) : null}
          <Text
            className={`text-[13px] font-[500] leading-[1.4] text-muted ${
              focusLine ? 'mt-[6px]' : ''
            }`}
          >
            {metaLine}
          </Text>
        </View>

        <PlayCircle size={64} onPress={onStart} accessibilityLabel={startA11y} />
      </View>

      <View className="mt-[18px]">
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-[600] text-muted">
            {progressLabel}
          </Text>
          {progressCount ? (
            <Text className="text-[12px] font-[600] text-foreground">
              {progressCount}
            </Text>
          ) : null}
        </View>
        <View className="mt-[8px] h-[8px] overflow-hidden rounded-full bg-track">
          <View
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: colors.ink }}
          />
        </View>
      </View>
    </Card>
  );
}
