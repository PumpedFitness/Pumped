import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ShareImportPreview } from '@/data/local/share/importShare';
import { PreviewSection } from './PreviewSection';

type ImportSummaryProps = {
  preview: ShareImportPreview;
};

type NameListProps = {
  label: string;
  names: readonly string[];
};

function NameList({ label, names }: NameListProps) {
  if (names.length === 0) return null;

  return (
    <View className="gap-1">
      <Text className="t-caption">{label}</Text>
      <Text className="t-body">{names.join(', ')}</Text>
    </View>
  );
}

/** What importing will add to the library, so nothing arrives unannounced. */
export function ImportSummary({ preview }: ImportSummaryProps) {
  const { t } = useTranslation();
  const nothingNew =
    preview.newExercises.length === 0 && preview.newSetTypes.length === 0;

  return (
    <PreviewSection title={t('share.receive.importSummary.title')}>
      {nothingNew ? (
        <Text className="t-caption">
          {t('share.receive.importSummary.allKnown')}
        </Text>
      ) : (
        <View className="gap-3">
          <NameList
            label={t('share.receive.importSummary.newExercises')}
            names={preview.newExercises}
          />
          <NameList
            label={t('share.receive.importSummary.newSetTypes')}
            names={preview.newSetTypes}
          />
        </View>
      )}
    </PreviewSection>
  );
}
