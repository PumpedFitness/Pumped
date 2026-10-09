import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '@/components/layout/AppView';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { ManualCodeEntry } from './components/ManualCodeEntry';
import { ShareCameraView } from './components/ShareCameraView';

type ScanShareScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ScanShare'
>;

export function ScanShareScreen({ navigation }: ScanShareScreenProps) {
  const { t } = useTranslation();
  const open = (code: string) => navigation.replace('ReceiveShare', { code });

  return (
    <AppView edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('share.receive.scan.title')}
        onBack={() => navigation.goBack()}
        backAccessibilityLabel={t('share.receive.scan.backA11y')}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="gap-8 px-5 pb-8 pt-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ShareCameraView onCode={open} />
          <ManualCodeEntry onCode={open} />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppView>
  );
}
