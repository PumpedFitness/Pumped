import { View, Text, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { Button } from '@/components/clay/Button';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { widgetRegistry } from '@/components/widgets/registry';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { colors } from '@/theme/tokens';
import type { WidgetType } from '@/types/widget';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_GUTTER = 20;
const PREVIEW_GAP = 12;

// Compute preview width for a given colSpan
function previewWidth(colSpan: number): number {
  const available = SCREEN_WIDTH - 2 * PREVIEW_GUTTER;
  const unit = (available - 2 * PREVIEW_GAP) / 3;
  return colSpan * unit + (colSpan - 1) * PREVIEW_GAP;
}

type WidgetPickerCardProps = {
  type: WidgetType;
  isPlaced: boolean;
};

export function WidgetPickerCard({ type, isPlaced }: WidgetPickerCardProps) {
  const { t } = useTranslation();
  const addWidget = useHomescreenStore(s => s.addWidget);
  const entry = widgetRegistry[type];

  if (!entry) return null;

  const { meta, component: WidgetComponent } = entry;
  const span = meta.defaultSpan;
  const width = previewWidth(span);

  return (
    <Card variant="card" radius="2xl" pad={0} className="mb-4">
      {/* Widget info header */}
      <View className="flex-row items-center p-4 pb-3 gap-3">
        <View className="w-10 h-10 rounded-xl bg-accent-soft items-center justify-center">
          <ClayIcon name={meta.icon} size={20} color={colors.accent} />
        </View>
        <View className="flex-1">
          <Text className="text-[17px] font-bold text-foreground">
            {t(meta.nameKey)}
          </Text>
          <Text className="text-[12.5px] text-muted mt-[1px]">
            {span === 3
              ? t('widgetPicker.fullWidth')
              : t('widgetPicker.columnsOf3', { count: span })}
          </Text>
        </View>
      </View>

      <View className="items-center px-4 pb-1">
        <View
          className="scale-[0.85] origin-top"
          style={{
            width,
            maxWidth: SCREEN_WIDTH - 2 * PREVIEW_GUTTER - 32,
          }}
        >
          <WidgetComponent colSpan={span} width={width} />
        </View>
      </View>

      {/* Add button */}
      <View className="p-4 pt-3">
        <Button
          variant={isPlaced ? 'ghost' : 'secondary'}
          size="sm"
          block
          disabled={isPlaced}
          icon={
            isPlaced ? undefined : (
              <ClayIcon name="plus" size={16} color={colors.cream} />
            )
          }
          onPress={() => {
            if (!isPlaced) {
              addWidget(type, span);
            }
          }}
        >
          {isPlaced
            ? t('widgetPicker.alreadyAdded')
            : t('widgetPicker.addWidget')}
        </Button>
      </View>
    </Card>
  );
}
