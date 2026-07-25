import { Text, View } from 'react-native';
import { Card, PlayCircle, colors, shadows } from '@pumped/ui';
import type { NextSession } from '../useHomeDashboardData';

type NextSessionCardProps = {
  session: NextSession;
  labelNext: string;
  metaLine: string;
  progressLabel: string;
  progressPercent: number;
  startA11y: string;
  onStart: () => void;
};

/**
 * Next-session hero card — label, focus + lift count, meta line, block-progress
 * track, and the accent play button that starts the session. README §1.3.
 */
export function NextSessionCard({
  session,
  labelNext,
  metaLine,
  progressLabel,
  progressPercent,
  startA11y,
  onStart,
}: NextSessionCardProps) {
  const pct = Math.max(0, Math.min(100, progressPercent));

  return (
    <Card radius="xl" pad={20} style={shadows.hero}>
      <View className="flex-row items-start">
        <View className="flex-1 pr-[12px]">
          <Text className="text-[12px] font-[600] text-muted">{labelNext}</Text>
          <Text className="mt-[9px] text-[19px] font-[700] leading-[1.25] text-foreground">
            {session.name}
          </Text>
          <Text className="mt-[9px] text-[13px] font-[500] leading-[1.4] text-muted">
            {metaLine}
          </Text>
        </View>

        <PlayCircle size={64} onPress={onStart} accessibilityLabel={startA11y} />
      </View>

      <View className="mt-[20px]">
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-[600] text-muted">
            {progressLabel}
          </Text>
          <Text className="text-[12px] font-[600] text-foreground">{pct}%</Text>
        </View>
        <View className="mt-[8px] h-[12px] overflow-hidden rounded-full bg-track">
          <View
            className="h-full rounded-full"
            style={{ width: `${pct}%`, backgroundColor: colors.ink }}
          />
        </View>
      </View>
    </Card>
  );
}
