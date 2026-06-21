import { useCallback, useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import Body, {
  type BodyPartStyles,
  type ExtendedBodyPart,
  type Slug,
} from 'react-native-body-highlighter';
import { colors } from '@/theme/tokens';

export type BodyHighlighterPart = Slug;
export type BodyHighlighterSide = 'left' | 'right';
export type BodyHighlighterView = 'front' | 'back';
export type BodyHighlighterGender = 'male' | 'female';

export type BodyPartHighlight = {
  part: BodyHighlighterPart;
  intensity?: number;
  side?: BodyHighlighterSide;
  color?: string;
  styles?: BodyPartStyles;
};

export type BodyPartPress = Omit<BodyPartHighlight, 'side'> & {
  side?: BodyHighlighterSide;
};

export type BodyPartHighlighterProps = {
  highlights: ReadonlyArray<BodyPartHighlight>;
  view?: BodyHighlighterView;
  gender?: BodyHighlighterGender;
  scale?: number;
  palette?: ReadonlyArray<string>;
  border?: string;
  defaultFill?: string;
  defaultStroke?: string;
  defaultStrokeWidth?: number;
  disabledParts?: ReadonlyArray<BodyHighlighterPart>;
  hiddenParts?: ReadonlyArray<BodyHighlighterPart>;
  onPartPress?: (part: BodyPartPress) => void;
  className?: string;
  style?: ViewStyle;
};

export const BODY_HIGHLIGHTER_PARTS = [
  'abs',
  'adductors',
  'ankles',
  'biceps',
  'calves',
  'chest',
  'deltoids',
  'feet',
  'forearm',
  'gluteal',
  'hamstring',
  'hands',
  'hair',
  'head',
  'knees',
  'lower-back',
  'neck',
  'obliques',
  'quadriceps',
  'tibialis',
  'trapezius',
  'triceps',
  'upper-back',
] as const satisfies ReadonlyArray<BodyHighlighterPart>;

export const BODY_HIGHLIGHTER_PALETTE = [
  '#DDB28E',
  colors.accent,
  '#A65F3F',
  colors.mossDeep,
] as const;

export const MUSCLE_GROUP_BODY_PARTS = {
  abs: ['abs', 'obliques'],
  back: ['upper-back', 'lower-back'],
  biceps: ['biceps'],
  calves: ['calves'],
  chest: ['chest'],
  forearms: ['forearm'],
  glutes: ['gluteal'],
  hamstrings: ['hamstring'],
  quads: ['quadriceps'],
  shoulders: ['deltoids'],
  traps: ['trapezius'],
  triceps: ['triceps'],
} as const satisfies Record<string, ReadonlyArray<BodyHighlighterPart>>;

export type MuscleGroupBodyPartKey = keyof typeof MUSCLE_GROUP_BODY_PARTS;

const MUSCLE_GROUP_LABELS = {
  abs: 'Abs',
  back: 'Back',
  biceps: 'Biceps',
  calves: 'Calves',
  chest: 'Chest',
  forearms: 'Forearms',
  glutes: 'Glutes',
  hamstrings: 'Hamstrings',
  quads: 'Quads',
  shoulders: 'Shoulders',
  traps: 'Traps',
  triceps: 'Triceps',
} as const satisfies Record<MuscleGroupBodyPartKey, string>;

export const BODY_HIGHLIGHTER_MUSCLE_GROUPS = Object.keys(
  MUSCLE_GROUP_BODY_PARTS,
).map(key => {
  const muscleGroupKey = key as MuscleGroupBodyPartKey;

  return {
    id: `default-mg-${muscleGroupKey}`,
    key: muscleGroupKey,
    name: MUSCLE_GROUP_LABELS[muscleGroupKey],
    bodyParts: MUSCLE_GROUP_BODY_PARTS[muscleGroupKey],
  };
}) satisfies ReadonlyArray<{
  id: string;
  key: MuscleGroupBodyPartKey;
  name: string;
  bodyParts: ReadonlyArray<BodyHighlighterPart>;
}>;

function normalizeIntensity(
  intensity: number | undefined,
  paletteSize: number,
): number | undefined {
  if (!intensity || intensity < 1 || paletteSize < 1) {
    return undefined;
  }

  return Math.min(Math.round(intensity), paletteSize);
}

export function BodyPartHighlighter({
  highlights,
  view = 'front',
  gender = 'male',
  scale = 1.35,
  palette = BODY_HIGHLIGHTER_PALETTE,
  border = colors.line,
  defaultFill = colors.cardSunk,
  defaultStroke = colors.line,
  defaultStrokeWidth = 1,
  disabledParts,
  hiddenParts,
  onPartPress,
  className = '',
  style,
}: BodyPartHighlighterProps) {
  const data = useMemo<ExtendedBodyPart[]>(
    () =>
      highlights.map(highlight => ({
        slug: highlight.part,
        intensity: normalizeIntensity(highlight.intensity, palette.length),
        side: highlight.side,
        color: highlight.color,
        styles: highlight.styles,
      })),
    [highlights, palette.length],
  );

  const handleBodyPartPress = useCallback(
    (bodyPart: ExtendedBodyPart, side?: BodyHighlighterSide) => {
      if (
        !bodyPart.slug ||
        !onPartPress ||
        disabledParts?.includes(bodyPart.slug)
      ) {
        return;
      }

      onPartPress({
        part: bodyPart.slug,
        intensity: bodyPart.intensity,
        side,
        color: bodyPart.color,
        styles: bodyPart.styles,
      });
    },
    [disabledParts, onPartPress],
  );

  const disabledBodyParts = useMemo(
    () => (disabledParts ? [...disabledParts] : undefined),
    [disabledParts],
  );
  const hiddenBodyParts = useMemo(
    () => (hiddenParts ? [...hiddenParts] : undefined),
    [hiddenParts],
  );

  return (
    <View className={`items-center justify-center ${className}`} style={style}>
      <Body
        border={border}
        colors={palette}
        data={data}
        defaultFill={defaultFill}
        defaultStroke={defaultStroke}
        defaultStrokeWidth={defaultStrokeWidth}
        disabledParts={disabledBodyParts}
        gender={gender}
        hiddenParts={hiddenBodyParts}
        onBodyPartPress={handleBodyPartPress}
        scale={scale}
        side={view}
      />
    </View>
  );
}
