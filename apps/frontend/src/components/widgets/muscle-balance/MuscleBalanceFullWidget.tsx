import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  BodyPartHighlighter,
  MUSCLE_GROUP_BODY_PARTS,
  type BodyPartHighlight,
  type MuscleGroupBodyPartKey,
} from '@/components/body';
import { Card } from '@/components/clay/Card';
import { useHomeWidgetData } from '@/hooks/useHomeWidgetData';

type MuscleBalanceFullWidgetProps = { colSpan: number; width: number };

const NAME_KEYS = {
  Abs: 'abs',
  Back: 'back',
  Biceps: 'biceps',
  Calves: 'calves',
  Chest: 'chest',
  Forearms: 'forearms',
  Glutes: 'glutes',
  Hamstrings: 'hamstrings',
  Quads: 'quads',
  Shoulders: 'shoulders',
  Traps: 'traps',
  Triceps: 'triceps',
} as const satisfies Record<string, MuscleGroupBodyPartKey>;

function highlights(
  focus: Array<{ name: string; share: number }>,
): BodyPartHighlight[] {
  const parts = new Map<BodyPartHighlight['part'], number>();
  focus.forEach(item => {
    const key = NAME_KEYS[item.name as keyof typeof NAME_KEYS];
    if (!key) return;
    const intensity =
      item.share >= 0.3 ? 4 : item.share >= 0.2 ? 3 : item.share >= 0.1 ? 2 : 1;
    MUSCLE_GROUP_BODY_PARTS[key].forEach(part =>
      parts.set(part, Math.max(parts.get(part) ?? 0, intensity)),
    );
  });
  return [...parts].map(([part, intensity]) => ({ part, intensity }));
}

export function MuscleBalanceFullWidget(_props: MuscleBalanceFullWidgetProps) {
  const { t } = useTranslation();
  const focus = useHomeWidgetData().muscleFocus;
  const bodyHighlights = highlights(focus);

  return (
    <Card variant="raised" radius="xl" pad={18}>
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="t-eyebrow text-cream-dim">
            {t('widgets.muscleBalance.title')}
          </Text>
          <Text className="t-heading mt-1 text-cream">
            {focus[0]?.name ?? t('widgets.muscleBalance.empty')}
          </Text>
          <Text className="t-caption mt-1 text-cream-dim">
            {t('widgets.muscleBalance.caption')}
          </Text>
          <View className="mt-4 gap-2">
            {focus.slice(0, 3).map(item => (
              <View key={item.name} className="flex-row items-center gap-2">
                <Text className="t-caption w-20 text-cream" numberOfLines={1}>
                  {item.name}
                </Text>
                <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <View
                    className="h-full rounded-full bg-accent-honey"
                    style={{ width: `${Math.max(8, item.share * 100)}%` }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
        <View className="w-[112px] flex-row items-center justify-center">
          <BodyPartHighlighter
            border="rgba(243, 238, 226, 0.36)"
            defaultFill="rgba(243, 238, 226, 0.10)"
            defaultStroke="rgba(243, 238, 226, 0.18)"
            highlights={bodyHighlights}
            scale={0.48}
            view="front"
          />
          <BodyPartHighlighter
            border="rgba(243, 238, 226, 0.36)"
            defaultFill="rgba(243, 238, 226, 0.10)"
            defaultStroke="rgba(243, 238, 226, 0.18)"
            highlights={bodyHighlights}
            scale={0.48}
            view="back"
          />
        </View>
      </View>
    </Card>
  );
}
