import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  builtInSetFieldLabelKey,
  builtInSetTypeLabelKey,
} from '@/data/local/builtins';
import type { SharedSetType } from '@/lib/share/shareTypes';
import { PreviewSection } from './PreviewSection';
import { ShareHero } from './ShareHero';

type SetTypePreviewProps = {
  setType: SharedSetType;
};

export function SetTypePreview({ setType }: SetTypePreviewProps) {
  const { t } = useTranslation();
  // Built-ins travel with their English fallback name; show the localized one.
  const typeKey = builtInSetTypeLabelKey(setType.id);
  const fields = [...setType.fields].sort((a, b) => a.position - b.position);

  return (
    <View className="gap-4">
      <ShareHero
        eyebrow={t('share.receive.kinds.setType')}
        title={typeKey ? t(typeKey) : setType.name}
      />
      <PreviewSection title={t('share.receive.fields')}>
        {fields.length === 0 ? (
          <Text className="t-caption">{t('share.receive.noFields')}</Text>
        ) : (
          <View className="divide-y divide-border-hairline">
            {fields.map(field => {
              const fieldKey = builtInSetFieldLabelKey(field.id);
              return (
                <Text key={field.id} className="t-body py-2.5">
                  {fieldKey ? t(fieldKey) : field.name}
                </Text>
              );
            })}
          </View>
        )}
      </PreviewSection>
    </View>
  );
}
