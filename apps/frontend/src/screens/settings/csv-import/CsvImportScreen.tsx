import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '@/components/layout/AppView';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/clay/Button';
import { Card } from '@/components/clay/Card';
import { ClayIcon } from '@/components/icons/ClayIcon';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import {
  CSV_IMPORT_ADAPTERS,
  importCSV,
} from '@/data/local/imports/csvImportService';
import { colors } from '@/theme/tokens';

type CsvImportScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CsvImport'
>;

export function CsvImportScreen({ navigation }: CsvImportScreenProps) {
  const { t } = useTranslation();
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (picked.canceled || !picked.assets?.[0]) {
        return;
      }

      const csv = await FileSystem.readAsStringAsync(picked.assets[0].uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const result = importCSV(csv, CSV_IMPORT_ADAPTERS.hevy);

      Alert.alert(
        t('csvImport.alerts.successTitle'),
        t('csvImport.alerts.successBody', result),
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert(
        t('csvImport.alerts.errorTitle'),
        error instanceof Error ? error.message : t('common.tryAgain'),
        [{ text: t('common.ok') }],
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AppView edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('csvImport.title')}
        onBack={() => navigation.goBack()}
        backAccessibilityLabel={t('csvImport.backA11y')}
      />

      <ScrollView
        contentContainerClassName="px-5 pb-8 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 gap-2">
          <Text className="t-title">{t('csvImport.heading')}</Text>
          <Text className="t-caption">{t('csvImport.body')}</Text>
        </View>

        <Card className="mb-6" pad={16}>
          <View className="flex-row items-center gap-[13px]">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
              <ClayIcon name="archive" size={19} color={colors.accent} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-foreground">
                {t('csvImport.hevy.name')}
              </Text>
              <Text className="t-caption mt-1">
                {t('csvImport.hevy.description')}
              </Text>
            </View>
          </View>
        </Card>

        <Button
          block
          disabled={isImporting}
          icon={<ClayIcon name="arrowUp" size={18} color={colors.accentInk} />}
          onPress={() => void handleImport()}
        >
          {isImporting ? t('csvImport.importing') : t('csvImport.selectCsv')}
        </Button>
      </ScrollView>
    </AppView>
  );
}
