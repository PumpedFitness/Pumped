import { useRef, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from 'expo-camera';
import { Button } from '@pumped/ui/clay/Button';
import { ClayIcon } from '@pumped/ui/icons/ClayIcon';
import { colors } from '@pumped/ui/theme/tokens';
import { shareCodeFromScan } from '../scanShareModel';

type ShareCameraViewProps = {
  onCode: (code: string) => void;
};

/** How long the "not a Pumped code" hint stays before the scanner retries it. */
const FOREIGN_CODE_COOLDOWN_MS = 2500;

type PermissionNoticeProps = {
  canAsk: boolean;
  onAllow: () => void;
};

function PermissionNotice({ canAsk, onAllow }: PermissionNoticeProps) {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      <ClayIcon name="search" size={26} color={colors.muted} />
      <Text className="t-heading text-center">
        {t('share.receive.scan.permissionTitle')}
      </Text>
      <Text className="t-caption text-center">
        {t('share.receive.scan.permissionBody')}
      </Text>
      <Button
        size="sm"
        variant="secondary"
        className="mt-2"
        onPress={canAsk ? onAllow : () => void Linking.openSettings()}
      >
        {canAsk
          ? t('share.receive.scan.allowCamera')
          : t('share.receive.scan.openSettings')}
      </Button>
    </View>
  );
}

/**
 * Square camera viewfinder that reports the first Pumped share code it sees.
 * Foreign QR codes get a short hint; the same code is never reported twice.
 */
export function ShareCameraView({ onCode }: ShareCameraViewProps) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [foreignHint, setForeignHint] = useState(false);
  const handled = useRef(false);
  const ignoredUntil = useRef(0);

  const handleScan = ({ data }: BarcodeScanningResult) => {
    if (handled.current || Date.now() < ignoredUntil.current) return;
    const code = shareCodeFromScan(data);
    if (code === null) {
      ignoredUntil.current = Date.now() + FOREIGN_CODE_COOLDOWN_MS;
      setForeignHint(true);
      return;
    }
    handled.current = true;
    onCode(code);
  };

  return (
    <View className="gap-3">
      <View className="aspect-square overflow-hidden rounded-[28px] bg-surface-card">
        {permission?.granted ? (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleScan}
          />
        ) : permission ? (
          <PermissionNotice
            canAsk={permission.canAskAgain}
            onAllow={() => void requestPermission()}
          />
        ) : null}
      </View>
      <Text className="t-caption text-center">
        {foreignHint
          ? t('share.receive.scan.notPumped')
          : t('share.receive.scan.hint')}
      </Text>
    </View>
  );
}
