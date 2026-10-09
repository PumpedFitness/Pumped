import { Share, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import QRCode from 'react-native-qrcode-svg';
import { Button } from '@pumped/ui/clay/Button';
import { colors } from '@pumped/ui/theme/tokens';
import type { UploadedShare } from '@/lib/share/handoverClient';
import { shareLinkFor } from '@/lib/share/shareLink';
import { useSecondsLeft } from './useShareUpload';

const QR_SIZE = 196;

type ShareCodePanelProps = {
  share: UploadedShare;
  onRenew: () => void;
};

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

/** The QR code for a live share, its countdown and the link fallback. */
export function ShareCodePanel({ share, onRenew }: ShareCodePanelProps) {
  const { t } = useTranslation();
  const secondsLeft = useSecondsLeft(share.expiresAt) ?? 0;
  const link = shareLinkFor(share.id);
  const expired = secondsLeft === 0;

  return (
    <View className="items-center">
      <View
        className="items-center justify-center rounded-[24px] border border-border-hairline bg-surface-card p-4"
        style={{ opacity: expired ? 0.25 : 1 }}
      >
        <QRCode
          value={link}
          size={QR_SIZE}
          color={colors.ink}
          backgroundColor={colors.card}
          ecl="M"
        />
      </View>

      {expired ? (
        <>
          <Text className="mt-4 text-center text-[13px] text-muted">
            {t('share.send.expired')}
          </Text>
          <View className="mt-4 w-full">
            <Button size="md" block onPress={onRenew}>
              {t('share.send.renew')}
            </Button>
          </View>
        </>
      ) : (
        <>
          <Text className="mt-4 text-center text-[13px] leading-[18px] text-muted">
            {t('share.send.instructions')}
          </Text>
          <Text className="mt-1.5 text-center text-[12px] font-[600] text-muted">
            {t('share.send.expiresIn', {
              time: formatCountdown(secondsLeft),
            })}
          </Text>
          <View className="mt-4 w-full">
            <Button
              size="md"
              variant="ghost"
              block
              onPress={() => void Share.share({ message: link })}
            >
              {t('share.send.shareLink')}
            </Button>
          </View>
        </>
      )}
    </View>
  );
}
