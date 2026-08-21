import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '@pumped/ui/theme/tokens';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import type { UsageInfo, UsageKind } from '@/data/local/usageModel';

type UsageBadgeProps = {
  /** Undefined (or empty) renders nothing — the item is used by nobody. */
  usage: UsageInfo | undefined;
  kind: UsageKind;
  /**
   * Shows the bare reference count instead of the spelled-out label. Index
   * rows need it: a full label crowds the name out of its single line.
   */
  compact?: boolean;
};

// Marks a library item that something else still depends on. Accent + calendar
// means the active schedule would change if it were deleted; the muted variant
// just counts the records that reference it. The full sentence always reaches
// screen readers, whichever size is rendered.
export function UsageBadge({ usage, kind, compact = false }: UsageBadgeProps) {
  const { t } = useTranslation();
  if (!usage || usage.names.length === 0) {
    return null;
  }

  const activeSchedule = usage.activeScheduleName;
  const isActive = activeSchedule !== null;
  const count = usage.names.length;
  const label = isActive
    ? t('usage.badge.activePlan')
    : t(
        kind === 'template' ? 'usage.badge.schedules' : 'usage.badge.workouts',
        { count },
      );

  return (
    <View
      accessibilityLabel={
        activeSchedule
          ? t('usage.badge.activePlanA11y', { schedule: activeSchedule })
          : label
      }
      className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-1 ${
        isActive ? 'bg-accent-soft' : 'bg-surface-sunk'
      }`}
    >
      <ClayIcon
        // Schedules reference templates, workouts reference everything else.
        name={isActive || kind === 'template' ? 'calendar' : 'dumbbell'}
        size={12}
        color={isActive ? colors.accent : colors.ink2}
      />
      <Text
        className={`t-eyebrow ${isActive ? 'text-accent' : 'text-muted'}`}
        numberOfLines={1}
      >
        {compact ? count : label}
      </Text>
    </View>
  );
}
