import { Text, View } from 'react-native';
import { Badge, RingGauge, colors } from '@pumped/ui';
import { ModuleLabelRow } from '../ModuleShell';

type ReadinessModuleProps = {
  label: string;
  emptyTitle: string;
  emptyBody: string;
};

/**
 * Readiness module (span 2). HRV / ACWR aren't tracked yet, so this renders a
 * graceful empty state: a muted ring at 0 with a "No readiness data" message,
 * keeping the layout the real metric will occupy. README §1.
 */
export function ReadinessModule({
  label,
  emptyTitle,
  emptyBody,
}: ReadinessModuleProps) {
  return (
    <View className="flex-row items-center gap-[16px]">
      <RingGauge
        value={0}
        size={76}
        thickness={9}
        trackColor={colors.track}
        fillColor={colors.accent}
        centerColor={colors.card}
      >
        <Text className="text-[19px] font-[800] text-muted">—</Text>
      </RingGauge>

      <View className="flex-1 gap-[6px]">
        <ModuleLabelRow label={label} right={<Badge tone="accent">ƒx</Badge>} />
        <Text className="text-[17px] font-[700] leading-[1.3] text-foreground">
          {emptyTitle}
        </Text>
        <Text className="text-[12px] font-[500] leading-[1.45] text-muted">
          {emptyBody}
        </Text>
      </View>
    </View>
  );
}
