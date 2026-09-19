import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input } from 'heroui-native';
import { AppView } from '@/components/layout/AppView';
import { ModalHeader } from '@/components/layout/ModalHeader';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { usePeriodizationDesign } from './PeriodizationDesignContext';
import {
  newPhase,
  plannedWeeks,
  type PeriodizationPhase,
} from './periodizationDraft';

type PeriodizationEditorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PeriodizationEditor'
>;

type PhaseSummaryCardProps = {
  phase: PeriodizationPhase;
  position: number;
  onPress: () => void;
};

function PhaseSummaryCard({ phase, position, onPress }: PhaseSummaryCardProps) {
  const { t } = useTranslation();
  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-[22px] border border-border-hairline bg-surface-card p-4 active:bg-surface-sunk"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-moss">
          <Text className="text-[13px] font-black text-cream">
            {position + 1}
          </Text>
        </View>
        <View className="min-w-0 flex-1">
          <Text className="t-heading" numberOfLines={1}>
            {phase.name}
          </Text>
          <Text className="t-caption mt-1">
            {t('schedule.periodization.phaseSummary', {
              weeks: plannedWeeks(phase),
              workouts: phase.workouts.length,
            })}
          </Text>
        </View>
        <ClayIcon name="chevron" size={18} color={colors.muted} />
      </View>
    </Pressable>
  );
}

export function PeriodizationEditorScreen({
  navigation,
}: PeriodizationEditorScreenProps) {
  const { t } = useTranslation();
  const { draft, updateDraft, saveDraft, cancelDraft } =
    usePeriodizationDesign();
  const [error, setError] = useState<string | null>(null);

  if (!draft) {
    return null;
  }

  const close = () => {
    cancelDraft();
    navigation.goBack();
  };
  const save = () => {
    if (!saveDraft()) {
      setError(t('schedule.periodization.nameRequired'));
      return;
    }
    navigation.goBack();
  };
  const editPhase = (phaseId: string) =>
    navigation.navigate('PeriodizationPhaseEditor', { phaseId });
  const addPhase = () => {
    const phase = newPhase(draft.phases.length);
    updateDraft({ ...draft, phases: [...draft.phases, phase] });
    editPhase(phase.id);
  };

  return (
    <AppView edges={['top', 'bottom']}>
      <ModalHeader
        title={t('schedule.periodization.editorTitle')}
        rightLabel={t('common.save')}
        onLeftPress={close}
        onRightPress={save}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pb-10 pt-5"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1.5">
          <Input
            autoFocus={!draft.name}
            className="h-[54px] rounded-[18px] border-border-hairline bg-surface-card px-4 text-foreground"
            placeholder={t('schedule.periodization.namePlaceholder')}
            value={draft.name}
            onChangeText={name => {
              updateDraft({ ...draft, name });
              setError(null);
            }}
          />
          {error ? (
            <Text className="t-caption text-danger">{error}</Text>
          ) : null}
        </View>

        <View className="gap-3">
          <Text className="t-eyebrow">
            {t('schedule.periodization.phasesLabel')}
          </Text>
          {draft.phases.map((phase, index) => (
            <PhaseSummaryCard
              key={phase.id}
              phase={phase}
              position={index}
              onPress={() => editPhase(phase.id)}
            />
          ))}
        </View>

        <Button
          className="h-12 rounded-full border border-dashed border-accent"
          variant="ghost"
          feedbackVariant="scale"
          onPress={addPhase}
        >
          <ClayIcon name="plus" size={16} color={colors.accent} />
          <Button.Label>{t('schedule.periodization.addPhase')}</Button.Label>
        </Button>
      </ScrollView>
    </AppView>
  );
}
