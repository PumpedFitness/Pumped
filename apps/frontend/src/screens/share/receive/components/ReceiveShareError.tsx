import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Button } from '@pumped/ui/clay/Button';
import { EmptyState } from '@pumped/ui/clay/EmptyState';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import type { ShareErrorKind } from '@/lib/share/handoverClient';
import { errorCopyKey } from '../receiveShareModel';

type ReceiveShareErrorProps = {
  kind: ShareErrorKind;
  onRetry: () => void;
};

export function ReceiveShareError({ kind, onRetry }: ReceiveShareErrorProps) {
  const { t } = useTranslation();
  const key = errorCopyKey(kind);
  // Retrying can't revive an expired or unreadable code.
  const canRetry = key === 'offline' || key === 'server';

  return (
    <View className="px-5 pt-8">
      <EmptyState
        icon={<ClayIcon name="warning" size={26} color={colors.muted} />}
        title={t(`share.receive.errors.${key}Title`)}
        body={t(`share.receive.errors.${key}Body`)}
        action={
          canRetry ? (
            <Button size="sm" variant="secondary" onPress={onRetry}>
              {t('share.receive.errors.retry')}
            </Button>
          ) : undefined
        }
      />
    </View>
  );
}
