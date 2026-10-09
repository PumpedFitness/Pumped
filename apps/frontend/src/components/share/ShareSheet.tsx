import { ActivityIndicator, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from 'heroui-native';
import { AppBottomSheet } from '@pumped/ui/forms/AppBottomSheet';
import { Button } from '@pumped/ui/clay/Button';
import { colors } from '@pumped/ui/theme/tokens';
import type { ShareEnvelope } from '@/lib/share/shareTypes';
import { ShareCodePanel } from './ShareCodePanel';
import { useShareUpload, type ShareUploadErrorKind } from './useShareUpload';

type ShareSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** What is being shared, e.g. the template's name. */
  title: string;
  /** The kind of thing, e.g. "Workout template". */
  kindLabel: string;
  buildEnvelope: () => ShareEnvelope;
};

type ShareSheetErrorProps = {
  error: ShareUploadErrorKind;
  onRetry: () => void;
};

/** Fixed height for the body so the sheet doesn't jump between states. */
const BODY_MIN_HEIGHT = 330;

function ShareSheetError({ error, onRetry }: ShareSheetErrorProps) {
  const { t } = useTranslation();

  return (
    <View className="items-center justify-center gap-4" style={{ flex: 1 }}>
      <Text className="text-center text-[16px] font-[700] text-foreground">
        {t('share.send.errorTitle')}
      </Text>
      <Text className="px-4 text-center text-[13px] leading-[18px] text-muted">
        {t(`share.send.errors.${error}`)}
      </Text>
      {error === 'build' ? null : (
        <Button size="md" variant="ghost" onPress={onRetry}>
          {t('share.send.retry')}
        </Button>
      )}
    </View>
  );
}

/**
 * Shares an item through the handover service as a QR code.
 *
 * Keep it mounted and toggle `visible` — the sheet library only presents
 * reliably when it was laid out before opening. Opening uploads once; closing
 * discards the code (it simply expires on the service).
 */
export function ShareSheet({
  visible,
  onClose,
  title,
  kindLabel,
  buildEnvelope,
}: ShareSheetProps) {
  const { t } = useTranslation();
  const { state, retry } = useShareUpload(visible, buildEnvelope);

  return (
    <AppBottomSheet open={visible} onClose={onClose}>
      <BottomSheet.Overlay />
      <AppBottomSheet.Content backgroundClassName="bg-background">
        <View className="items-center">
          <Text className="text-[11px] font-[700] uppercase tracking-[1.2px] text-muted">
            {kindLabel}
          </Text>
          <BottomSheet.Title
            className="mt-1 text-center text-[21px] font-bold text-foreground"
            numberOfLines={2}
          >
            {title}
          </BottomSheet.Title>
        </View>

        <View className="mt-5" style={{ minHeight: BODY_MIN_HEIGHT }}>
          {state.status === 'ready' ? (
            <ShareCodePanel share={state.share} onRenew={retry} />
          ) : state.status === 'error' ? (
            <ShareSheetError error={state.error} onRetry={retry} />
          ) : (
            <View
              className="items-center justify-center gap-3"
              style={{ flex: 1 }}
            >
              <ActivityIndicator color={colors.muted} />
              <Text className="text-[13px] text-muted">
                {t('share.send.creating')}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-3">
          <Button size="md" variant="ghost" block onPress={onClose}>
            {t('share.send.done')}
          </Button>
        </View>
      </AppBottomSheet.Content>
    </AppBottomSheet>
  );
}
