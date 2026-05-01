import {useState, useEffect} from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button} from 'heroui-native';
import {AppView} from '../components/AppView';
import {AppBar} from '../components/AppBar';
import {IconButton, Icons, SvgIcon} from '../components/IconButton';
import {SyncStatus} from '../components/SyncStatus';
import {Stepper} from '../components/Stepper';
import {Badge} from '../components/Badge';
import {colors} from '../theme/tokens';

type SetRowProps = {
  index: number;
  weight: number;
  reps: number;
  state: 'done' | 'active' | 'pending';
};

function SetRow({index, weight, reps, state}: SetRowProps) {
  return (
    <View className={`flex-row items-center gap-2 rounded-sm mt-1 p-2.5 px-3 ${state === 'active' ? 'bg-surface-hover border border-accent' : ''}`}>
      <Text className={`w-8 mono-sm ${state === 'active' ? 'text-accent' : 'text-muted'}`}>{index}</Text>
      <View className="flex-1 flex-row items-baseline gap-1">
        <Text className="mono-value">{weight}</Text>
        <Text className="eyebrow">lb</Text>
      </View>
      <View className="flex-1 flex-row items-baseline gap-1">
        <Text className="mono-value">{reps}</Text>
        <Text className="eyebrow">reps</Text>
      </View>
      {state === 'done' ? (
        <View className="w-11 h-11 items-center justify-center">
          <SvgIcon d={Icons.check} size={18} color={colors.accent} strokeWidth={3} />
        </View>
      ) : state === 'active' ? (
        <Badge variant="accent">NOW</Badge>
      ) : null}
    </View>
  );
}

type NumChipProps = {
  children: number;
};

function NumChip({children}: NumChipProps) {
  return (
    <View className="w-7 h-7 rounded-sm items-center justify-center border border-border">
      <Text className="mono-sm text-muted">{children}</Text>
    </View>
  );
}

export function ActiveWorkoutScreen() {
  const navigation = useNavigation();
  const [weight, setWeight] = useState(185);
  const [reps, setReps] = useState(8);
  const [rest, setRest] = useState(73);

  useEffect(() => {
    const t = setInterval(() => setRest(r => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const restMin = Math.floor(rest / 60);
  const restSec = String(rest % 60).padStart(2, '0');

  return (
    <AppView>
      <AppBar
        eyebrow="28:14"
        title="Push Day"
        leading={<IconButton icon={Icons.x} label="End workout" onPress={() => navigation.goBack()} />}
        trailing={<SyncStatus state="syncing" />}
      />

      {/* Rest timer */}
      <View className="flex-row items-center justify-between py-2.5 px-4 bg-surface-raised border-b border-border">
        <View className="flex-row items-center gap-2.5">
          <Text className="eyebrow">Rest</Text>
          <Text className="mono-value">{restMin}:{restSec}</Text>
        </View>
        <View className="flex-row gap-1">
          <Pressable onPress={() => setRest(r => r + 15)} className="px-2.5 h-7 items-center justify-center rounded-sm">
            <Text className="text-foreground-secondary text-sm font-semibold">+15s</Text>
          </Pressable>
          <Pressable onPress={() => setRest(0)} className="px-2.5 h-7 items-center justify-center rounded-sm">
            <Text className="text-foreground-secondary text-sm font-semibold">Skip</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-3">
        {/* Current exercise */}
        <View className="rounded-md mb-3 overflow-hidden bg-surface-raised border border-border-strong">
          <View className="p-3.5 pb-1 flex-row justify-between">
            <View>
              <Text className="eyebrow mb-1">Exercise 2 of 5</Text>
              <Text className="heading-md">Bench Press</Text>
              <Text className="body-sub font-mono mt-0.5">3 x 8 · 185 lb target</Text>
            </View>
            <IconButton icon={Icons.more} label="More" />
          </View>

          <View className="px-4 pt-2 pb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="eyebrow">Set 3</Text>
              <Text className="eyebrow">Last: 8 x 185 lb</Text>
            </View>
            <View className="flex-row gap-2.5">
              <View className="flex-1"><Stepper value={weight} onChange={setWeight} step={5} unit="lb" label="Weight" /></View>
              <View className="flex-1"><Stepper value={reps} onChange={setReps} step={1} unit="reps" label="Reps" min={1} /></View>
            </View>
            <View className="mt-3">
              <Button variant="primary" size="lg" className="w-full rounded-sm">
                <Button.Label>Log set</Button.Label>
              </Button>
            </View>
          </View>

          <View className="px-3 pb-3 border-t border-border-soft">
            <View className="flex-row justify-between p-1 py-2">
              <Text className="eyebrow">Sets</Text>
            </View>
            <SetRow index={1} weight={185} reps={8} state="done" />
            <SetRow index={2} weight={185} reps={8} state="done" />
            <SetRow index={3} weight={weight} reps={reps} state="active" />
          </View>
        </View>

        {/* Up next */}
        <Text className="eyebrow px-1 py-2 mt-1">Up next</Text>
        <View className="rounded-md mb-6 overflow-hidden bg-surface-raised border border-border">
          {[
            {name: 'Incline Dumbbell Press', meta: '3 x 10 · 60 lb', num: 3},
            {name: 'Cable Fly', meta: '3 x 12 · 30 lb', num: 4},
            {name: 'Tricep Pushdown', meta: '4 x 12 · 50 lb', num: 5},
          ].map((ex, i) => (
            <View key={ex.name} className={`flex-row items-center gap-3 min-h-14 px-4 py-3 ${i > 0 ? 'border-t border-border-soft' : ''}`}>
              <NumChip>{ex.num}</NumChip>
              <View className="flex-1">
                <Text className="body-text">{ex.name}</Text>
                <Text className="body-sub font-mono mt-0.5">{ex.meta}</Text>
              </View>
              <SvgIcon d={Icons.chevronRight} size={16} color={colors.textMuted} />
            </View>
          ))}
        </View>
      </ScrollView>
    </AppView>
  );
}
