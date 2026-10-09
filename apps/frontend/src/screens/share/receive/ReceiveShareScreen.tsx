import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@pumped/ui/clay/Button';
import { colors } from '@pumped/ui/theme/tokens';
import { AppView } from '@/components/layout/AppView';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import {
  importShare,
  type ShareImportResult,
} from '@/data/local/share/importShare';
import type { SharePayload } from '@/lib/share/shareTypes';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { ImportSummary } from './components/ImportSummary';
import { ReceiveShareError } from './components/ReceiveShareError';
import { SharePreview } from './components/SharePreview';
import { safePreview } from './receiveShareModel';
import { useReceivedShare } from './useReceivedShare';

type ReceiveShareScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ReceiveShare'
>;

type TargetRoute =
  | { name: 'WorkoutTemplateEditor'; params: { templateId: string } }
  | { name: 'EditExercise'; params: { exerciseId: string } }
  | { name: 'SetTypeEditor'; params: { setTypeId: string } };

type ReceiveFooterProps = {
  payload: SharePayload;
  onImport: () => void;
  onDone: () => void;
};

function targetFor(result: ShareImportResult): TargetRoute {
  switch (result.kind) {
    case 'template':
      return {
        name: 'WorkoutTemplateEditor',
        params: { templateId: result.templateId },
      };
    case 'exercise':
      return {
        name: 'EditExercise',
        params: { exerciseId: result.exerciseId },
      };
    case 'setType':
      return { name: 'SetTypeEditor', params: { setTypeId: result.setTypeId } };
  }
}

function ReceiveFooter({ payload, onImport, onDone }: ReceiveFooterProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="border-t border-border-hairline bg-background px-5 pt-3"
      style={{ paddingBottom: Math.max(insets.bottom + 8, 20) }}
    >
      {payload.kind === 'achievement' ? (
        <Button size="lg" block variant="secondary" onPress={onDone}>
          {t('share.receive.actions.done')}
        </Button>
      ) : (
        <Button size="lg" block onPress={onImport}>
          {t(`share.receive.actions.${payload.kind}`)}
        </Button>
      )}
    </View>
  );
}

export function ReceiveShareScreen({
  navigation,
  route,
}: ReceiveShareScreenProps) {
  const { t, i18n } = useTranslation();
  const { state, retry } = useReceivedShare(route.params.code);

  // Opened from a link on a cold start, this screen is the only one in the
  // stack — leaving it must land on the tabs, not on nothing.
  const close = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const leaveTo = (target: TargetRoute) => {
    if (navigation.canGoBack()) {
      navigation.dispatch(StackActions.replace(target.name, target.params));
    } else {
      navigation.reset({ index: 1, routes: [{ name: 'Main' }, target] });
    }
  };

  const handleImport = (payload: SharePayload) => {
    try {
      leaveTo(targetFor(importShare(payload)));
    } catch {
      Alert.alert(
        t('share.receive.errors.importTitle'),
        t('share.receive.errors.importBody'),
      );
    }
  };

  return (
    <AppView edges={['top']}>
      <ScreenHeader
        title={t('share.receive.title')}
        onBack={close}
        backAccessibilityLabel={t('share.receive.backA11y')}
      />

      {state.status === 'loading' ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator color={colors.muted} />
          <Text className="t-caption">{t('share.receive.loading')}</Text>
        </View>
      ) : state.status === 'error' ? (
        <ReceiveShareError kind={state.kind} onRetry={retry} />
      ) : (
        <>
          <ScrollView
            className="flex-1"
            contentContainerClassName="gap-4 px-5 pb-8 pt-5"
            showsVerticalScrollIndicator={false}
          >
            <SharePreview payload={state.envelope.payload} />
            <ReceivedImportSummary payload={state.envelope.payload} />
            <Text className="t-caption text-center">
              {t('share.receive.sharedOn', {
                date: new Date(state.envelope.sharedAt).toLocaleDateString(
                  i18n.language,
                  { day: 'numeric', month: 'long' },
                ),
              })}
            </Text>
          </ScrollView>
          <ReceiveFooter
            payload={state.envelope.payload}
            onImport={() => handleImport(state.envelope.payload)}
            onDone={close}
          />
        </>
      )}
    </AppView>
  );
}

type ReceivedImportSummaryProps = {
  payload: SharePayload;
};

function ReceivedImportSummary({ payload }: ReceivedImportSummaryProps) {
  // A lone exercise or set type is itself the new item; the summary only adds
  // information for payloads that bring dependencies along.
  if (payload.kind !== 'template' && payload.kind !== 'workout') return null;
  const preview = safePreview(payload);
  return preview ? <ImportSummary preview={preview} /> : null;
}
