import {View, Text, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AppView} from '../components/AppView';
import {AppBar} from '../components/AppBar';
import {IconButton, Icons, SvgIcon} from '../components/IconButton';
import {Stat} from '../components/Stat';
import {Badge} from '../components/Badge';
import {colors} from '../theme/tokens';

type ExerciseSummaryProps = {
  name: string;
  order: number;
  sets: {w: number; r: number; pr?: boolean}[];
};

function ExerciseSummary({name, order, sets}: ExerciseSummaryProps) {
  return (
    <View className="rounded-md overflow-hidden bg-surface-raised border border-border">
      <View className="p-3 px-3.5 flex-row items-center justify-between border-b border-border-soft">
        <View className="flex-row items-center gap-2.5">
          <View className="w-7 h-7 rounded-sm items-center justify-center border border-border">
            <Text className="mono-sm text-muted">{order}</Text>
          </View>
          <View>
            <Text className="text-[15px] font-semibold text-foreground">{name}</Text>
            <Text className="body-sub font-mono mt-0.5">
              {sets.length} sets · {sets.reduce((a, s) => a + s.w * s.r, 0).toLocaleString()} lb total
            </Text>
          </View>
        </View>
      </View>
      <View className="p-2 px-3 pb-3">
        {sets.map((s, i) => (
          <View key={i} className={`flex-row items-center gap-2 p-2 ${i > 0 ? 'mt-1' : ''}`}>
            <Text className="w-8 mono-sm text-muted">{i + 1}</Text>
            <View className="flex-1 flex-row items-baseline gap-1">
              <Text className="mono-value">{s.w}</Text>
              <Text className="eyebrow">lb</Text>
            </View>
            <View className="flex-1 flex-row items-baseline gap-1">
              <Text className="mono-value">{s.r}</Text>
              <Text className="eyebrow">reps</Text>
            </View>
            {s.pr ? <Badge variant="accent">PR</Badge> : <SvgIcon d={Icons.check} size={16} color={colors.textMuted} />}
          </View>
        ))}
      </View>
    </View>
  );
}

export function HistoryDetailScreen() {
  const navigation = useNavigation();

  return (
    <AppView>
      <AppBar
        title="Push Day"
        eyebrow="WED · APR 22"
        leading={<IconButton icon={Icons.arrowLeft} label="Back" onPress={() => navigation.goBack()} />}
        trailing={
          <View className="flex-row">
            <IconButton icon={Icons.edit} label="Edit" />
            <IconButton icon={Icons.more} label="More" />
          </View>
        }
      />

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Stats grid */}
        <View className="flex-row rounded-sm overflow-hidden mb-5 border border-border">
          {[
            {label: 'Duration', value: '52:08'},
            {label: 'Volume', value: '14,420'},
            {label: 'Sets', value: '15'},
          ].map((s, i) => (
            <View key={s.label} className={`flex-1 p-3.5 px-3 bg-surface-raised ${i > 0 ? 'border-l border-border' : ''}`}>
              <Stat label={s.label} value={s.value} />
            </View>
          ))}
        </View>

        {/* PR callout */}
        <View className="flex-row items-center gap-2.5 p-2.5 px-3 rounded-sm mb-5 border border-accent bg-accent-soft">
          <SvgIcon d={Icons.bolt} size={16} color={colors.accent} />
          <Text className="eyebrow text-accent">Personal Record</Text>
          <Text className="text-[13px] text-foreground flex-1">Bench Press · 195 lb x 6</Text>
        </View>

        {/* Exercises */}
        <View className="gap-3.5">
          <ExerciseSummary name="Bench Press" order={1} sets={[{w: 185, r: 8}, {w: 185, r: 8}, {w: 195, r: 6, pr: true}]} />
          <ExerciseSummary name="Incline Dumbbell Press" order={2} sets={[{w: 60, r: 10}, {w: 60, r: 10}, {w: 60, r: 9}]} />
          <ExerciseSummary name="Cable Fly" order={3} sets={[{w: 30, r: 12}, {w: 30, r: 12}, {w: 35, r: 10}]} />
          <ExerciseSummary name="Tricep Pushdown" order={4} sets={[{w: 50, r: 12}, {w: 50, r: 12}, {w: 50, r: 11}, {w: 45, r: 12}]} />
        </View>

        {/* Notes */}
        <View className="mt-5 p-3 px-3.5 rounded-sm mb-6 border border-dashed border-border-strong">
          <Text className="eyebrow mb-1.5">Notes</Text>
          <Text className="text-sm text-foreground-secondary leading-relaxed">
            Felt strong on bench. Cable fly form check — last set was sloppy.
          </Text>
        </View>
      </ScrollView>
    </AppView>
  );
}
