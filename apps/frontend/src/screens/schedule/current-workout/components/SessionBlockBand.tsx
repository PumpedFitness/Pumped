import { Pressable, Text, View } from 'react-native';
import { colors, shadows } from '@pumped/ui/theme/tokens';
import { ClayIcon, type IconName } from '@pumped/ui/icons/ClayIcon';
import type { ExerciseSectionState } from '@/components/exercise/ExerciseSectionHeader';

type SessionBlockBandProps = {
  index: number;
  title: string;
  /** Small label above the title — what kind of block this is. */
  eyebrow?: string;
  eyebrowIcon?: IconName;
  /** Progress chip text; replaced by a check once the block is done. */
  statusLabel: string;
  state: ExerciseSectionState;
  onRemove?: () => void;
  removeAccessibilityLabel?: string;
};

// Chips on the terracotta band: a wash of the same cream the text is set in, so
// they read as recessed rather than as a second colour.
const ON_ACCENT_CHIP = 'rgba(244, 242, 239, 0.22)';

/**
 * The band that pins above a block's sets — one exercise or a whole superset.
 *
 * A floating, rounded card rather than a full-bleed slab: everything else on
 * this screen is a clay surface with a radius, and a square edge-to-edge bar
 * read as a system banner sitting on top of the app instead of part of it. The
 * wrapper stays opaque because the band is a sticky header — the sets have to
 * disappear behind it, not beside it.
 *
 * Active is always the app accent, never the workout's own colour: the template
 * colour marks the workout in the calendar and its library card, but while you
 * are training "active" has to mean one thing everywhere.
 */
export function SessionBlockBand({
  index,
  title,
  eyebrow,
  eyebrowIcon,
  statusLabel,
  state,
  onRemove,
  removeAccessibilityLabel,
}: SessionBlockBandProps) {
  const isActive = state === 'active';
  const isFinished = state === 'finished';
  // Only the active band inverts. The others keep ink titles: they are what you
  // are scrolling towards, and a muted title made the whole plan unreadable.
  const ink = isActive ? colors.cream : colors.ink;
  const meta = isActive ? colors.cream : colors.muted;

  const status = isFinished ? (
    <View className="h-6 w-6 items-center justify-center rounded-full bg-moss">
      <ClayIcon name="check" size={13} color={colors.cream} />
    </View>
  ) : (
    <View
      className="rounded-full px-2 py-1"
      style={{ backgroundColor: isActive ? ON_ACCENT_CHIP : colors.cardSunk }}
    >
      <Text
        className="text-[12px] font-bold tabular-nums"
        style={{ color: isActive ? colors.cream : colors.muted }}
      >
        {statusLabel}
      </Text>
    </View>
  );

  return (
    <View className="bg-background px-4 pb-2 pt-1.5">
      <View
        className="flex-row items-center gap-2.5 rounded-[22px] px-3 py-2.5"
        style={[
          {
            backgroundColor: isActive ? colors.accent : colors.card,
            borderWidth: 1,
            borderColor: isActive ? colors.accent : colors.line,
          },
          // Lift only what you are on, so the elevation itself points at it.
          // A neutral shadow, not the accent one — an orange halo under an
          // already-orange band read as glow rather than as depth.
          isActive ? shadows.row : null,
        ]}
      >
        <View
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: isActive ? colors.cream : colors.cardSunk }}
        >
          <Text
            className="text-[12px] font-bold tabular-nums"
            style={{ color: isActive ? colors.accent : colors.muted }}
          >
            {index + 1}
          </Text>
        </View>

        <View className="min-w-0 flex-1 gap-0.5">
          {/* With an eyebrow the status rides up beside it, so a two-exercise
              superset name gets the whole second line instead of truncating
              against a chip. */}
          {eyebrow ? (
            <View className="flex-row items-center gap-1">
              {eyebrowIcon ? (
                <ClayIcon name={eyebrowIcon} size={12} color={meta} />
              ) : null}
              <Text
                className="t-eyebrow min-w-0 shrink"
                numberOfLines={1}
                style={{ color: meta }}
              >
                {eyebrow}
              </Text>
              <View className="flex-1" />
              {status}
            </View>
          ) : null}
          <Text className="t-heading" numberOfLines={1} style={{ color: ink }}>
            {title}
          </Text>
        </View>

        {eyebrow ? null : status}

        {onRemove ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={removeAccessibilityLabel}
            hitSlop={6}
            className="h-8 w-8 items-center justify-center rounded-full"
            onPress={onRemove}
          >
            <ClayIcon name="trash" size={16} color={meta} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
