import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { colors, motion } from '@/theme/tokens';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { SetCard } from './SetCard';
import type { SetCardModel, SetTypeOption } from './exerciseSetTableModel';

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
  setTypeOptions: SetTypeOption[];
  addSetLabel?: string;
  duplicateSetLabel?: string;
  onAddSet?: () => void;
  onDuplicateSet?: () => void;
  onCreateSetType?: (name: string) => string;
};

export function ExerciseSetTableContent({
  cards,
  setTypeOptions,
  addSetLabel,
  duplicateSetLabel,
  onAddSet,
  onDuplicateSet,
  onCreateSetType,
}: ExerciseSetTableContentProps) {
  const { t } = useTranslation();

  return (
    <View className="gap-3">
      {cards.map(card => (
        // Layout animation: a removed set fades out and the cards below slide up
        // smoothly instead of snapping into place.
        <Animated.View
          key={card.key}
          layout={LinearTransition.duration(motion.base)}
          entering={FadeIn.duration(motion.fast)}
          exiting={FadeOut.duration(motion.fast)}
        >
          <SetCard
            card={card}
            setTypeOptions={setTypeOptions}
            onCreateSetType={onCreateSetType}
          />
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
