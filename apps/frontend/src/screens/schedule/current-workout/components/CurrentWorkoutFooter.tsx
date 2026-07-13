import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { useCurrentWorkout } from '@/hooks/useCurrentWorkout';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { colors } from '@/theme/tokens';
import { OptionPopup, type PopupOption } from '@/components/clay/option-popup';
import { ConfirmationActions } from '@/components/clay/option-popup/OptionPopupActions';
import { OptionPopupFrame } from '@/components/clay/option-popup/OptionPopupFrame';
import { ClayIcon } from '@/components/icons/ClayIcon';

type CurrentWorkoutNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'CurrentWorkout'
>;
type FinishWorkout = ReturnType<typeof useCurrentWorkout>['finishWorkout'];
type TemplateFinishChoice = 'keep' | 'update';

function completeWorkout(
  t: TFunction,
  navigation: CurrentWorkoutNavigation,
  finishWorkout: FinishWorkout,
  updateTemplate = false,
) {
  try {
    finishWorkout({ updateTemplate });
    navigation.goBack();
  } catch (error) {
    Alert.alert(
      t('currentWorkout.alerts.finishFailedTitle'),
      error instanceof Error ? error.message : t('common.tryAgain'),
    );
  }
}

type DiscardWorkoutPopupProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DiscardWorkoutPopup({
  visible,
  onClose,
  onConfirm,
}: DiscardWorkoutPopupProps) {
  const { t } = useTranslation();

  return (
    <OptionPopupFrame
      visible={visible}
      title={t('currentWorkout.alerts.discardTitle')}
      text={t('currentWorkout.alerts.discardBody')}
      footer={
        <ConfirmationActions
          confirmLabel={t('currentWorkout.alerts.discard')}
          disabled={false}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      }
      onClose={onClose}
    >
      {null}
    </OptionPopupFrame>
  );
}

type CurrentWorkoutFooterProps = {
  canFinish: boolean;
  shouldPromptForTemplate: boolean;
  navigation: CurrentWorkoutNavigation;
  finishWorkout: FinishWorkout;
  discardWorkout: () => void;
};

export function CurrentWorkoutFooter({
  canFinish,
  shouldPromptForTemplate,
  navigation,
  finishWorkout,
  discardWorkout,
}: CurrentWorkoutFooterProps) {
  const { t } = useTranslation();
  const [templatePopupVisible, setTemplatePopupVisible] = useState(false);
  const [discardPopupVisible, setDiscardPopupVisible] = useState(false);

  const templateFinishOptions: PopupOption<TemplateFinishChoice>[] = [
    {
      value: 'keep',
      label: t('currentWorkout.templatePopup.keep'),
      description: t('currentWorkout.templatePopup.keepDescription'),
    },
    {
      value: 'update',
      label: t('currentWorkout.templatePopup.update'),
      description: t('currentWorkout.templatePopup.updateDescription'),
    },
  ];

  const requestFinish = () => {
    if (!canFinish) {
      return;
    }
    if (shouldPromptForTemplate) {
      setTemplatePopupVisible(true);
      return;
    }
    completeWorkout(t, navigation, finishWorkout);
  };

  const finishWithTemplateChoice = (choice: TemplateFinishChoice) => {
    completeWorkout(t, navigation, finishWorkout, choice === 'update');
  };

  const confirmDiscard = () => {
    discardWorkout();
    navigation.goBack();
  };

  return (
    <>
      <View className="flex-row gap-3 border-t border-border-soft bg-background px-5 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('currentWorkout.discardA11y')}
          className="h-12 flex-row items-center justify-center gap-2 rounded-full border border-border-hairline bg-surface-card px-5 active:bg-surface-sunk"
          onPress={() => setDiscardPopupVisible(true)}
        >
          <ClayIcon name="x" size={17} color={colors.accent} />
          <Text className="t-label text-accent">{t('common.cancel')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('currentWorkout.finishA11y')}
          accessibilityState={{ disabled: !canFinish }}
          disabled={!canFinish}
          className={`h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full ${
            canFinish ? 'bg-foreground' : 'bg-surface-sunk'
          }`}
          onPress={requestFinish}
        >
          <ClayIcon
            name="check"
            size={18}
            color={canFinish ? colors.cream : colors.muted}
          />
          <Text
            className={`t-label ${canFinish ? 'text-cream' : 'text-muted'}`}
          >
            {t('currentWorkout.finish')}
          </Text>
        </Pressable>
      </View>

      <OptionPopup
        needsConfirmation
        visible={templatePopupVisible}
        title={t('currentWorkout.templatePopup.title')}
        text={t('currentWorkout.templatePopup.text')}
        options={templateFinishOptions}
        onClose={() => setTemplatePopupVisible(false)}
        onSelect={finishWithTemplateChoice}
      />
      <DiscardWorkoutPopup
        visible={discardPopupVisible}
        onClose={() => setDiscardPopupVisible(false)}
        onConfirm={confirmDiscard}
      />
    </>
  );
}
