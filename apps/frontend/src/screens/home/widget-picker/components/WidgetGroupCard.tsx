import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/clay/Card';
import { Button } from '@/components/clay/Button';
import { ClayIcon } from '@/components/icons/ClayIcon';
import { widgetRegistry } from '@/components/widgets/registry';
import { useHomescreenStore } from '@/stores/homescreenStore';
import { colors } from '@/theme/tokens';
import type { WidgetType } from '@/types/widget';

type SizeIndicatorProps = { colSpan: number };

function SizeIndicator({ colSpan }: SizeIndicatorProps) {
  return (
    <View className="h-7 w-14 flex-row gap-1 rounded-lg bg-surface-sunk p-1">
      {Array.from({ length: 3 }, (_, column) => (
        <View
          key={column}
          className={`flex-1 rounded-[3px] ${
            column < colSpan ? 'bg-accent' : 'bg-border-soft'
          }`}
        />
      ))}
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
            <SizeIndicator colSpan={meta.colSpan} />
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
