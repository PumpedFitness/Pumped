import { Image, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { getWorkoutTemplateColor } from '@/components/workout/workoutTemplatePresentation';
import type {
  ScheduledTemplate,
  WeekDay,
} from '@/screens/schedule/components/scheduleWeekModel';

const MS_PER_DAY = 86_400_000;
const BLOCK_HEIGHT = 44;
const BLOCK_RADIUS = 14;
const GLYPH_SIZE = 19;
const OVERLAY_SIZE = 22;
const TODAY_BORDER = 2;

export type WeekBlocksTone = 'dark' | 'light';

type TonePalette = {
  label: string;
  labelToday: string;
  todayBorder: string;
  /** The surface the blocks sit on — corner badges cut into it. */
  surface: string;
  /** Fill/glyph for days with no workout of their own to show. */
  neutralFill: string;
  neutralGlyph: string;
  restBorder: string;
  onFilled: string;
  /** How strongly a planned day's colour tints its block. */
  tintAlpha: number;
  /**
   * How far a planned day's glyph is lifted toward cream. Workout colours are
   * muted earth tones — on the dark card they land within a few percent of the
   * surface and the glyph disappears, so there it gets lifted; on paper the
   * colour itself is the most legible ink available.
   */
  glyphLift: number;
};

// Cream is #F4F2EF, ink #1B1A18 — spelled out because the blocks need them at
// several opacities and the tokens only carry two of them.
const CREAM = (a: number) => `rgba(244, 242, 239, ${a})`;
const INK = (a: number) => `rgba(27, 26, 24, ${a})`;

const TONES: Record<WeekBlocksTone, TonePalette> = {
  dark: {
    label: CREAM(0.5),
    labelToday: colors.accentHover,
    todayBorder: colors.accentHover,
    surface: colors.moss,
    neutralFill: CREAM(0.08),
    neutralGlyph: CREAM(0.5),
    restBorder: CREAM(0.13),
    onFilled: colors.cream,
    tintAlpha: 0.3,
    glyphLift: 0.62,
  },
  light: {
    label: colors.muted,
    labelToday: colors.accentInk,
    todayBorder: colors.accent,
    surface: colors.card,
    neutralFill: INK(0.05),
    neutralGlyph: colors.muted,
    restBorder: colors.lineSoft,
    onFilled: colors.cream,
    tintAlpha: 0.22,
    glyphLift: 0,
  },
};

function channels(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

/** Hex → rgba, so a workout colour can tint a block without a second token. */
function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = channels(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Mixes a colour toward cream, keeping its hue but raising its luminance. */
function lift(hex: string, amount: number): string {
  if (amount <= 0) return hex;
  const [r, g, b] = channels(hex);
  const [cr, cg, cb] = channels(colors.cream);
  const mix = (from: number, to: number) =>
    Math.round(from + (to - from) * amount);
  return `rgb(${mix(r, cr)}, ${mix(g, cg)}, ${mix(b, cb)})`;
}

export type WeekProgressCounts = {
  /** Days already logged. */
  done: number;
  /** Days the schedule asks for — rest days excluded. */
  planned: number;
  /** Written off on purpose. */
  skipped: number;
  /** Past and simply never trained. */
  missed: number;
};

/** Done-of-planned for the week, with rest days left out of both sides. */
export function weekBlockProgress(days: WeekDay[]): WeekProgressCounts {
  return {
    done: days.filter(day => day.status === 'done').length,
    planned: days.filter(day => day.status !== 'rest').length,
    skipped: days.filter(day => day.status === 'skipped').length,
    missed: days.filter(day => day.status === 'missed').length,
  };
}

type BlockSkin = {
  fill: string;
  glyphColor: string;
  /** How far the workout's own mark recedes behind a verdict. */
  contentOpacity: number;
  /** The verdict laid over it, if the day already has one. */
  overlay: 'check' | 'skip' | null;
  overlayColor: string;
};

/**
 * A day's paint, built from the workout it holds rather than a fixed palette.
 *
 * Done means the block is *filled* with the workout's own colour and planned
 * means a tint of it, so a week fills in as it is worked through while every
 * block still says which workout it is. A settled day — trained or written off
 * — pushes that mark back and states the outcome over it: by then which
 * workout it was matters less than whether it happened.
 */
function blockSkin(
  status: WeekDay['status'],
  template: ScheduledTemplate | undefined,
  palette: TonePalette,
): BlockSkin {
  const hex = template
    ? getWorkoutTemplateColor(template.color).hex
    : colors.accent;

  // Deliberately skipped and simply missed look the same: from the week's
  // point of view both are a day that did not happen. They stay separate
  // states in the model so the schedule screen can word them differently.
  if (status === 'skipped' || status === 'missed') {
    return {
      fill: palette.neutralFill,
      glyphColor: palette.neutralGlyph,
      contentOpacity: 0.3,
      overlay: 'skip',
      overlayColor: palette.neutralGlyph,
    };
  }
  if (status === 'done') {
    return {
      fill: hex,
      glyphColor: palette.onFilled,
      contentOpacity: 0.32,
      overlay: 'check',
      overlayColor: palette.onFilled,
    };
  }
  return {
    fill: withAlpha(hex, palette.tintAlpha),
    glyphColor: lift(hex, palette.glyphLift),
    contentOpacity: 1,
    overlay: null,
    overlayColor: 'transparent',
  };
}

type CornerBadgeProps = {
  palette: TonePalette;
  position: 'top' | 'bottom';
  children: React.ReactNode;
};

function CornerBadge({ palette, position, children }: CornerBadgeProps) {
  return (
    <View
      className="absolute -right-1 h-[16px] min-w-[16px] items-center justify-center rounded-full px-[3px]"
      style={{
        [position === 'top' ? 'top' : 'bottom']: -4,
        backgroundColor: palette.neutralGlyph,
        borderWidth: 1.5,
        borderColor: palette.surface,
      }}
    >
      {children}
    </View>
  );
}

type DayBlockProps = {
  day: WeekDay;
  palette: TonePalette;
};

function DayBlock({ day, palette }: DayBlockProps) {
  const { t, i18n } = useTranslation();
  const template = day.templates[0];
  const extra = day.templates.length - 1;
  const skin = blockSkin(day.status, template, palette);
  // The day index is a local-midnight day count; rendering it back as a date
  // has to read the UTC fields or the label slips a day in western timezones.
  const date = new Date(day.dayIndex * MS_PER_DAY);
  const letter = date.toLocaleDateString(i18n.language, {
    weekday: 'narrow',
    timeZone: 'UTC',
  });
  // Only a genuine rest day empties out. A workout logged on an unplanned day
  // has no template to draw, but it is still a day that was trained — leaving
  // it blank would contradict the "done" count sitting right above the row.
  const rest = day.status === 'rest';
  const glyph = template?.icon ?? 'dumbbell';

  return (
    <View
      className="flex-1 items-center"
      accessible
      accessibilityLabel={`${date.toLocaleDateString(i18n.language, {
        weekday: 'long',
        timeZone: 'UTC',
      })} — ${template ? `${template.name}, ` : ''}${t(
        `schedule.weekBlocks.status.${day.status}`,
      )}`}
    >
      <Text
        className="mb-1.5 text-[10.5px] font-[700] uppercase tracking-[0.6px]"
        style={{ color: day.isToday ? palette.labelToday : palette.label }}
      >
        {letter}
      </Text>
      <View className="w-full">
        <View
          className="w-full items-center justify-center overflow-hidden"
          style={{
            height: BLOCK_HEIGHT,
            borderRadius: BLOCK_RADIUS,
            backgroundColor: rest ? 'transparent' : skin.fill,
            borderWidth: day.isToday ? TODAY_BORDER : 1,
            borderColor: day.isToday
              ? palette.todayBorder
              : rest
              ? palette.restBorder
              : 'transparent',
          }}
        >
          {rest ? null : (
            <View
              className="absolute inset-0 items-center justify-center"
              style={{ opacity: skin.contentOpacity }}
            >
              {template?.picture ? (
                <Image
                  source={{ uri: template.picture }}
                  resizeMode="cover"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <ClayIcon
                  name={glyph}
                  size={GLYPH_SIZE}
                  color={skin.glyphColor}
                />
              )}
            </View>
          )}
          {skin.overlay ? (
            <ClayIcon
              name={skin.overlay}
              size={OVERLAY_SIZE}
              color={skin.overlayColor}
              stroke={2.2}
            />
          ) : null}
        </View>

        {extra > 0 ? (
          <CornerBadge palette={palette} position="bottom">
            <Text
              className="text-[9px] font-[800] leading-[11px]"
              style={{ color: palette.surface }}
            >
              +{extra}
            </Text>
          </CornerBadge>
        ) : null}
      </View>
    </View>
  );
}

type WeekBlocksProps = {
  days: WeekDay[];
  /** `dark` for inverted surfaces (the home hero), `light` on paper. */
  tone?: WeekBlocksTone;
};

/**
 * The training week as seven blocks — how far along you are at a glance.
 *
 * Shared on purpose: the home hero widget and the schedule screen show the
 * exact same week, and two drawings of one week drift apart the moment a
 * status is added. Skipped days keep their block and get a badge rather than
 * disappearing — a skipped Tuesday is information, not an absence.
 */
export function WeekBlocks({ days, tone = 'light' }: WeekBlocksProps) {
  const palette = TONES[tone];
  return (
    <View className="flex-row" style={{ gap: 6 }}>
      {days.map(day => (
        <DayBlock key={day.dayIndex} day={day} palette={palette} />
      ))}
    </View>
  );
}
