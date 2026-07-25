import { Image, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BodyPartHighlighter } from '@/components/body';
import { formatShortDate } from './exerciseFormat';
import {
  EXERCISE_BODY_PALETTE,
  buildBodyHighlights,
} from './exerciseBodyHighlights';

type SummaryTabProps = {
  picture: string | null;
  description: string | null;
  howTo: string | null;
  createdAt: number | undefined;
  typeName: string | null;
  muscleGroupNames: string[];
};

type MetaChipProps = {
  label: string;
  value: string;
};

function MetaChip({ label, value }: MetaChipProps) {
  return (
    <View className="flex-1 rounded-[16px] border border-border-hairline bg-surface-card px-3 py-[11px]">
      <Text className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted">
        {label}
      </Text>
      <Text className="mt-[3px] text-[13.5px] font-semibold text-foreground">
        {value}
      </Text>
    </View>
  );
}

type SummaryMediaProps = {
  picture: string | null;
  muscleGroupNames: string[];
};

function SummaryMedia({ picture, muscleGroupNames }: SummaryMediaProps) {
  const { t } = useTranslation();
  const highlights = buildBodyHighlights(muscleGroupNames);

  return (
    <View className="h-[210px] overflow-hidden rounded-[22px] bg-moss">
      {picture ? (
        <Image
          source={{ uri: picture }}
          className="h-full w-full"
          resizeMode="cover"
        />
      ) : highlights.length > 0 ? (
        <View className="h-full w-full flex-row items-center justify-center gap-4">
          {(['front', 'back'] as const).map(view => (
            <BodyPartHighlighter
              key={view}
              border="rgba(243, 238, 226, 0.36)"
              defaultFill="rgba(243, 238, 226, 0.10)"
              defaultStroke="rgba(243, 238, 226, 0.18)"
              highlights={highlights}
              palette={EXERCISE_BODY_PALETTE}
              scale={0.42}
              view={view}
            />
          ))}
        </View>
      ) : (
        <View className="h-full w-full items-center justify-center px-4">
          <Text className="text-center text-[12.5px] text-[rgba(243,238,226,0.7)]">
            {t('exerciseOverview.noMuscleGroups')}
          </Text>
        </View>
      )}
    </View>
  );
}

type SummaryTextCardProps = {
  title: string;
  body: string;
};

function SummaryTextCard({ title, body }: SummaryTextCardProps) {
  return (
    <View className="rounded-[20px] border border-border-hairline bg-surface-card p-4">
      <Text className="text-[13.5px] font-bold text-foreground">{title}</Text>
      <Text className="mt-2 text-[13.5px] leading-[20px] text-text-secondary">
        {body}
      </Text>
    </View>
  );
}

export function SummaryTab({
  picture,
  description,
  howTo,
  createdAt,
  typeName,
  muscleGroupNames,
}: SummaryTabProps) {
  const { t, i18n } = useTranslation();

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-[14px] px-4 pb-7 pt-1"
      showsVerticalScrollIndicator={false}
    >
      <SummaryMedia picture={picture} muscleGroupNames={muscleGroupNames} />

      <View className="flex-row gap-2">
        <MetaChip
          label={t('exerciseOverview.summary.type')}
          value={typeName ?? t('exerciseOverview.noType')}
        />
        <MetaChip
          label={t('exerciseOverview.summary.created')}
          value={
            createdAt != null
              ? formatShortDate(createdAt, i18n.language)
              : t('common.notAvailable')
          }
        />
      </View>

      <SummaryTextCard
        title={t('exerciseOverview.summary.about')}
        body={
          description?.trim() || t('exerciseOverview.details.emptyDescription')
        }
      />

      <SummaryTextCard
        title={t('exerciseOverview.summary.howTo')}
        body={howTo?.trim() || t('exerciseOverview.summary.howToEmpty')}
      />
    </ScrollView>
  );
}
