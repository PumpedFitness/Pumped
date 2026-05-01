import {useMemo, useState} from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Sparkline} from '../components/Sparkline';
import {YearHeatmap} from '../components/YearHeatmap';
import {Icons, SvgIcon} from '../components/IconButton';
import {colors} from '../theme/tokens';
import {withUniwind} from "uniwind";

const liftData = [
  {label: 'Bench', value: '235', delta: '+15', data: [195, 200, 197, 205, 210, 208, 215, 220, 195, 222, 228, 235]},
  {label: 'Squat', value: '315', delta: '+10', data: [270, 275, 280, 278, 285, 290, 288, 295, 300, 295, 308, 315]},
  {label: 'Dead.', value: '385', delta: '+5', data: [340, 345, 350, 355, 360, 358, 365, 370, 365, 375, 380, 385]},
];

const ranges = ['1M', '3M', '6M', '1Y', 'ALL'];

const recentPRs = [
  {name: 'Bench Press', detail: '235 lb x 1 · est. 1RM', when: '2D AGO', highlight: true},
  {name: 'Squat', detail: '315 lb x 3 · volume PR', when: '5D AGO', highlight: true},
  {name: 'Deadlift', detail: '385 lb x 1', when: '2W AGO', highlight: false},
];

export function ProgressScreen() {
  const [lift, setLift] = useState('Bench');
  const [range, setRange] = useState('3M');

  const StyledSafeAreaView = withUniwind(SafeAreaView)

  const heatmap = useMemo(() => {
    const map = new Map<string, number>();
    const today = new Date();
    for (let i = 0; i < 26 * 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dow = d.getDay();
      const seed = (i * 9301 + 49297) % 233280;
      const r = seed / 233280;
      let v = 0;
      if (dow !== 0 && r > 0.32) v = r > 0.85 ? 4 : r > 0.7 ? 3 : r > 0.5 ? 2 : 1;
      if (i < 14 && dow !== 0 && r > 0.2) v = Math.max(v, 2);
      if (v > 0) map.set(d.toISOString().slice(0, 10), v);
    }
    return map;
  }, []);

  return (
    <StyledSafeAreaView className='flex-1 bg-background'>
      <ScrollView className="flex-1 px-4 pt-2">
        {/* Sparkline trio */}
        <View className="flex-row rounded-sm overflow-hidden mb-5 border border-border">
          {liftData.map((s, i) => {
            const isActive = lift === s.label || (lift === 'Deadlift' && s.label === 'Dead.');
            return (
              <Pressable
                key={s.label}
                onPress={() => setLift(s.label === 'Dead.' ? 'Deadlift' : s.label)}
                className={`flex-1 p-3 ${i > 0 ? 'border-l border-border' : ''} ${isActive ? 'bg-surface-hover border-t-2 border-t-accent' : 'bg-surface-raised border-t-2 border-t-transparent'}`}>
                <Text className="eyebrow mb-1.5">{s.label} · 1RM</Text>
                <View className="flex-row items-baseline justify-between gap-1.5 mb-1">
                  <Text className="font-mono text-xl font-semibold text-foreground">{s.value}</Text>
                  <Text className="mono-sm text-accent">{s.delta}</Text>
                </View>
                <Sparkline data={s.data} width={104} height={22} />
              </Pressable>
            );
          })}
        </View>

        {/* Range selector */}
        <View className="flex-row self-start rounded-sm overflow-hidden mb-3 border border-border">
          {ranges.map((r, i) => (
            <Pressable key={r} onPress={() => setRange(r)} className={`py-1.5 px-3 ${i > 0 ? 'border-l border-border' : ''} ${range === r ? 'bg-surface-hover' : 'bg-surface-raised'}`}>
              <Text className={`mono-sm ${range === r ? 'text-foreground' : 'text-muted'}`}>{r}</Text>
            </Pressable>
          ))}
        </View>

        {/* Legend */}
        <View className="flex-row items-center gap-3.5 mb-6">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-0.5 rounded-sm bg-accent" />
            <Text className="eyebrow">This cycle</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2.5 h-0.5 rounded-sm bg-muted" />
            <Text className="eyebrow">Previous</Text>
          </View>
        </View>

        {/* Heatmap */}
        <View className="flex-row justify-between mb-2">
          <Text className="eyebrow">Activity</Text>
          <Text className="eyebrow text-foreground-secondary">52 sessions · 12-day streak</Text>
        </View>
        <View className="mb-6">
          <YearHeatmap data={heatmap} weeks={26} cellSize={11} gap={3} />
        </View>

        {/* Recent PRs */}
        <Text className="eyebrow mb-2">Recent PRs</Text>
        <View className="rounded-md overflow-hidden mb-6 bg-surface-raised border border-border">
          {recentPRs.map((pr, i) => (
            <View key={pr.name} className={`flex-row items-center gap-3 min-h-14 px-4 py-3 ${i > 0 ? 'border-t border-border-soft' : ''}`}>
              <View className={`w-8 h-8 rounded-sm items-center justify-center ${pr.highlight ? 'bg-accent' : 'bg-surface-hover border border-border'}`}>
                <SvgIcon d={Icons.bolt} size={16} color={pr.highlight ? colors.accentForeground : colors.textMuted} strokeWidth={2.5} />
              </View>
              <View className="flex-1">
                <Text className="body-text">{pr.name}</Text>
                <Text className="body-sub mt-0.5">{pr.detail}</Text>
              </View>
              <Text className="mono-sm text-muted">{pr.when}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </StyledSafeAreaView>
  );
}
