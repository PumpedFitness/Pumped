import { Alert, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppView } from '@/components/layout/AppView';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/clay/Button';
import { Card } from '@/components/clay/Card';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { useTableQuery } from '@/data/local/tableVersions';
import { importBatches } from '@/data/local/schema';
import {
  listImportBatches,
  revertImport,
  type ImportBatch,
} from '@/data/local/imports/csvImportService';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { colors } from '@/theme/tokens';

type ImportHistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ImportHistory'
>;

type ImportBatchCardProps = {
  batch: ImportBatch;
  onRevert: (batch: ImportBatch) => void;
};

function formatImportDate(timestamp: number, language: string): string {
  return new Date(timestamp).toLocaleString(language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ImportBatchCard({ batch, onRevert }: ImportBatchCardProps) {
  const { t, i18n } = useTranslation();

  return (
    <Card pad={16}>
      <View className="flex-row items-start gap-[13px]">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
          <ClayIcon name="archive" size={19} color={colors.accent} />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-foreground">
            {t('importHistory.importNumber', { id: batch.id })}
          </Text>
          <Text className="t-caption mt-1">
            {formatImportDate(batch.importedAt, i18n.language)}
          </Text>
          <Text className="t-caption mt-3">
            {t('importHistory.summary', {
              workouts: batch.workoutsImported,
              sets: batch.setsImported,
              exercises: batch.exercisesCreated,
              skipped: batch.rowsSkipped,
            })}
          </Text>
        </View>
      </View>

      <Button
        className="mt-4"
        variant="ghost"
        size="sm"
        block
        onPress={() => onRevert(batch)}
      >
        {t('importHistory.revert')}
      </Button>
    </Card>
  );
}

export function ImportHistoryScreen({ navigation }: ImportHistoryScreenProps) {
  const { t } = useTranslation();
  const batches = useTableQuery([importBatches], listImportBatches);

  const handleRevert = (batch: ImportBatch) => {
    Alert.alert(
      t('importHistory.alerts.revertTitle', { id: batch.id }),
      t('importHistory.alerts.revertBody'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('importHistory.revert'),
          style: 'destructive',
          onPress: () => {
            revertImport(batch.id);
            Alert.alert(
              t('importHistory.alerts.revertedTitle'),
              t('importHistory.alerts.revertedBody', { id: batch.id }),
              [{ text: t('common.ok') }],
            );
          },
        },
      ],
    );
  };

  return (
    <AppView edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('importHistory.title')}
        onBack={() => navigation.goBack()}
        backAccessibilityLabel={t('importHistory.backA11y')}
      />

      <ScrollView
        contentContainerClassName="gap-4 px-5 pb-8 pt-5"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-2 gap-2">
          <Text className="t-title">{t('importHistory.heading')}</Text>
          <Text className="t-caption">{t('importHistory.body')}</Text>
        </View>

        {batches.length === 0 ? (
          <Card pad={18}>
            <Text className="text-[15px] font-semibold text-foreground">
              {t('importHistory.emptyTitle')}
            </Text>
            <Text className="t-caption mt-2">
              {t('importHistory.emptyBody')}
            </Text>
          </Card>
        ) : (
          batches.map(batch => (
            <ImportBatchCard
              key={batch.id}
              batch={batch}
              onRevert={handleRevert}
            />
          ))
        )}
      </ScrollView>
    </AppView>
  );
}
