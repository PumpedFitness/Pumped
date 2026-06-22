import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { colors, motion } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { SetCard } from './SetCard';
import type { SetCardModel } from './exerciseSetTableModel';

type AddSetButtonProps = {
  label: string;
  icon: 'plus' | 'copy';
  onPress: () => void;
};

function AddSetButton({ label, icon, onPress }: AddSetButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-10 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-accent-soft px-3"
      onPress={onPress}
    >
      <ClayIcon name={icon} size={16} color={colors.accent} />
      <Text className="t-label text-accent">{label}</Text>
    </Pressable>
  );
}

type ExerciseSetTableContentProps = {
  cards: SetCardModel[];
  addSetLabel?: string;
  duplicateSetLabel?: string;
  onAddSet?: () => void;
  onDuplicateSet?: () => void;
  animateLayout?: boolean;
};

// The set-type / wheel / range sheets are NOT here — they live once per screen
// in <SetSheetHost>, and cards open them via the useSetSheetOpeners() context.
export function ExerciseSetTableContent({
  cards,
  addSetLabel,
  duplicateSetLabel,
  onAddSet,
  onDuplicateSet,
  animateLayout = true,
}: ExerciseSetTableContentProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      {cards.map(card => (
        // Layout animation: a removed set fades out and the cards below slide up
        // smoothly. No `entering` — fading every card in on mount janks the
        // workout's first frame. `layout` is skipped where the table re-renders
        // mid-scroll (active workout), which otherwise makes cards fly in.
        <Animated.View
          key={card.key}
          layout={
            animateLayout ? LinearTransition.duration(motion.base) : undefined
          }
          exiting={FadeOut.duration(motion.fast)}
        >
          <SetCard card={card} />
        </Animated.View>
      ))}

      {onAddSet ? (
        <View className="mt-1 flex-row gap-2">
          <AddSetButton
            label={addSetLabel ?? t('setTable.addSet')}
            icon="plus"
            onPress={onAddSet}
          />
          {onDuplicateSet ? (
            <AddSetButton
              label={duplicateSetLabel ?? t('setTable.duplicateSet')}
              icon="copy"
              onPress={onDuplicateSet}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
