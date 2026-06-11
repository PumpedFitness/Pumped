import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '../clay/Button';
import { OptionPopup, type PopupOption } from '../clay/option-popup';

type TrainingGoal = 'strength' | 'muscle' | 'fitness';

const GOAL_OPTIONS: PopupOption<TrainingGoal>[] = [
  { value: 'strength', label: 'Build strength' },
  { value: 'muscle', label: 'Build muscle' },
  { value: 'fitness', label: 'Improve fitness' },
];

export function PopupTestButtons() {
  const [activePopup, setActivePopup] = useState<
    'instant' | 'confirmable' | null
  >(null);
  const [goal, setGoal] = useState<TrainingGoal>('strength');
  const selectedGoal =
    GOAL_OPTIONS.find(option => option.value === goal)?.label ?? '';

  return (
    <View className="mb-6 gap-3">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button block onPress={() => setActivePopup('instant')}>
            Instant popup
          </Button>
        </View>
        <View className="flex-1">
          <Button
            variant="secondary"
            block
            onPress={() => setActivePopup('confirmable')}
          >
            Confirm popup
          </Button>
        </View>
      </View>
      <Text className="t-caption text-center">Selected: {selectedGoal}</Text>

      <OptionPopup
        visible={activePopup === 'instant'}
        title="Instant selection"
        text="Selecting an option applies it immediately."
        options={GOAL_OPTIONS}
        selectedValue={goal}
        onClose={() => setActivePopup(null)}
        onSelect={setGoal}
      />
      <OptionPopup
        needsConfirmation
        visible={activePopup === 'confirmable'}
        title="Confirmed selection"
        text="Select an option, then confirm your choice."
        options={GOAL_OPTIONS}
        selectedValue={goal}
        onClose={() => setActivePopup(null)}
        onSelect={setGoal}
      />
    </View>
  );
}
