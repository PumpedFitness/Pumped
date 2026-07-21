import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { Button } from '@/components/clay/Button';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { widgetRegistry } from '@/components/widgets/registry';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { colors } from '@/theme/tokens';
import type { WidgetType } from '@/types/widget';

const PREVIEW_WIDTH_BY_SPAN = { 1: 108, 2: 228, 3: 348 } as const;
const PREVIEW_SCALE_BY_SPAN = { 1: 0.7, 2: 0.52, 3: 0.36 } as const;

type WidgetVariantPreviewProps = { type: WidgetType };

function WidgetVariantPreview({ type }: WidgetVariantPreviewProps) {
  const { component: Component, meta } = widgetRegistry[type];
  const colSpan = meta.colSpan as keyof typeof PREVIEW_WIDTH_BY_SPAN;
  const width = PREVIEW_WIDTH_BY_SPAN[colSpan];
  const scale = PREVIEW_SCALE_BY_SPAN[colSpan];

  return (
    <View pointerEvents="none" className="h-[82px] w-[126px] overflow-hidden">
      <View
        style={{
          width,
          transform: [{ scale }],
          transformOrigin: 'top left',
        }}
      >
        <Component colSpan={colSpan} width={width} />
      </View>
    </View>
  );
}

type WidgetGroupCardProps = {
  variants: WidgetType[];
  placedTypes: ReadonlySet<WidgetType>;
};

export function WidgetGroupCard({
  variants,
  placedTypes,
}: WidgetGroupCardProps) {
  const { t } = useTranslation();
  const addWidget = useHomescreenStore(state => state.addWidget);
  const groupMeta = widgetRegistry[variants[0]].meta;

  return (
    <Card variant="card" radius="2xl" pad={0} className="mb-2 overflow-hidden">
      <View className="flex-row items-center gap-2.5 px-3.5 pb-1 pt-3">
        <View className="h-8 w-8 items-center justify-center rounded-[10px] bg-accent-soft">
          <ClayIcon name={groupMeta.icon} size={17} color={colors.accent} />
        </View>
        <Text className="text-[16px] font-bold text-foreground">
          {t(groupMeta.nameKey)}
        </Text>
      </View>

      {variants.map((type, index) => {
        const meta = widgetRegistry[type].meta;
        const placed = placedTypes.has(type);
        const sizeLabel =
          meta.colSpan === 1
            ? t('widgetPicker.compact')
            : meta.colSpan === 2
            ? t('widgetPicker.wide')
            : t('widgetPicker.fullWidth');
        return (
          <View
            key={type}
            className={`flex-row items-center gap-2.5 px-3.5 py-2.5 ${
              index > 0 ? 'border-t border-border-hairline' : ''
            }`}
          >
            <WidgetVariantPreview type={type} />
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-foreground">
                {sizeLabel}
              </Text>
              <Text className="text-[11px] text-muted">
                {t('widgetPicker.columnsOf3', { count: meta.colSpan })}
              </Text>
            </View>
            <Button
              variant={placed ? 'ghost' : 'secondary'}
              size="sm"
              disabled={placed}
              onPress={() => addWidget(type)}
            >
              {placed ? t('widgetPicker.added') : t('common.add')}
            </Button>
          </View>
        );
      })}
    </Card>
  );
}
