import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { SwipeToDelete } from '../clay/SwipeToDelete';
import { ClayIcon } from '../icons/ClayIcon';

type ExerciseCardProps = {
  name: string;
  description: string;
  children: ReactNode;
  onRemove?: () => void;
};

export function ExerciseCard({
  name,
  description,
  children,
  onRemove,
}: ExerciseCardProps) {
  const content = (
    <View className="gap-4 rounded-[22px] border border-border-hairline bg-surface-card p-4">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-[13px] bg-accent-soft">
          <ClayIcon name="dumbbell" size={20} color={colors.accent} />
        </View>
        <View className="flex-1">
          <Text className="t-heading">{name}</Text>
          <Text className="t-caption mt-0.5">{description}</Text>
        </View>
      </View>

      {children}
    </View>
  );

  return onRemove ? (
    <SwipeToDelete onDelete={onRemove} borderRadius={22}>
      {content}
    </SwipeToDelete>
  ) : (
    content
  );
}
